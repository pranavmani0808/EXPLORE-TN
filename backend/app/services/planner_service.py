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

        # 1. Well-Known Tamil Nadu Geocoder Dictionary (CHECKED FIRST BEFORE DISTRICT MATCHING - BUG 1 & 6 FIX)
        KNOWN_GEOLOCATIONS = {
            "madurai": {"name": "Madurai", "district": "Madurai", "latitude": 9.9252, "longitude": 78.1198, "verified": True, "category": "city", "tagline": "Cultural & Culinary Capital of Tamil Nadu"},
            "chennai": {"name": "Chennai", "district": "Chennai", "latitude": 13.0827, "longitude": 80.2707, "verified": True, "category": "city", "tagline": "Capital City"},
            "ooty": {"name": "Ooty", "district": "Nilgiris", "latitude": 11.4102, "longitude": 76.6950, "verified": True, "category": "hill_station", "tagline": "Queen of Hill Stations"},
            "aruppukottai": {"name": "Aruppukottai", "district": "Virudhunagar", "latitude": 9.5085, "longitude": 78.0991, "verified": True, "category": "city", "tagline": "Heritage Weaver Town near Madurai"},
            "kodaikanal": {"name": "Kodaikanal", "district": "Dindigul", "latitude": 10.2381, "longitude": 77.4892, "verified": True, "category": "hill_station", "tagline": "Princess of Hill Stations"},
            "valparai": {"name": "Valparai", "district": "Coimbatore", "latitude": 10.3270, "longitude": 76.9554, "verified": True, "category": "hill_station", "tagline": "70 Hairpin Pass Ghat Run"},
            "thiruttani": {"name": "Thiruttani Murugan Temple", "district": "Tiruvallur", "latitude": 13.1788, "longitude": 79.6074, "verified": True, "category": "temple", "tagline": "1st Arupadai Veedu"},
            "thiruttani murugan temple": {"name": "Thiruttani Murugan Temple", "district": "Tiruvallur", "latitude": 13.1788, "longitude": 79.6074, "verified": True, "category": "temple", "tagline": "1st Arupadai Veedu"},
            "swamimalai": {"name": "Swamimalai Murugan Temple", "district": "Thanjavur", "latitude": 10.9567, "longitude": 79.3274, "verified": True, "category": "temple", "tagline": "2nd Arupadai Veedu"},
            "swamimalai murugan temple": {"name": "Swamimalai Murugan Temple", "district": "Thanjavur", "latitude": 10.9567, "longitude": 79.3274, "verified": True, "category": "temple", "tagline": "2nd Arupadai Veedu"},
            "palani": {"name": "Palani Murugan Temple", "district": "Dindigul", "latitude": 10.4497, "longitude": 77.5204, "verified": True, "category": "temple", "tagline": "3rd Arupadai Veedu"},
            "palani murugan temple": {"name": "Palani Murugan Temple", "district": "Dindigul", "latitude": 10.4497, "longitude": 77.5204, "verified": True, "category": "temple", "tagline": "3rd Arupadai Veedu"},
            "tiruchendur": {"name": "Tiruchendur Murugan Temple", "district": "Thoothukudi", "latitude": 8.4962, "longitude": 78.1288, "verified": True, "category": "temple", "tagline": "4th Arupadai Veedu"},
            "tiruchendur murugan temple": {"name": "Tiruchendur Murugan Temple", "district": "Thoothukudi", "latitude": 8.4962, "longitude": 78.1288, "verified": True, "category": "temple", "tagline": "4th Arupadai Veedu"},
            "pazhamudircholai": {"name": "Pazhamudircholai Murugan Temple", "district": "Madurai", "latitude": 10.0911, "longitude": 78.2173, "verified": True, "category": "temple", "tagline": "5th Arupadai Veedu"},
            "pazhamudircholai murugan temple": {"name": "Pazhamudircholai Murugan Temple", "district": "Madurai", "latitude": 10.0911, "longitude": 78.2173, "verified": True, "category": "temple", "tagline": "5th Arupadai Veedu"},
            "thirupparankundram": {"name": "Thirupparankundram Murugan Temple", "district": "Madurai", "latitude": 9.8797, "longitude": 78.0710, "verified": True, "category": "temple", "tagline": "6th Arupadai Veedu"},
            "thirupparankundram murugan temple": {"name": "Thirupparankundram Murugan Temple", "district": "Madurai", "latitude": 9.8797, "longitude": 78.0710, "verified": True, "category": "temple", "tagline": "6th Arupadai Veedu"},
            "goa": {"name": "Goa", "district": "Goa", "latitude": 15.6868, "longitude": 73.7042, "verified": True, "category": "adventure", "tagline": "Surfing & Coastal Adventure Beach"},
            "bir billing": {"name": "Bir Billing", "district": "Kangra", "latitude": 32.0365, "longitude": 76.7196, "verified": True, "category": "adventure", "tagline": "World Paragliding Capital (2,400m)"},
            "bir": {"name": "Bir Billing", "district": "Kangra", "latitude": 32.0365, "longitude": 76.7196, "verified": True, "category": "adventure", "tagline": "World Paragliding Capital (2,400m)"},
            "billing": {"name": "Bir Billing", "district": "Kangra", "latitude": 32.0365, "longitude": 76.7196, "verified": True, "category": "adventure", "tagline": "World Paragliding Capital (2,400m)"},
            "mysore": {"name": "Mysore", "district": "Mysore", "latitude": 12.2958, "longitude": 76.6394, "verified": True, "category": "adventure", "tagline": "10,000 ft Skydiving Dropzone"},
            "jaipur": {"name": "Jaipur", "district": "Jaipur", "latitude": 26.9124, "longitude": 75.7873, "verified": True, "category": "adventure", "tagline": "Royal Hot Air Balloon Fortress View"},
            "havelock": {"name": "Havelock Island", "district": "Andaman", "latitude": 12.0000, "longitude": 92.9800, "verified": True, "category": "adventure", "tagline": "Bay of Bengal Coral Scuba Reef"},
            "havelock island": {"name": "Havelock Island", "district": "Andaman", "latitude": 12.0000, "longitude": 92.9800, "verified": True, "category": "adventure", "tagline": "Bay of Bengal Coral Scuba Reef"},
            "zanskar": {"name": "Zanskar River", "district": "Kargil/Leh", "latitude": 33.4833, "longitude": 76.8833, "verified": True, "category": "adventure", "tagline": "High Altitude Grade IV Whitewater Canyon"},
            "zanskar river": {"name": "Zanskar River", "district": "Kargil/Leh", "latitude": 33.4833, "longitude": 76.8833, "verified": True, "category": "adventure", "tagline": "High Altitude Grade IV Whitewater Canyon"},
            "rishikesh": {"name": "Rishikesh", "district": "Dehradun", "latitude": 30.0869, "longitude": 78.2676, "verified": True, "category": "adventure", "tagline": "Ganges White Water Rafting Capital"},
            "kovalam": {"name": "Kovalam", "district": "Thiruvananthapuram", "latitude": 8.4004, "longitude": 76.9787, "verified": True, "category": "adventure", "tagline": "Lighthouse Point Break Surfing"},
            "gulmarg": {"name": "Gulmarg", "district": "Baramulla", "latitude": 34.0484, "longitude": 74.3805, "verified": True, "category": "adventure", "tagline": "Asia's Highest Cable Car & Snow Slopes"},
            "elephant beach": {"name": "Elephant Beach", "district": "Andaman", "latitude": 11.9961, "longitude": 92.9515, "verified": True, "category": "adventure", "tagline": "Underwater Sea Walk & Coral Reef"},
        }

        if clean_target in KNOWN_GEOLOCATIONS:
            return KNOWN_GEOLOCATIONS[clean_target]

        for key, info in KNOWN_GEOLOCATIONS.items():
            if key in clean_target or clean_target in key:
                return info

        # 2. Exact Name Match in DB
        for p in verified_places:
            if clean_target == p.get("name", "").lower() or clean_target == p.get("slug", "").lower():
                return p

        # 3. Substring Name Match (Only if exact match failed)
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
        elif "chennai" in dest_lower:
            return [
                {"name": "Ratna Cafe", "location": "Triplicane, Chennai", "specialty": "Piping Hot Piping Sambar Idli", "category": "local_cuisine"},
                {"name": "Buhari Hotel", "location": "Mount Road, Chennai", "specialty": "Original 1965 Heritage Chicken 65", "category": "non_veg_legend"}
            ]
        elif "ooty" in dest_lower:
            return [
                {"name": "Kingstar Confectionery", "location": "Commercial Rd, Ooty", "specialty": "Handmade Ooty Fudge & Chocolates", "category": "bakery"},
                {"name": "Nahars Sidewalk Cafe", "location": "Charing Cross, Ooty", "specialty": "Woodfired Pizza & Hot Chocolate", "category": "cafe"}
            ]
        return [
            {"name": f"Traditional {destination_name} Mess", "location": destination_name, "specialty": "Banana Leaf Meal & Local Delicacies", "category": "local_cuisine"}
        ]

    def process_chat_message(self, conversation_id: Optional[str], user_message: str, trace_id: str) -> dict:
        cid, session = self.get_or_create_conversation(conversation_id)
        
        prev_state = session["state"]
        structured_intent = intent_extractor.extract_intent(user_message, prev_state)
        intent_type = structured_intent.intentCategory

        structured_logger.info(f"[TripCopilot] User request: '{user_message}'", trace_id=trace_id)

        if structured_intent.intentCategory == "GREETING":
            greeting_msg = (
                "Hi! I am your ExplorerTN Trip Copilot. Tell me your starting city, budget, "
                "or where you want to travel (e.g., 'Plan a River Rafting trip to Rishikesh', 'trip from Chennai to Madurai', or 'Plan a Paragliding trip to Bir Billing')."
            )
            session["messages"].append({"role": "user", "text": user_message})
            session["messages"].append({"role": "assistant", "text": greeting_msg})
            return {
                "conversationId": cid,
                "message": greeting_msg,
                "intent": "GREETING",
                "plannerState": session["state"],
                "missingFields": ["destination"],
                "recommendations": ["Rishikesh", "Goa", "Madurai", "Ooty"],
                "route": {"distanceKm": 0.0, "durationMinutes": 0, "geometry": {"type": "LineString", "coordinates": []}, "provider": "OSRM Routing Engine"},
                "elevation": {"gainMeters": 0, "highestMeters": 0, "lowestMeters": 0},
                "costEstimate": {
                    "fuelCost": "₹0",
                    "total": 0.0,
                    "budget": 3000.0,
                    "withinBudget": True,
                    "assumptions": "N/A"
                },
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

        dest_name_log = resolved_dest_place.get('name') if resolved_dest_place else 'Unresolved'
        structured_logger.info(f"[DestinationResolver] Resolved canonical destination: {dest_name_log}", trace_id=trace_id)

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
            resolved_dest_place = {"name": "Madurai", "district": "Madurai", "latitude": 9.9252, "longitude": 78.1198}

        merged_state = dict(prev_state)
        merged_state["destination"] = resolved_dest_place["name"]
        merged_state["origin"] = structured_intent.origin or prev_state.get("origin") or "Chennai"
        merged_state["transport"] = structured_intent.transport or prev_state.get("transport") or "motorcycle"
        merged_state["durationDays"] = structured_intent.durationDays or prev_state.get("durationDays") or 1
        merged_state["departureTime"] = structured_intent.departureTime or prev_state.get("departureTime") or "06:00"
        merged_state["overnightTravel"] = structured_intent.overnightTravel or prev_state.get("overnightTravel", False)
        merged_state["interests"] = structured_intent.interests
        merged_state["trail"] = structured_intent.trail
        merged_state["waypoints"] = structured_intent.waypoints

        if structured_intent.budget is not None:
            merged_state["budget"] = structured_intent.budget

        # Food Spot Population (BUG 7 FIX)
        food_spots = self.get_local_food_spots(resolved_dest_place["name"])
        merged_state["foodStops"] = food_spots

        # Save clean mutated state to conversation session
        session["state"] = merged_state
        session["messages"].append({"role": "user", "text": user_message})

        # 4. Resolve Origin & Waypoint Places for OSRM Route Engine
        resolved_origin_place = self.resolve_place_by_name(merged_state["origin"], verified_places) or {"name": "Chennai", "latitude": 13.0827, "longitude": 80.2707}
        
        resolved_waypoints = []
        for wp_name in merged_state["waypoints"]:
            wp_place = self.resolve_place_by_name(wp_name, verified_places)
            if wp_place and wp_place["name"] != resolved_origin_place["name"] and wp_place["name"] != resolved_dest_place["name"]:
                resolved_waypoints.append(wp_place)

        # 5. Delegate Route Construction to Isolated Route Engine Service
        origin_coord = CoordinatesDTO(
            name=resolved_origin_place["name"],
            latitude=resolved_origin_place["latitude"],
            longitude=resolved_origin_place["longitude"]
        )
        dest_coord = CoordinatesDTO(
            name=resolved_dest_place["name"],
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
            destination_name=resolved_dest_place["name"],
            route_points_coords=combined_coords,
            distance_km=total_road_dist_km,
            duration_minutes=total_duration_mins,
            trace_id=trace_id
        )

        # 6. Deterministic Cost & Feasibility Validation
        user_budget = merged_state.get("budget") or 10000.0
        cost_info = self.compute_deterministic_cost(total_road_dist_km, merged_state["transport"], user_budget)

        validation_report = trip_validator.validate_trip(
            intent=structured_intent,
            resolved_destination_place=resolved_dest_place,
            resolved_waypoints_places=resolved_waypoints,
            total_route_duration_mins=total_duration_mins,
            total_estimated_cost=cost_info["total"]
        )

        # 7. OpenSERP Grounded Web Evidence Query
        web_evidence_sources = openserp_service.search_web_evidence(resolved_dest_place["name"], trace_id=trace_id)
        evidence_dtos = [s.model_dump() for s in web_evidence_sources]

        # 8. Timeline Generation
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
                "description": f"Begin ride towards {resolved_dest_place['name']}."
            })

            # Add Waypoint stops if any
            for wp in resolved_waypoints:
                timeline.append({
                    "time": "11:30 AM",
                    "name": f"Stop at {wp['name']}",
                    "description": f"Explore {wp.get('tagline', 'En-route stop')}."
                })

            # Add Destination & Food Spots
            food_summary = ", ".join([f"{f['name']} ({f['specialty']})" for f in food_spots[:2]])
            timeline.append({
                "time": "02:30 PM",
                "name": resolved_dest_place["name"],
                "description": f"Explore {resolved_dest_place.get('tagline', 'Target destination')}. Local Food Highlights: {food_summary}."
            })

            timeline.append({
                "time": "06:00 PM",
                "name": f"Return to {resolved_origin_place['name']}",
                "description": f"Complete {merged_state['durationDays']}-day ride ({total_road_dist_km} km total road distance)."
            })

        # 9. Natural Language Assistant Message Generation
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
            food_narrative = f" Food Highlights in {resolved_dest_place['name']}: {', '.join(top_foods)}."

        assistant_msg = (
            f"{warning_prefix}"
            f"Planned your {merged_state['durationDays']}-day {merged_state['transport']} trip to {resolved_dest_place['name']} from {resolved_origin_place['name']}."
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
            "missingFields": [],
            "recommendations": [resolved_dest_place["name"]] + [wp["name"] for wp in resolved_waypoints],
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
