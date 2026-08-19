from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.app.services.intelligence.trip_intent import StructuredTripIntent

class ValidationReport(BaseModel):
    requestedDestination: Optional[str]
    resolvedDestination: Optional[str]
    destinationMatch: bool
    durationFeasible: bool
    budgetFeasible: bool
    maxDrivingHoursPerDay: float = 10.0
    totalRidingHours: float = 0.0
    warnings: List[str] = []
    decisionFacts: Dict[str, Any] = {}

class TripValidator:
    MAX_DRIVING_HOURS_PER_DAY: float = 10.0

    @classmethod
    def validate_destination_integrity(
        cls,
        requested_dest: Optional[str],
        resolved_place: Optional[dict]
    ) -> bool:
        if not requested_dest:
            return True
        if not resolved_place:
            return False

        req_clean = requested_dest.strip().lower()
        res_name = resolved_place.get("name", "").strip().lower()
        res_district = resolved_place.get("district", "").strip().lower()

        if req_clean in res_name or res_name in req_clean or req_clean in res_district:
            return True

        return False

    @classmethod
    def validate_trip(
        cls,
        intent: StructuredTripIntent,
        resolved_destination_place: Optional[dict],
        resolved_waypoints_places: List[dict],
        total_route_duration_mins: int,
        total_estimated_cost: float
    ) -> ValidationReport:
        warnings: List[str] = []
        destination_match = cls.validate_destination_integrity(
            intent.destination,
            resolved_destination_place
        )

        resolved_dest_name = resolved_destination_place.get("name") if resolved_destination_place else None

        # 1. Destination Integrity Check
        if intent.destination and not destination_match:
            warnings.append(
                f"Destination Mismatch: Requested '{intent.destination}' could not be matched. "
                f"Resolved place was '{resolved_dest_name or 'None'}'."
            )

        # 2. Riding Feasibility Check
        total_riding_hours = round(total_route_duration_mins / 60.0, 1)
        max_allowed_hours = cls.MAX_DRIVING_HOURS_PER_DAY * intent.durationDays
        duration_feasible = total_riding_hours <= max_allowed_hours

        if not duration_feasible:
            recommended_days = max(2, int((total_riding_hours / cls.MAX_DRIVING_HOURS_PER_DAY) + 0.99))
            warnings.append(
                f"A {intent.durationDays}-day {intent.transport} trip with {total_riding_hours}h total riding time "
                f"exceeds recommended daily riding limit ({cls.MAX_DRIVING_HOURS_PER_DAY}h/day). "
                f"Recommended duration: {recommended_days} days."
            )

        # 3. Budget Feasibility Check
        user_budget = intent.budget or 3000.0
        budget_feasible = total_estimated_cost <= user_budget

        if not budget_feasible:
            warnings.append(
                f"Estimated cost (₹{total_estimated_cost}) exceeds budget limit (₹{user_budget})."
            )

        decision_facts = {
            "origin": intent.origin,
            "waypoints": intent.waypoints,
            "requestedDestination": intent.destination,
            "resolvedDestination": resolved_dest_name,
            "destinationMatch": destination_match,
            "transport": intent.transport,
            "durationDays": intent.durationDays,
            "totalRidingHours": total_riding_hours,
            "durationFeasible": duration_feasible,
            "userBudget": user_budget,
            "totalCost": total_estimated_cost,
            "budgetFeasible": budget_feasible,
        }

        return ValidationReport(
            requestedDestination=intent.destination,
            resolvedDestination=resolved_dest_name,
            destinationMatch=destination_match,
            durationFeasible=duration_feasible,
            budgetFeasible=budget_feasible,
            maxDrivingHoursPerDay=cls.MAX_DRIVING_HOURS_PER_DAY,
            totalRidingHours=total_riding_hours,
            warnings=warnings,
            decisionFacts=decision_facts
        )

trip_validator = TripValidator()
