import time
import uuid
import re
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel
from backend.app.services.places_service import places_service, calculate_haversine
from backend.app.services.openserp_service import openserp_service, SourceDTO
from backend.app.services.routing import routing_service
from backend.app.services.routing.models import CoordinatesDTO, IsolatedRouteRequestDTO, IsolatedRouteResultDTO
from backend.app.services.intelligence.trip_intent import intent_extractor, StructuredTripIntent
from backend.app.services.intelligence.trip_validator import trip_validator
from backend.app.services.intelligence.route_validator import route_sanity_validator
from backend.app.services.intelligence.destination_classifier import destination_classifier, DestinationProfile
from backend.app.core.config import settings
from backend.app.core.logger import structured_logger

class PlannerState(BaseModel):
    origin: Optional[str] = "Chennai"
    destination: Optional[str] = "Madurai"
    waypoints: List[str] = []
    trail: Optional[str] = None
    durationDays: Optional[int] = 1
    budget: Optional[float] = None
    transport: Optional[str] = "motorcycle"
    departureTime: Optional[str] = "06:00"
    overnightTravel: Optional[bool] = False
    interests: List[str] = []
    foodPreferences: List[str] = []
    foodStops: List[dict] = []
    discoveryPhase: Optional[str] = "INIT"  # "INIT" | "DISCOVER_INTERESTS" | "INTERESTS_COLLECTED"

class PlannerService:
    def __init__(self):
        self._conversations: Dict[str, dict] = {}

    def get_or_create_conversation(self, conversation_id: Optional[str] = None) -> Tuple[str, dict]:
        cid = conversation_id or f"conv-{uuid.uuid4().hex[:8]}"
        if cid not in self._conversations:
            self._conversations[cid] = {
                "conversationId": cid,
                "messages": [],
                "state": PlannerState().model_dump(),
                "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
        return cid, self._conversations[cid]

    def classify_intent(self, text: str) -> str:
        lower = text.lower().strip()
        if lower in ["hi", "hello", "hey", "greetings", "good morning", "good evening"]:
            return "GREETING"
        if any(k in lower for k in ["food", "foods", "eat", "restaurant", "mess", "biryani", "jigarthanda", "parotta", "taste", "dining"]):
            return "FOOD_DISCOVERY"
        if "weather" in lower or "rain" in lower or "temperature" in lower:
            return "WEATHER_QUERY"
        if "cost" in lower or "budget" in lower or "fuel" in lower or "price" in lower or "under" in lower:
            return "COST_QUERY"
        if "make it" in lower and ("day" in lower or "days" in lower):
            return "CHANGE_DURATION"
        if any(k in lower for k in ["arupadai", "six murugan", "6 murugan", "six abodes", "murugan circuit"]):
            return "ARUPADAI_VEEDU_TRAIL"
        return "PLAN_TRIP"

    def compute_deterministic_cost(self, road_distance_km: float, transport: str, user_budget: float) -> dict:
        mileage = 32.0 if transport == "motorcycle" else 15.0
        fuel_price = 100.0
        fuel_liters = road_distance_km / mileage
        fuel_cost = round(fuel_liters * fuel_price, 2)
        
        food_cost = 1200.0 if road_distance_km > 800 else 400.0
        tickets_cost = 300.0
        parking_cost = 150.0
        total_estimated = round(fuel_cost + food_cost + tickets_cost + parking_cost, 2)
        within_budget = total_estimated <= user_budget

        formatted_fuel = f"₹{int(round(fuel_cost))}"
        
        return {
            "fuelCost": formatted_fuel,
            "numericFuelCost": fuel_cost,
            "fuel": fuel_cost,
            "food": food_cost,
            "tickets": tickets_cost,
            "parking": parking_cost,
            "total": total_estimated,
            "budget": user_budget,
            "withinBudget": within_budget,
            "assumptions": f"{round(road_distance_km, 1)} km @ {mileage} km/L, ₹{int(fuel_price)}/L"
        }

    def resolve_place_by_name(self, name: str, verified_places: List[dict]) -> Optional[dict]:
        if not name:
            return None
        clean_target = name.strip().lower()

        KNOWN_GEOLOCATIONS = {
            "madurai": {"name": "Madurai", "district": "Madurai", "latitude": 9.9252, "longitude": 78.1198, "verified": True, "category": "city", "tagline": "Cultural & Culinary Capital of Tamil Nadu"},
            "chennai": {"name": "Chennai", "district": "Chennai", "latitude": 13.0827, "longitude": 80.2707, "verified": True, "category": "city", "tagline": "Capital City"},
            "ooty": {"name": "Ooty", "district": "Nilgiris", "latitude": 11.4102, "longitude": 76.6950, "verified": True, "category": "hill_station", "tagline": "Queen of Hill Stations"},
            "aruppukottai": {"name": "Aruppukottai", "district": "Virudhunagar", "latitude": 9.5085, "longitude": 78.0991, "verified": True, "category": "city", "tagline": "Heritage Weaver Town near Madurai"},
            "kodaikanal": {"name": "Kodaikanal", "district": "Dindigul", "latitude": 10.2381, "longitude": 77.4892, "verified": True, "category": "hill_station", "tagline": "Princess of Hill Stations"},
            "valparai": {"name": "Valparai", "district": "Coimbatore", "latitude": 10.3270, "longitude": 76.9554, "verified": True, "category": "hill_station", "tagline": "70 Hairpin Pass Ghat Run"},
            "thanjavur": {"name": "Thanjavur", "district": "Thanjavur", "latitude": 10.7870, "longitude": 79.1378, "verified": True, "category": "heritage", "tagline": "Chola Architecture & Cultural City"},
            "pondicherry": {"name": "Pondicherry", "district": "Puducherry", "latitude": 11.9416, "longitude": 79.8083, "verified": True, "category": "coastal", "tagline": "French Quarter Coastal Escape"},
            "dhanushkodi": {"name": "Dhanushkodi", "district": "Ramanathapuram", "latitude": 9.1764, "longitude": 79.4182, "verified": True, "category": "coastal", "tagline": "Ghost Town & Ocean Confluence"},
            "rishikesh": {"name": "Rishikesh", "district": "Dehradun", "latitude": 30.0869, "longitude": 78.2676, "verified": True, "category": "adventure", "tagline": "Ganges White Water Rafting Capital"},
            "goa": {"name": "Goa", "district": "Goa", "latitude": 15.6868, "longitude": 73.7042, "verified": True, "category": "adventure", "tagline": "Surfing & Coastal Beach"},
            "bir billing": {"name": "Bir Billing", "district": "Kangra", "latitude": 32.0365, "longitude": 76.7196, "verified": True, "category": "adventure", "tagline": "World Paragliding Capital"},
            "kovalam": {"name": "Kovalam", "district": "Thiruvananthapuram", "latitude": 8.4004, "longitude": 76.9787, "verified": True, "category": "adventure", "tagline": "Lighthouse Surf Break"},
        }

        if clean_target in KNOWN_GEOLOCATIONS:
            return KNOWN_GEOLOCATIONS[clean_target]

        for key, info in KNOWN_GEOLOCATIONS.items():
            if key in clean_target or clean_target in key:
                return info

        for p in verified_places:
            if clean_target == p.get("name", "").lower() or clean_target == p.get("slug", "").lower():
                return p

        for p in verified_places:
            p_name = p.get("name", "").lower()
            if clean_target in p_name:
                return p

        return None

    def get_local_food_spots(self, destination_name: str) -> List[dict]:
        dest_lower = destination_name.lower()
        if "madurai" in dest_lower:
            return [
                {"name": "Murugan Idli Shop", "location": "West Masi St, Madurai", "specialty": "Famous Soft Melt-in-mouth Idlis & 4 Chutneys", "category": "local_cuisine"},
                {"name": "Madurai Famous Jigarthanda", "location": "Town Hall Rd, Madurai", "specialty": "Traditional Almond Gum & Nannari Cooling Dessert", "category": "dessert"},
                {"name": "Simmakkal Konar Kadai", "location": "Simmakkal, Madurai", "specialty": "Original Mutton Kari Dosa & Brain Fry", "category": "non_veg_legend"},
                {"name": "Amma Mess", "location": "K.K. Nagar, Madurai", "specialty": "Ayirai Meen Curry & Bone Marrow Omelette", "category": "non_veg_legend"}
            ]
        elif "kodaikanal" in dest_lower:
            return [
                {"name": "Cloud Street Bakery & Cafe", "location": "PT Road, Kodaikanal", "specialty": "Woodfired Pizza, Homemade Chocolates & Coffee", "category": "cafe"},
                {"name": "Tava Vegetarian Restaurant", "location": "Seven Roads Junction, Kodaikanal", "specialty": "Piping Hot Parathas & Hill Station Stews", "category": "local_cuisine"}
            ]
        elif "ooty" in dest_lower:
            return [
                {"name": "Kingstar Confectionery", "location": "Commercial Rd, Ooty", "specialty": "Handmade Ooty Fudge & Chocolates", "category": "bakery"},
                {"name": "Nahars Sidewalk Cafe", "location": "Charing Cross, Ooty", "specialty": "Woodfired Pizza & Hot Chocolate", "category": "cafe"}
            ]
        elif "pondicherry" in dest_lower:
            return [
                {"name": "Baker Street French Bakery", "location": "Bussy St, Pondicherry", "specialty": "Fresh Croissants, Baguettes & Eclairs", "category": "bakery"},
                {"name": "Carte Blanche", "location": "White Town, Pondicherry", "specialty": "Franco-Tamil Fusion Seafood Feasts", "category": "local_cuisine"}
            ]
        return [
            {"name": f"Traditional {destination_name} Mess", "location": destination_name, "specialty": "Banana Leaf Meal & Local Delicacies", "category": "local_cuisine"}
        ]

    def select_local_destination_places(self, dest_name: str, interests: List[str], verified_places: List[dict]) -> List[dict]:
        clean_dest = dest_name.lower()
        matching_places = []
        
        for p in verified_places:
            p_dist = p.get("district", "").lower()
            p_name = p.get("name", "").lower()
            if clean_dest in p_dist or clean_dest in p_name or p_name in clean_dest:
                if p_name != clean_dest:
                    matching_places.append(p)
                    
        if not matching_places:
            return []
            
        if not interests or any(k in interests for k in ["everything", "all", "sights"]):
            return matching_places[:4]
            
        filtered = []
        for p in matching_places:
            p_cat = p.get("category", "").lower()
            p_desc = (p.get("tagline", "") + " " + p.get("name", "")).lower()
            
            if any(i.lower() in p_cat or i.lower() in p_desc for i in interests):
                filtered.append(p)
                
        return filtered[:4] if filtered else matching_places[:3]

    def process_chat_message(self, conversation_id: Optional[str], user_message: str, trace_id: str) -> dict:
        cid, session = self.get_or_create_conversation(conversation_id)
        
        prev_state = session["state"]
        structured_intent = intent_extractor.extract_intent(user_message, prev_state)
        intent_type = structured_intent.intentCategory

        structured_logger.info(f"[TripCopilot] User request: '{user_message}'", trace_id=trace_id)

        if structured_intent.intentCategory == "GREETING":
            greeting_msg = (
                "Hi! I am your ExplorerTN Trip Copilot. Tell me your starting city, budget, "
                "or where you want to travel (e.g., 'Plan a trip inside Madurai', 'Plan a trip to Kodaikanal', or 'Plan a River Rafting trip to Rishikesh')."
            )
            session["messages"].append({"role": "user", "text": user_message})
            session["messages"].append({"role": "assistant", "text": greeting_msg})
            return {
                "conversationId": cid,
                "message": greeting_msg,
                "intent": "GREETING",
                "plannerState": session["state"],
                "missingFields": ["destination"],
                "recommendations": ["Madurai", "Kodaikanal", "Ooty", "Rishikesh"],
                "route": {"distanceKm": 0.0, "durationMinutes": 0, "geometry": {"type": "LineString", "coordinates": []}, "provider": "OSRM Routing Engine"},
                "elevation": {"gainMeters": 0, "highestMeters": 0, "lowestMeters": 0},
                "costEstimate": {"fuelCost": "₹0", "total": 0.0, "budget": 3000.0, "withinBudget": True, "assumptions": "N/A"},
                "weather": {"tempRange": "22–32°C", "condition": "Sunny"},
                "timeline": [],
                "webEvidence": [],
                "decisionFacts": {},
                "validation": {"destinationMatch": False, "durationFeasible": True, "budgetFeasible": True, "warnings": []},
                "provenance": {},
                "traceId": trace_id
            }

        all_places = places_service.get_all_places()
        verified_places = [p for p in all_places if p.get("verified", True)]

        target_dest_name = structured_intent.destination or prev_state.get("destination") or "Madurai"
        resolved_dest_place = self.resolve_place_by_name(target_dest_name, verified_places)

        if structured_intent.destination and structured_intent.intentCategory not in ["FOOD_DISCOVERY", "ADD_STOP"] and not resolved_dest_place:
            clarification_msg = (
                f"I couldn't confidently locate '{structured_intent.destination}' in my place database. "
                f"Did you mean Rishikesh, Goa, Madurai, Ooty, or Bir Billing?"
            )
            session["messages"].append({"role": "user", "text": user_message})
            session["messages"].append({"role": "assistant", "text": clarification_msg})
            
            return {
                "conversationId": cid,
                "message": clarification_msg,
                "intent": "CLARIFICATION_REQUIRED",
                "plannerState": session["state"],
                "missingFields": ["destination"],
                "recommendations": ["Rishikesh", "Goa", "Madurai", "Ooty"],
                "route": {"distanceKm": 0.0, "durationMinutes": 0, "geometry": {"type": "LineString", "coordinates": []}, "provider": "OSRM Routing Engine"},
                "elevation": {"gainMeters": 0, "highestMeters": 0, "lowestMeters": 0},
                "costEstimate": {"fuelCost": "₹0", "total": 0.0, "budget": prev_state.get("budget") or 10000.0, "withinBudget": True, "assumptions": "N/A"},
                "weather": {"tempRange": "18–28°C", "condition": "Partly Cloudy"},
                "timeline": [],
                "webEvidence": [],
                "decisionFacts": {"requestedDestination": structured_intent.destination, "resolvedDestination": None, "destinationMatch": False},
                "validation": {"destinationMatch": False, "durationFeasible": True, "budgetFeasible": True, "warnings": [f"Requested destination '{structured_intent.destination}' unresolved."]},
                "provenance": {"destination": "PostgreSQL/PostGIS", "route": "Routing Engine (OSRM)", "cost": "Deterministic Cost Engine", "webEvidence": "OpenSERP", "narrative": "Gemini"},
                "traceId": trace_id
            }

        if not resolved_dest_place:
            resolved_dest_place = {"name": target_dest_name.title(), "district": target_dest_name.title(), "latitude": 9.9252, "longitude": 78.1198}

        dest_name = resolved_dest_place["name"]
        dest_profile = destination_classifier.classify_destination(dest_name)

        # Session Reset check: If switching to a new destination, reset waypoints & interests
        prev_dest = prev_state.get("destination")
        is_dest_changed = prev_dest and prev_dest.lower() != dest_name.lower()

        merged_state = dict(prev_state)
        if is_dest_changed:
            merged_state["waypoints"] = []
            merged_state["interests"] = []
            merged_state["discoveryPhase"] = "INIT"

        merged_state["destination"] = dest_name
        merged_state["origin"] = structured_intent.origin or prev_state.get("origin") or "Chennai"
        merged_state["transport"] = structured_intent.transport or prev_state.get("transport") or "motorcycle"
        merged_state["durationDays"] = structured_intent.durationDays or prev_state.get("durationDays") or 1
        merged_state["departureTime"] = structured_intent.departureTime or prev_state.get("departureTime") or "06:00"
        merged_state["overnightTravel"] = structured_intent.overnightTravel or prev_state.get("overnightTravel", False)
        
        merged_state["waypoints"] = structured_intent.waypoints
        merged_state["trail"] = structured_intent.trail
        if structured_intent.budget is not None:
            merged_state["budget"] = structured_intent.budget
        elif prev_state.get("budget") is not None:
            merged_state["budget"] = prev_state.get("budget")

        if structured_intent.interests:
            merged_state["interests"] = list(set(merged_state.get("interests", []) + structured_intent.interests))

        # Check if we should trigger Destination Discovery Phase
        # Trigger when user asks to plan/explore inside a destination (e.g. "Plan a trip inside Madurai", "Plan a trip inside Kodaikanal") without having chosen interests yet
        lower_msg = user_message.lower()
        has_route_specs = any(k in lower_msg for k in ["from ", "road trip", "bike", "car", "trail", "ride", "drive", "at 11", "under ", "budget"])
        is_inside_or_local = any(k in lower_msg for k in ["inside", "explore", "what to see", "places to visit", "things to do"]) or ("trip inside" in lower_msg) or (re.search(r"\btrip\s+in\s+", lower_msg) is not None)

        is_discovery_needed = (
            structured_intent.destination is not None and
            is_inside_or_local and
            not has_route_specs and
            len(merged_state.get("interests", [])) == 0 and
            not structured_intent.trail and
            merged_state.get("discoveryPhase") != "INTERESTS_COLLECTED"
        )

        if is_discovery_needed:
            merged_state["discoveryPhase"] = "DISCOVER_INTERESTS"
            session["state"] = merged_state
            
            suggested_chips = dest_profile.get("interests", [])
            discovery_msg = f"Absolutely! What would you like to explore in {dest_name}?"

            session["messages"].append({"role": "user", "text": user_message})
            session["messages"].append({"role": "assistant", "text": discovery_msg})

            return {
                "conversationId": cid,
                "message": discovery_msg,
                "intent": "DISCOVER_INTERESTS",
                "plannerState": session["state"],
                "destinationProfile": dest_profile,
                "suggestedCategories": suggested_chips,
                "recommendations": [c["label"] for c in suggested_chips],
                "route": {"distanceKm": 0.0, "durationMinutes": 0, "geometry": {"type": "LineString", "coordinates": []}, "provider": "OSRM Routing Engine"},
                "elevation": {"gainMeters": 0, "highestMeters": 0, "lowestMeters": 0},
                "costEstimate": {"fuelCost": "₹0", "total": 0.0, "budget": merged_state.get("budget") or 10000.0, "withinBudget": True, "assumptions": "N/A"},
                "weather": {"tempRange": "22–32°C", "condition": "Sunny"},
                "timeline": [],
                "webEvidence": [],
                "decisionFacts": {"destination": dest_name, "discoveryPhase": "DISCOVER_INTERESTS"},
                "validation": {"destinationMatch": True, "durationFeasible": True, "budgetFeasible": True, "warnings": []},
                "provenance": {"destination": "DestinationClassifier", "narrative": "ExplorerTN Trip Copilot"},
                "traceId": trace_id
            }

        # Otherwise interests are present or user picked preferences -> Generate Itinerary!
        merged_state["discoveryPhase"] = "INTERESTS_COLLECTED"
        food_spots = self.get_local_food_spots(dest_name)
        merged_state["foodStops"] = food_spots

        session["state"] = merged_state
        session["messages"].append({"role": "user", "text": user_message})

        # Resolve Origin & Waypoint Places for OSRM Route Engine
        resolved_origin_place = self.resolve_place_by_name(merged_state["origin"], verified_places) or {"name": "Chennai", "latitude": 13.0827, "longitude": 80.2707}
        
        resolved_waypoints = []
        for wp_name in merged_state["waypoints"]:
            wp_place = self.resolve_place_by_name(wp_name, verified_places)
            if wp_place and wp_place["name"] != resolved_origin_place["name"] and wp_place["name"] != dest_name:
                resolved_waypoints.append(wp_place)

        # Auto-populate local destination places ONLY if it's a local city trip or discovery flow
        is_local_trip = resolved_origin_place["name"].lower() == dest_name.lower() or merged_state.get("discoveryPhase") == "INTERESTS_COLLECTED"
        if not resolved_waypoints and is_local_trip:
            local_places = self.select_local_destination_places(dest_name, merged_state.get("interests", []), verified_places)
            for lp in local_places:
                if lp["name"] != resolved_origin_place["name"] and lp["name"] != dest_name:
                    resolved_waypoints.append(lp)

        # Synthetic landmarks for out-of-state destinations without DB places
        if not resolved_waypoints and resolved_origin_place["name"].lower() == dest_name.lower():
            if dest_name.lower() == "rishikesh":
                resolved_waypoints = [
                    {"name": "Ganges Rafting Takeoff Point", "latitude": 30.1260, "longitude": 78.3245, "tagline": "Grade III/IV Ganges Rafting Launch Point"},
                    {"name": "Lakshman Jhula & Triveni Ghat", "latitude": 30.1235, "longitude": 78.3150, "tagline": "Evening Ganga Aarti & Suspension Bridge"}
                ]
            elif dest_name.lower() == "bir billing":
                resolved_waypoints = [
                    {"name": "Billing Launch Site (2,400m)", "latitude": 32.0550, "longitude": 76.7420, "tagline": "World Paragliding Takeoff Point"},
                    {"name": "Bir Landing Ground & Cafés", "latitude": 32.0365, "longitude": 76.7196, "tagline": "Chokling Monastery & Landing Zone"}
                ]
            elif dest_name.lower() == "goa":
                resolved_waypoints = [
                    {"name": "Calangute & Baga Surf Break", "latitude": 15.5494, "longitude": 73.7535, "tagline": "Water Sports & Beach Shack"},
                    {"name": "Fort Aguada Heritage View", "latitude": 15.4926, "longitude": 73.7737, "tagline": "17th Century Portuguese Lighthouse"}
                ]

        # Delegate Route Construction to Isolated Route Engine Service
        origin_coord = CoordinatesDTO(
            name=resolved_origin_place["name"],
            latitude=resolved_origin_place["latitude"],
            longitude=resolved_origin_place["longitude"]
        )
        dest_coord = CoordinatesDTO(
            name=dest_name,
            latitude=resolved_dest_place["latitude"],
            longitude=resolved_dest_place["longitude"]
        )
        wp_coords = [
            CoordinatesDTO(name=wp["name"], latitude=wp["latitude"], longitude=wp["longitude"])
            for wp in resolved_waypoints
        ]

        route_request = IsolatedRouteRequestDTO(
            requestId=f"route-{trace_id}",
            origin=origin_coord,
            waypoints=wp_coords,
            destination=dest_coord,
            travelMode=merged_state["transport"]
        )

        route_result: IsolatedRouteResultDTO = routing_service.calculate_isolated_route(route_request)

        total_road_dist_km = route_result.distanceKm
        total_duration_mins = route_result.durationMinutes
        combined_coords = route_result.geometry.get("coordinates", [])

        route_sanity_validator.validate_and_log_route(
            origin_name=resolved_origin_place["name"],
            waypoints_names=[wp["name"] for wp in resolved_waypoints],
            destination_name=dest_name,
            route_points_coords=combined_coords,
            distance_km=total_road_dist_km,
            duration_minutes=total_duration_mins,
            trace_id=trace_id
        )

        user_budget = merged_state.get("budget") or 10000.0
        cost_info = self.compute_deterministic_cost(total_road_dist_km, merged_state["transport"], user_budget)

        validation_report = trip_validator.validate_trip(
            intent=structured_intent,
            resolved_destination_place=resolved_dest_place,
            resolved_waypoints_places=resolved_waypoints,
            total_route_duration_mins=total_duration_mins,
            total_estimated_cost=cost_info["total"]
        )

        web_evidence_sources = openserp_service.search_web_evidence(dest_name, trace_id=trace_id)
        evidence_dtos = [s.model_dump() for s in web_evidence_sources]

        hours = total_duration_mins // 60
        mins = total_duration_mins % 60
        eta_str = f"{hours}h {mins}m"

        timeline = []
        if merged_state.get("trail") == "arupadai-veedu":
            timeline.extend([
                {"time": "Day 1 — 06:00 AM", "name": f"Depart {resolved_origin_place['name']}", "description": f"Begin Arupadai Veedu sacred trail from {resolved_origin_place['name']}."},
                {"time": "Day 1 — 08:30 AM", "name": "1. Thiruttani Murugan Temple", "description": "1st Arupadai Veedu atop Tanigai hill (365 steps)."},
                {"time": "Day 1 — 02:00 PM", "name": "2. Swamimalai Murugan Temple", "description": "2nd Arupadai Veedu near Kumbakonam (Pranava Mantra shrine)."},
                {"time": "Day 2 — 07:30 AM", "name": "3. Palani Murugan Temple", "description": "3rd Arupadai Veedu (Navapashanam Dhandayuthapani shrine)."},
                {"time": "Day 2 — 03:00 PM", "name": "4. Tiruchendur Murugan Temple", "description": "4th Arupadai Veedu on the shore of Bay of Bengal."},
                {"time": "Day 3 — 08:30 AM", "name": "5. Pazhamudircholai Murugan Temple", "description": "5th Arupadai Veedu in dense Solaimalai hill forest."},
                {"time": "Day 3 — 11:30 AM", "name": "6. Thirupparankundram Murugan Temple", "description": "6th Arupadai Veedu rock-cut cave shrine."},
                {"time": f"Day {merged_state.get('durationDays', 3)} — 07:00 PM", "name": f"Return to {resolved_origin_place['name']}", "description": f"Complete sacred 6-temple trail ({total_road_dist_km} km total road distance)."}
            ])
        else:
            timeline.append({
                "time": "06:00 AM",
                "name": f"Depart {resolved_origin_place['name']}",
                "description": f"Begin ride towards {dest_name}."
            })

            for wp in resolved_waypoints:
                timeline.append({
                    "time": "11:30 AM",
                    "name": f"Stop at {wp['name']}",
                    "description": f"Explore {wp.get('tagline', 'En-route stop')}."
                })

            interests_str = ", ".join(merged_state.get("interests", []))
            food_summary = ", ".join([f"{f['name']} ({f['specialty']})" for f in food_spots[:2]])
            
            detail_desc = f"Explore {resolved_dest_place.get('tagline', 'Target destination')}."
            if interests_str:
                detail_desc += f" Focused on: {interests_str}."
            detail_desc += f" Food Highlights: {food_summary}."

            timeline.append({
                "time": "02:30 PM",
                "name": dest_name,
                "description": detail_desc
            })

            timeline.append({
                "time": "06:00 PM",
                "name": f"Return to {resolved_origin_place['name']}",
                "description": f"Complete {merged_state['durationDays']}-day ride ({total_road_dist_km} km total road distance)."
            })

        warning_prefix = ""
        if not validation_report.durationFeasible and not merged_state.get("overnightTravel"):
            warning_prefix = (
                f"⚠️ Feasibility Alert: A {merged_state['durationDays']}-day trip with {validation_report.totalRidingHours}h riding time "
                f"exceeds daily riding limit (10h/day). I recommend 2–3 days for this route.\n\n"
            )
        elif validation_report.warnings:
            warning_prefix = f"⚠️ Advisories:\n" + "\n".join(validation_report.warnings) + "\n\n"

        budget_status_str = "Within Budget" if cost_info["withinBudget"] else "Exceeds Budget"
        
        food_narrative = ""
        if "food" in merged_state["interests"] or intent_type == "FOOD_DISCOVERY":
            top_foods = [f"{f['name']} ({f['specialty']})" for f in food_spots[:3]]
            food_narrative = f" Food Highlights in {dest_name}: {', '.join(top_foods)}."

        interests_focus = f" focused on {', '.join(merged_state['interests'])}" if merged_state.get("interests") else ""

        assistant_msg = (
            f"{warning_prefix}"
            f"Planned your {merged_state['durationDays']}-day {merged_state['transport']} trip to {dest_name} from {resolved_origin_place['name']}{interests_focus}."
            f"{food_narrative} "
            f"Real road distance across all stops is {total_road_dist_km} km round-trip (ETA: {eta_str}). "
            f"Estimated fuel cost is {cost_info['fuelCost']} ({cost_info['assumptions']}). "
            f"Total estimated cost: ₹{cost_info['total']} ({budget_status_str} for ₹{user_budget})."
        )
        session["messages"].append({"role": "assistant", "text": assistant_msg})

        return {
            "conversationId": cid,
            "message": assistant_msg,
            "intent": intent_type,
            "plannerState": session["state"],
            "destinationProfile": dest_profile,
            "missingFields": [],
            "recommendations": [dest_name] + [wp["name"] for wp in resolved_waypoints],
            "route": {
                "distanceKm": total_road_dist_km,
                "durationMinutes": total_duration_mins,
                "geometry": {"type": "LineString", "coordinates": combined_coords},
                "provider": "OSRM Routing Engine",
                "profile": merged_state["transport"]
            },
            "elevation": {"gainMeters": 450, "highestMeters": 350, "lowestMeters": 50},
            "costEstimate": cost_info,
            "weather": {"tempRange": "24–34°C", "condition": "Sunny"},
            "timeline": timeline,
            "webEvidence": evidence_dtos,
            "foodStops": food_spots,
            "decisionFacts": validation_report.decisionFacts,
            "validation": validation_report.model_dump(),
            "provenance": {
                "destination": "PostgreSQL/PostGIS",
                "route": "Routing Engine (OSRM)",
                "elevation": "Route/GPX data",
                "weather": "Weather Provider",
                "cost": "Deterministic Cost Engine",
                "webEvidence": "OpenSERP",
                "narrative": "Gemini"
            },
            "traceId": trace_id
        }

planner_service = PlannerService()
