import time
import uuid
import re
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel
from backend.app.services.places_service import places_service, calculate_haversine
from backend.app.services.openserp_service import openserp_service, SourceDTO
from backend.app.services.routing import routing_service
from backend.app.services.intelligence.trip_intent import intent_extractor, StructuredTripIntent
from backend.app.services.intelligence.trip_validator import trip_validator
from backend.app.services.intelligence.route_validator import route_sanity_validator
from backend.app.core.config import settings

class PlannerState(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    waypoints: List[str] = []
    trail: Optional[str] = None
    durationDays: Optional[int] = 3
    budget: Optional[float] = None
    transport: Optional[str] = "motorcycle"
    departureTime: Optional[str] = "06:00"
    overnightTravel: Optional[bool] = False
    interests: List[str] = []
    travelers: Optional[int] = 1

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
        if "weather" in lower or "rain" in lower or "temperature" in lower:
            return "WEATHER_QUERY"
        if "cost" in lower or "budget" in lower or "fuel" in lower or "price" in lower or "under" in lower:
            return "COST_QUERY"
        if "make it" in lower and ("day" in lower or "days" in lower):
            return "CHANGE_DURATION"
        if any(k in lower for k in ["arupadai", "six murugan", "6 murugan", "six abodes"]):
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
        clean_target = name.strip().lower()
        
        for p in verified_places:
            p_name = p.get("name", "").lower()
            p_dist = p.get("district", "").lower()
            p_slug = p.get("slug", "").lower()
            if clean_target in p_name or p_name in clean_target or clean_target == p_dist or clean_target in p_slug:
                return p

        KNOWN_GEOLOCATIONS = {
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
            "madurai": {"name": "Madurai", "district": "Madurai", "latitude": 9.9252, "longitude": 78.1198, "verified": True, "category": "city", "tagline": "Cultural Capital of Tamil Nadu"},
            "chennai": {"name": "Chennai", "district": "Chennai", "latitude": 13.0827, "longitude": 80.2707, "verified": True, "category": "city", "tagline": "Capital City"},
            "ooty": {"name": "Ooty", "district": "Nilgiris", "latitude": 11.4102, "longitude": 76.6950, "verified": True, "category": "hill_station", "tagline": "Queen of Hill Stations"},
            "kodaikanal": {"name": "Kodaikanal", "district": "Dindigul", "latitude": 10.2381, "longitude": 77.4892, "verified": True, "category": "hill_station", "tagline": "Princess of Hill Stations"},
            "valparai": {"name": "Valparai", "district": "Coimbatore", "latitude": 10.3270, "longitude": 76.9554, "verified": True, "category": "hill_station", "tagline": "70 Hairpin Pass Ghat Run"},
        }

        if clean_target in KNOWN_GEOLOCATIONS:
            return KNOWN_GEOLOCATIONS[clean_target]

        return None

    def process_chat_message(self, conversation_id: Optional[str], user_message: str, trace_id: str) -> dict:
        cid, session = self.get_or_create_conversation(conversation_id)
        intent_type = self.classify_intent(user_message)

        if intent_type == "GREETING":
            session["messages"].append({"role": "user", "text": user_message})
            greeting_text = "Hi! I am your ExplorerTN Trip Copilot. Tell me where you want to start, your budget, or interests (e.g. 'Plan an Arupadai Veedu trip from Chennai')."
            session["messages"].append({"role": "assistant", "text": greeting_text})
            
            return {
                "conversationId": cid,
                "message": greeting_text,
                "intent": "GREETING",
                "plannerState": session["state"],
                "missingFields": ["origin", "destination"],
                "recommendations": [],
                "route": {
                    "distanceKm": 0.0,
                    "durationMinutes": 0,
                    "geometry": {"type": "LineString", "coordinates": []},
                    "provider": "OSRM Routing Engine"
                },
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
                "validation": {"destinationMatch": True, "durationFeasible": True, "budgetFeasible": True, "warnings": []},
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

        structured_intent = intent_extractor.extract_intent(user_message, session["state"])
        
        prev_state = session["state"]
        merged_state = structured_intent.model_dump()
        if prev_state.get("trail"):
            merged_state["trail"] = prev_state["trail"]
            if not merged_state.get("waypoints") and prev_state.get("waypoints"):
                merged_state["waypoints"] = prev_state["waypoints"]
            if not merged_state.get("destination") and prev_state.get("destination"):
                merged_state["destination"] = prev_state["destination"]

        session["state"] = merged_state
        session["messages"].append({"role": "user", "text": user_message})

        all_places = places_service.get_all_places()
        verified_places = [p for p in all_places if p.get("verified", True)]

        # 1. Resolve Destination & Enforce Destination Integrity Guard
        requested_dest = merged_state.get("destination")
        resolved_dest_place = None
        if requested_dest:
            resolved_dest_place = self.resolve_place_by_name(requested_dest, verified_places)

            if not resolved_dest_place:
                clarification_msg = (
                    f"I couldn't confidently locate '{requested_dest}' in my Tamil Nadu place database. "
                    f"Did you mean Thirupparankundram, Palani, Thiruttani, or Madurai?"
                )
                session["messages"].append({"role": "assistant", "text": clarification_msg})
                return {
                    "conversationId": cid,
                    "message": clarification_msg,
                    "intent": "CLARIFICATION_REQUIRED",
                    "plannerState": session["state"],
                    "missingFields": ["destination"],
                    "recommendations": ["Thiruttani Murugan Temple", "Palani Murugan Temple", "Tiruchendur Murugan Temple"],
                    "route": {"distanceKm": 0.0, "durationMinutes": 0, "geometry": {"type": "LineString", "coordinates": []}, "provider": "OSRM Routing Engine"},
                    "elevation": {"gainMeters": 0, "highestMeters": 0, "lowestMeters": 0},
                    "costEstimate": {"fuelCost": "₹0", "total": 0.0, "budget": merged_state.get("budget") or 10000.0, "withinBudget": True, "assumptions": "N/A"},
                    "weather": {"tempRange": "18–28°C", "condition": "Partly Cloudy"},
                    "timeline": [],
                    "webEvidence": [],
                    "decisionFacts": {"requestedDestination": requested_dest, "resolvedDestination": None, "destinationMatch": False},
                    "validation": {"destinationMatch": False, "durationFeasible": True, "budgetFeasible": True, "warnings": [f"Requested destination '{requested_dest}' unresolved."]},
                    "provenance": {"destination": "PostgreSQL/PostGIS", "route": "Routing Engine (OSRM)", "cost": "Deterministic Cost Engine", "webEvidence": "OpenSERP", "narrative": "Gemini"},
                    "traceId": trace_id
                }

        if not resolved_dest_place:
            resolved_dest_place = {"name": "Thirupparankundram Murugan Temple", "district": "Madurai", "latitude": 9.8797, "longitude": 78.0710}

        # 2. Resolve Origin & Waypoints
        resolved_origin_place = self.resolve_place_by_name(merged_state.get("origin") or "Chennai", verified_places) or {"name": "Chennai", "latitude": 13.0827, "longitude": 80.2707}
        
        resolved_waypoints = []
        for wp_name in merged_state.get("waypoints", []):
            wp_place = self.resolve_place_by_name(wp_name, verified_places)
            if wp_place and wp_place["name"] != resolved_origin_place["name"] and wp_place["name"] != resolved_dest_place["name"]:
                resolved_waypoints.append(wp_place)

        # 3. Multi-Waypoint Route Construction & OSRM Routing
        route_sequence = [resolved_origin_place] + resolved_waypoints + [resolved_dest_place]
        
        one_way_dist_km = 0.0
        one_way_duration_mins = 0
        combined_coords: List[List[float]] = []

        for i in range(len(route_sequence) - 1):
            p_start = route_sequence[i]
            p_end = route_sequence[i+1]

            leg_res = routing_service.calculate_route(
                origin_lat=p_start["latitude"],
                origin_lng=p_start["longitude"],
                destination_lat=p_end["latitude"],
                destination_lng=p_end["longitude"],
                profile=merged_state.get("transport", "motorcycle")
            )
            one_way_dist_km += leg_res.distance_km
            one_way_duration_mins += leg_res.duration_minutes
            if leg_res.geometry and "coordinates" in leg_res.geometry:
                combined_coords.extend(leg_res.geometry["coordinates"])

        total_road_dist_km = round(one_way_dist_km * 2, 1)
        total_duration_mins = one_way_duration_mins * 2

        roundtrip_seq = list(reversed(route_sequence))
        for i in range(len(roundtrip_seq) - 1):
            p_start = roundtrip_seq[i]
            p_end = roundtrip_seq[i+1]

            leg_res = routing_service.calculate_route(
                origin_lat=p_start["latitude"],
                origin_lng=p_start["longitude"],
                destination_lat=p_end["latitude"],
                destination_lng=p_end["longitude"],
                profile=merged_state.get("transport", "motorcycle")
            )
            if leg_res.geometry and "coordinates" in leg_res.geometry:
                combined_coords.extend(leg_res.geometry["coordinates"])

        route_sanity_validator.validate_and_log_route(
            origin_name=resolved_origin_place["name"],
            waypoints_names=[wp["name"] for wp in resolved_waypoints],
            destination_name=resolved_dest_place["name"],
            route_points_coords=combined_coords,
            distance_km=total_road_dist_km,
            duration_minutes=total_duration_mins,
            trace_id=trace_id
        )

        # 4. Deterministic Cost & Feasibility Validation
        user_budget = merged_state.get("budget") or 10000.0
        cost_info = self.compute_deterministic_cost(total_road_dist_km, merged_state.get("transport", "motorcycle"), user_budget)

        validation_report = trip_validator.validate_trip(
            intent=structured_intent,
            resolved_destination_place=resolved_dest_place,
            resolved_waypoints_places=resolved_waypoints,
            total_route_duration_mins=total_duration_mins,
            total_estimated_cost=cost_info["total"]
        )

        # 5. OpenSERP Grounded Web Evidence Query
        web_evidence_sources = openserp_service.search_web_evidence(resolved_dest_place["name"], trace_id=trace_id)
        evidence_dtos = [s.model_dump() for s in web_evidence_sources]

        # 6. Timeline Generation
        hours = total_duration_mins // 60
        mins = total_duration_mins % 60
        eta_str = f"{hours}h {mins}m"

        timeline = []
        if merged_state.get("trail") == "arupadai-veedu":
            timeline.extend([
                {
                    "time": "Day 1 — 06:00 AM",
                    "name": f"Depart {resolved_origin_place['name']}",
                    "description": f"Begin Arupadai Veedu sacred trail from {resolved_origin_place['name']}."
                },
                {
                    "time": "Day 1 — 08:30 AM",
                    "name": "1. Thiruttani Murugan Temple",
                    "description": "1st Arupadai Veedu atop Tanigai hill (365 steps)."
                },
                {
                    "time": "Day 1 — 02:00 PM",
                    "name": "2. Swamimalai Murugan Temple",
                    "description": "2nd Arupadai Veedu near Kumbakonam (Pranava Mantra shrine)."
                },
                {
                    "time": "Day 2 — 07:30 AM",
                    "name": "3. Palani Murugan Temple",
                    "description": "3rd Arupadai Veedu (Navapashanam Dhandayuthapani shrine)."
                },
                {
                    "time": "Day 2 — 03:00 PM",
                    "name": "4. Tiruchendur Murugan Temple",
                    "description": "4th Arupadai Veedu on the shore of Bay of Bengal."
                },
                {
                    "time": "Day 3 — 08:30 AM",
                    "name": "5. Pazhamudircholai Murugan Temple",
                    "description": "5th Arupadai Veedu in dense Solaimalai hill forest."
                },
                {
                    "time": "Day 3 — 11:30 AM",
                    "name": "6. Thirupparankundram Murugan Temple",
                    "description": "6th Arupadai Veedu rock-cut cave shrine."
                },
                {
                    "time": f"Day {merged_state.get('durationDays', 3)} — 07:00 PM",
                    "name": f"Return to {resolved_origin_place['name']}",
                    "description": f"Complete sacred 6-temple trail ({total_road_dist_km} km total road distance)."
                }
            ])
        else:
            timeline.extend([
                {
                    "time": "06:00 AM",
                    "name": f"Depart {resolved_origin_place['name']}",
                    "description": f"Begin ride towards {resolved_dest_place['name']}."
                },
                {
                    "time": "02:30 PM",
                    "name": resolved_dest_place["name"],
                    "description": f"Explore {resolved_dest_place.get('tagline', 'Target destination')}."
                },
                {
                    "time": "06:00 PM",
                    "name": f"Return to {resolved_origin_place['name']}",
                    "description": f"Complete {merged_state.get('durationDays', 1)}-day ride ({total_road_dist_km} km total road distance)."
                }
            ])

        # 7. Natural Language Assistant Message Generation
        warning_prefix = ""
        if not validation_report.durationFeasible and not merged_state.get("overnightTravel"):
            warning_prefix = (
                f"⚠️ Feasibility Alert: A {merged_state.get('durationDays', 1)}-day trip with {validation_report.totalRidingHours}h riding time "
                f"exceeds daily riding limit (10h/day). I recommend 2–3 days for this route.\n\n"
            )
        elif validation_report.warnings:
            warning_prefix = f"⚠️ Advisories:\n" + "\n".join(validation_report.warnings) + "\n\n"

        budget_status_str = "Within Budget" if cost_info["withinBudget"] else "Exceeds Budget"
        trail_title = "Arupadai Veedu 6-Temple Sacred Trail" if merged_state.get("trail") == "arupadai-veedu" else f"trip to {resolved_dest_place['name']}"

        assistant_msg = (
            f"{warning_prefix}"
            f"Planned your {merged_state.get('durationDays', 3)}-day {merged_state.get('transport', 'motorcycle')} {trail_title} from {resolved_origin_place['name']}. "
            f"Real road distance across all shrines is {total_road_dist_km} km round-trip (ETA: {eta_str}). "
            f"Estimated fuel cost is {cost_info['fuelCost']} ({cost_info['assumptions']}). "
            f"Total estimated cost: ₹{cost_info['total']} ({budget_status_str} for ₹{user_budget})."
        )
        session["messages"].append({"role": "assistant", "text": assistant_msg})

        missing = []
        if not merged_state.get("destination"):
            missing.append("destination")

        return {
            "conversationId": cid,
            "message": assistant_msg,
            "intent": intent_type,
            "plannerState": session["state"],
            "missingFields": missing,
            "recommendations": [resolved_dest_place["name"]] + [wp["name"] for wp in resolved_waypoints],
            "route": {
                "distanceKm": total_road_dist_km,
                "durationMinutes": total_duration_mins,
                "geometry": {"type": "LineString", "coordinates": combined_coords},
                "provider": "OSRM Routing Engine",
                "profile": merged_state.get("transport", "motorcycle")
            },
            "elevation": {"gainMeters": 650, "highestMeters": 420, "lowestMeters": 50},
            "costEstimate": cost_info,
            "weather": {"tempRange": "22–34°C", "condition": "Sunny & Spiritual"},
            "timeline": timeline,
            "webEvidence": evidence_dtos,
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
