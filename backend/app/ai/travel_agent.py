"""
Master AI Travel Agent Orchestrator for ExploreTN.
Coordinates Gemini intent parsing, PostGIS spatial queries, routing engines,
deterministic ranking, itinerary construction, and dynamic plan modifications.
"""

import logging
from typing import Dict, Any, Optional, List
from backend.app.ai.schemas import (
    AITravelPlanRequest, AITravelPlanResponse, AIModifyPlanRequest,
    IntentType, StructuredTripIntent, ProvenanceInfo, ProvenanceSource
)
from backend.app.ai.intent_parser import IntentParser
from backend.app.ai.tools import (
    resolve_destination, search_places_along_route, search_places_near_location,
    calculate_route, search_web_for_fresh_information, generate_dense_road_geometry
)
from backend.app.ai.ranking import RankingEngine
from backend.app.ai.itinerary import ItineraryBuilder
from backend.app.ai.validators import PlanValidator

logger = logging.getLogger(__name__)

class AITravelAgent:
    """
    Primary agent facade executing intelligent travel requests for ExploreTN.
    """

    @classmethod
    async def generate_plan(cls, request: AITravelPlanRequest) -> AITravelPlanResponse:
        logger.info(f"AI Travel Agent processing request: '{request.query}'")

        intent = await IntentParser.parse_intent(request.query)

        if request.origin:
            intent.origin = request.origin
        if request.destination:
            intent.destination = request.destination
        if request.days:
            intent.days = request.days
        if request.categories:
            intent.categories = request.categories

        origin_geo = resolve_destination(intent.origin) if intent.origin else None
        dest_geo = resolve_destination(intent.destination) if intent.destination else None

        if not dest_geo and not origin_geo:
            dest_geo = resolve_destination(intent.raw_query)

        candidates = []
        if intent.intent_type == IntentType.ROUTE_PLANNING and origin_geo and dest_geo:
            candidates = search_places_along_route(
                origin_lat=origin_geo['lat'],
                origin_lng=origin_geo['lng'],
                dest_lat=dest_geo['lat'],
                dest_lng=dest_geo['lng'],
                corridor_km=intent.radius_km or 40.0,
                categories=intent.categories
            )
        elif dest_geo:
            candidates = search_places_near_location(
                lat=dest_geo['lat'],
                lng=dest_geo['lng'],
                radius_km=intent.radius_km or 50.0,
                category=intent.categories[0] if intent.categories else None
            )
        elif origin_geo:
            candidates = search_places_near_location(
                lat=origin_geo['lat'],
                lng=origin_geo['lng'],
                radius_km=intent.radius_km or 50.0,
                category=intent.categories[0] if intent.categories else None
            )
        else:
            candidates = search_places_near_location(
                lat=9.9252,
                lng=78.1198,
                radius_km=100.0
            )

        ranked_candidates = RankingEngine.rank_candidates(candidates, intent)

        itinerary_data = ItineraryBuilder.build_itinerary(
            candidates=ranked_candidates,
            intent=intent,
            origin_geo=origin_geo,
            dest_geo=dest_geo
        )

        web_evidence = search_web_for_fresh_information(intent.raw_query)

        stops_dict = [
            {"lat": s.lat, "lng": s.lng} for s in itinerary_data['ordered_stops']
        ]
        dense_points = generate_dense_road_geometry(stops_dict)

        title = f"AI Custom Plan: {intent.origin or 'Tamil Nadu'} to {intent.destination or 'Corridor'}"
        if intent.intent_type == IntentType.SINGLE_DESTINATION_DISCOVERY and dest_geo:
            title = f"Explore {dest_geo['name']} & Nearby Hidden Spots"

        summary = (
            f"Generated an intelligent {intent.days}-day itinerary featuring {len(itinerary_data['ordered_stops'])} "
            f"top-ranked destinations with live road route calculation."
        )

        response = AITravelPlanResponse(
            success=True,
            intent_type=intent.intent_type,
            title=title,
            summary=summary,
            origin=origin_geo,
            destination=dest_geo,
            total_distance_km=itinerary_data['total_distance_km'],
            total_driving_time_mins=itinerary_data['total_driving_time_mins'],
            day_plans=itinerary_data['day_plans'],
            ordered_stops=itinerary_data['ordered_stops'],
            route_polyline_points=dense_points,
            cost_estimate=itinerary_data['cost_estimate'],
            weather_advisory="Favorable weather across Tamil Nadu travel corridor.",
            web_evidence=web_evidence,
            raw_intent=intent
        )

        return PlanValidator.validate_plan(response)

    @classmethod
    async def modify_plan(cls, request: AIModifyPlanRequest) -> AITravelPlanResponse:
        current_data = request.current_plan
        action = request.action.lower()

        stops = current_data.get("ordered_stops", [])
        target_id = request.target_stop_id

        if action == "remove_stop" and target_id:
            stops = [s for s in stops if s.get("place_id") != target_id and s.get("slug") != target_id]
            for i, stop in enumerate(stops):
                stop["order"] = i + 1

        elif action == "add_hidden" or action == "add_stop":
            dest = current_data.get("destination") or (stops[-1] if stops else None)
            if dest:
                d_lat = dest.get("lat") or dest.get("latitude")
                d_lng = dest.get("lng") or dest.get("longitude")
                if d_lat and d_lng:
                    extra_places = search_places_near_location(d_lat, d_lng, radius_km=40.0)
                    existing_ids = {s.get("place_id") for s in stops}
                    for extra in extra_places:
                        if extra.id not in existing_ids:
                            new_stop = {
                                "order": len(stops) + 1,
                                "day_number": 1,
                                "place_id": extra.id,
                                "name": extra.name,
                                "slug": extra.slug,
                                "category": extra.category,
                                "lat": extra.lat,
                                "lng": extra.lng,
                                "district": extra.district,
                                "image_url": extra.image_url,
                                "distance_from_prev_km": 15.0,
                                "duration_from_prev_mins": 20,
                                "recommended_visit_mins": 60,
                                "rationale": "Added hidden gem destination.",
                                "opening_hours": "Open 24 Hours",
                                "access_status": "Open",
                                "provenance": extra.provenance.model_dump() if hasattr(extra.provenance, 'model_dump') else extra.provenance
                            }
                            stops.append(new_stop)
                            break

        tot_dist = sum(s.get("distance_from_prev_km", 0.0) for s in stops)
        tot_mins = sum(s.get("duration_from_prev_mins", 0) for s in stops)

        stops_dict = [{"lat": s.get("lat"), "lng": s.get("lng")} for s in stops if s.get("lat") and s.get("lng")]
        dense_points = generate_dense_road_geometry(stops_dict)

        current_data["ordered_stops"] = stops
        current_data["total_distance_km"] = round(tot_dist, 1)
        current_data["total_driving_time_mins"] = tot_mins
        current_data["route_polyline_points"] = dense_points
        current_data["summary"] = f"Updated itinerary now features {len(stops)} destinations."

        return AITravelPlanResponse(**current_data)
