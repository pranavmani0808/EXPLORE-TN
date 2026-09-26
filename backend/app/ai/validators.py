"""
Validation module enforcing spatial bounding box constraints and sanity checks.
Ensures zero hallucinated coordinates outside Tamil Nadu / South India corridor.
"""

from backend.app.ai.schemas import AITravelPlanResponse, ItineraryStop

MIN_LAT = 7.8
MAX_LAT = 14.0
MIN_LNG = 75.0
MAX_LNG = 81.0

class PlanValidator:
    """
    Sanity checks AI generated travel plan responses.
    """

    @classmethod
    def validate_plan(cls, response: AITravelPlanResponse) -> AITravelPlanResponse:
        valid_stops = []

        for stop in response.ordered_stops:
            if cls._is_valid_coordinate(stop.lat, stop.lng):
                valid_stops.append(stop)

        response.ordered_stops = valid_stops

        for day_plan in response.day_plans:
            day_plan.stops = [s for s in day_plan.stops if cls._is_valid_coordinate(s.lat, s.lng)]

        return response

    @staticmethod
    def _is_valid_coordinate(lat: float, lng: float) -> bool:
        return MIN_LAT <= lat <= MAX_LAT and MIN_LNG <= lng <= MAX_LNG
