"""
Itinerary builder organizing ranked place candidates into structured day-wise plans.
Computes leg driving distances, estimated travel times, visit durations, and natural rationales.
"""

from typing import List, Dict, Any, Optional
from backend.app.ai.schemas import (
    PlaceCandidate, ItineraryStop, DayPlan, CostBreakdown, StructuredTripIntent
)
from backend.app.ai.tools import calculate_distance, get_opening_hours

class ItineraryBuilder:
    """
    Constructs multi-day or single-day itineraries from ranked place candidates.
    """

    @classmethod
    def build_itinerary(
        cls,
        candidates: List[PlaceCandidate],
        intent: StructuredTripIntent,
        origin_geo: Optional[Dict[str, Any]] = None,
        dest_geo: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        stops: List[ItineraryStop] = []
        stop_order = 1

        if origin_geo:
            origin_stop = ItineraryStop(
                order=stop_order,
                day_number=1,
                place_id=origin_geo.get("id") or f"loc-{origin_geo['slug']}",
                name=origin_geo['name'],
                slug=origin_geo['slug'],
                category=origin_geo.get('category', 'City'),
                lat=origin_geo['lat'],
                lng=origin_geo['lng'],
                district=origin_geo.get('district', 'Tamil Nadu'),
                image_url=origin_geo.get('image'),
                distance_from_prev_km=0.0,
                duration_from_prev_mins=0,
                recommended_visit_mins=60,
                rationale=f"Starting point of your journey in {origin_geo['name']}.",
                opening_hours="Open 24 Hours",
                access_status="Open",
                provenance=origin_geo.get('provenance')
            )
            stops.append(origin_stop)
            stop_order += 1

        current_lat = origin_geo['lat'] if origin_geo else (candidates[0].lat if candidates else 13.0827)
        current_lng = origin_geo['lng'] if origin_geo else (candidates[0].lng if candidates else 80.2707)

        num_days = max(1, intent.days)
        max_stops_total = num_days * 3

        # Filter out candidates matching origin or destination to avoid duplicates
        filtered_candidates = [
            c for c in candidates 
            if (not origin_geo or c.slug != origin_geo['slug']) and 
               (not dest_geo or c.slug != dest_geo['slug'])
        ]
        selected_candidates = filtered_candidates[:max_stops_total]

        for idx, candidate in enumerate(selected_candidates):
            dist_prev = calculate_distance(current_lat, current_lng, candidate.lat, candidate.lng)
            road_dist = round(dist_prev * 1.25, 1)
            travel_mins = round((road_dist / 50.0) * 60)

            cat_lower = candidate.category.lower()
            if 'beach' in cat_lower or 'waterfall' in cat_lower:
                visit_mins = 90
            elif 'temple' in cat_lower or 'heritage' in cat_lower or 'palace' in cat_lower:
                visit_mins = 120
            elif 'food' in cat_lower:
                visit_mins = 60
            else:
                visit_mins = 75

            rationale = (
                f"Selected for high rating ({candidate.rating}★) and exceptional {candidate.category} experience. "
                f"Located {road_dist}km along the corridor."
            )

            current_day = min(num_days, max(1, int((idx / max(1, len(selected_candidates))) * num_days) + 1))

            stop = ItineraryStop(
                order=stop_order,
                day_number=current_day,
                place_id=candidate.id,
                name=candidate.name,
                slug=candidate.slug,
                category=candidate.category,
                lat=candidate.lat,
                lng=candidate.lng,
                district=candidate.district,
                image_url=candidate.image_url,
                distance_from_prev_km=road_dist,
                duration_from_prev_mins=travel_mins,
                recommended_visit_mins=visit_mins,
                rationale=rationale,
                opening_hours=get_opening_hours(candidate.slug),
                access_status="Open",
                provenance=candidate.provenance
            )

            stops.append(stop)
            stop_order += 1
            current_lat = candidate.lat
            current_lng = candidate.lng

        if dest_geo:
            dist_prev = calculate_distance(current_lat, current_lng, dest_geo['lat'], dest_geo['lng'])
            road_dist = round(dist_prev * 1.25, 1)
            travel_mins = round((road_dist / 50.0) * 60)
            dest_stop = ItineraryStop(
                order=stop_order,
                day_number=num_days,
                place_id=dest_geo.get("id") or f"loc-{dest_geo['slug']}",
                name=dest_geo['name'],
                slug=dest_geo['slug'],
                category=dest_geo.get('category', 'City'),
                lat=dest_geo['lat'],
                lng=dest_geo['lng'],
                district=dest_geo.get('district', 'Tamil Nadu'),
                image_url=dest_geo.get('image'),
                distance_from_prev_km=road_dist,
                duration_from_prev_mins=travel_mins,
                recommended_visit_mins=120,
                rationale=f"Final destination: {dest_geo['name']}.",
                opening_hours="Open 24 Hours",
                access_status="Open",
                provenance=dest_geo.get('provenance')
            )
            stops.append(dest_stop)

        # Organize into DayPlan objects
        day_plans: List[DayPlan] = []
        for d in range(1, num_days + 1):
            day_stops = [s for s in stops if s.day_number == d]
            if not day_stops and d == num_days and stops:
                day_stops = [stops[-1]]

            day_dist = sum(s.distance_from_prev_km for s in day_stops)
            day_mins = sum(s.duration_from_prev_mins for s in day_stops)

            day_plans.append(DayPlan(
                day_number=d,
                title=f"Day {d}: {day_stops[0].district if day_stops else 'Tamil Nadu'} Exploration",
                description=f"Explore {len(day_stops)} key destinations covering {round(day_dist, 1)}km.",
                day_driving_dist_km=round(day_dist, 1),
                day_driving_time_mins=day_mins,
                stops=day_stops
            ))

        total_dist = sum(s.distance_from_prev_km for s in stops)
        total_driving_mins = sum(s.duration_from_prev_mins for s in stops)

        fuel_est = round(total_dist * 7.5, 0)
        tolls_est = round((total_dist / 100.0) * 120, 0)
        entry_est = len(stops) * 50.0
        food_est = intent.travelers * num_days * 600.0

        cost_breakdown = CostBreakdown(
            fuel_estimate_inr=fuel_est,
            tolls_estimate_inr=tolls_est,
            entry_fees_inr=entry_est,
            food_estimate_inr=food_est,
            total_estimated_inr=fuel_est + tolls_est + entry_est + food_est,
            currency="INR"
        )

        return {
            "day_plans": day_plans,
            "ordered_stops": stops,
            "total_distance_km": round(total_dist, 1),
            "total_driving_time_mins": total_driving_mins,
            "cost_estimate": cost_breakdown
        }
