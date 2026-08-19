import re
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class StructuredTripIntent(BaseModel):
    origin: Optional[str] = Field(default=None, description="Trip starting location")
    destination: Optional[str] = Field(default=None, description="Requested target destination")
    waypoints: List[str] = Field(default_factory=list, description="Intermediate stops requested via/through")
    trail: Optional[str] = Field(default=None, description="Curated trail slug (e.g. arupadai-veedu)")
    transport: str = Field(default="motorcycle", description="Transport mode: motorcycle, car, bus")
    tripType: str = Field(default="round_trip", description="round_trip or one_way")
    durationDays: int = Field(default=1, description="Requested duration in days")
    budget: Optional[float] = Field(default=None, description="Budget in INR")
    departureTime: str = Field(default="06:00", description="Departure time in HH:MM 24h format")
    overnightTravel: bool = Field(default=False, description="True if departure is at night / overnight ride")
    interests: List[str] = Field(default_factory=list, description="Extracted interest tags")
    foodPreferences: List[str] = Field(default_factory=list, description="Food preferences / requested local dishes")
    intentCategory: str = Field(default="PLAN_TRIP", description="Categorized intent: GREETING, ARUPADAI_VEEDU_TRAIL, FOOD_DISCOVERY, ADD_STOP, REMOVE_STOP, CHANGE_DURATION, CHANGE_BUDGET")

class IntentExtractor:
    ARUPADAI_VEEDU_TEMPLES = [
        "Thiruttani Murugan Temple",
        "Swamimalai Murugan Temple",
        "Palani Murugan Temple",
        "Tiruchendur Murugan Temple",
        "Pazhamudircholai Murugan Temple",
        "Thirupparankundram Murugan Temple"
    ]

    COMMON_TYPOS: Dict[str, str] = {
        "madurau": "madurai",
        "maduraii": "madurai",
        "chenai": "chennai",
        "oothy": "ooty",
        "ooti": "ooty",
        "aruppukotai": "aruppukottai",
        "kodai": "kodaikanal",
        "swamimali": "swamimalai",
        "tiruchendur": "tiruchendur",
        "thiruttani": "thiruttani",
    }

    FOOD_KEYWORDS = [
        "food", "foods", "eat", "eating", "restaurant", "mess", "biryani",
        "jigarthanda", "parotta", "idli", "dosa", "halwa", "snack", "taste",
        "dining", "dish", "dishes", "culinary", "breakfast", "lunch", "dinner",
        "tasting", "cuisine", "food spots", "eateries"
    ]

    @classmethod
    def normalize_query(cls, text: str) -> str:
        s = text.lower().strip()
        words = s.split()
        normalized_words = [cls.COMMON_TYPOS.get(w, w) for w in words]
        s = " ".join(normalized_words)

        s = re.sub(r"^a\s+trip\s+to\s+([a-z0-9\s]+?)\s+to\s+", r"from \1 to ", s)
        s = re.sub(r"^trip\s+to\s+([a-z0-9\s]+?)\s+to\s+", r"from \1 to ", s)
        s = re.sub(r"^plan\s+a?\s*trip\s+to\s+([a-z0-9\s]+?)\s+to\s+", r"from \1 to ", s)
        return s

    @classmethod
    def extract_intent(cls, text: str, current_state: Optional[dict] = None) -> StructuredTripIntent:
        current = current_state or {}
        lower = cls.normalize_query(text)

        origin = current.get("origin")
        destination = current.get("destination")
        waypoints = list(current.get("waypoints", []))
        trail = current.get("trail")
        transport_mode = current.get("transport", "motorcycle")
        duration = current.get("durationDays", 1)
        budget = current.get("budget")
        departure_time = current.get("departureTime", "06:00")
        overnight_travel = current.get("overnightTravel", False)
        interests = set(current.get("interests", []))
        food_prefs = list(current.get("foodPreferences", []))
        intent_category = "PLAN_TRIP"

        # 0. Greeting Check
        if lower in ["hi", "hello", "hey", "greetings", "good morning", "good evening"]:
            intent_category = "GREETING"

        # 1. Food Query Recognition
        is_food_query = any(k in lower for k in cls.FOOD_KEYWORDS)
        if is_food_query and intent_category != "GREETING":
            interests.add("food")
            intent_category = "FOOD_DISCOVERY"
            if "jigarthanda" in lower:
                food_prefs.append("Famous Madurai Jigarthanda")
            if "parotta" in lower or "kari dosa" in lower:
                food_prefs.append("Kari Dosa & Parotta")
            if "idli" in lower:
                food_prefs.append("Murugan Soft Idlis")

        # 2. Strict Curated Trail Recognition (EXPLICIT THEMATIC KEYWORDS ONLY)
        EXPLICIT_TRAIL_KEYWORDS = [
            "arupadai", "arupadai veedu", "six murugan", "6 murugan",
            "six abodes", "murugan circuit", "sacred murugan circuit", "all six abodes"
        ]
        if any(kw in lower for kw in EXPLICIT_TRAIL_KEYWORDS) and intent_category != "GREETING":
            trail = "arupadai-veedu"
            intent_category = "ARUPADAI_VEEDU_TRAIL"
            interests.add("spiritual")
            interests.add("temple")
            duration = max(duration, 3)

            if not destination or destination not in cls.ARUPADAI_VEEDU_TEMPLES:
                destination = cls.ARUPADAI_VEEDU_TEMPLES[-1]
            
            for temple in cls.ARUPADAI_VEEDU_TEMPLES[:-1]:
                if temple not in waypoints:
                    waypoints.append(temple)

        # 3. Departure Time & Overnight Parsing
        time_match = re.search(r"(?:at|departing at|starting at)?\s*(\d{1,2})(?::(\d{2}))?\s*(pm|am|night|evening)", lower)
        if time_match:
            hr = int(time_match.group(1))
            mn = int(time_match.group(2)) if time_match.group(2) else 0
            meridiem = time_match.group(3)
            if meridiem in ["pm", "night", "evening"] and hr < 12:
                hr += 12
            elif meridiem == "am" and hr == 12:
                hr = 0
            departure_time = f"{hr:02d}:{mn:02d}"
            if hr >= 20 or hr < 5 or "night" in lower or "overnight" in lower:
                overnight_travel = True
        elif "overnight" in lower or "night ride" in lower or "night" in lower:
            departure_time = "23:00"
            overnight_travel = True

        # 4. Origin & Destination Extraction Patterns (RUN FIRST SO WAYPOINTS CAN EXCLUDE DESTINATION)
        if not is_food_query and intent_category in ["PLAN_TRIP", "ADD_STOP"]:
            pattern_a = re.search(r"(?:from|starting at|departing)\s+([a-zA-Z0-9\s]+?)\s+to\s+([a-zA-Z0-9\s]+?)(?=\s+through|\s+via|\s+for|\s+at|\s+with|\s+a|\s+one|\s+under|\s+budget|$)", lower)
            if pattern_a:
                raw_orig = pattern_a.group(1).strip().capitalize()
                raw_dest = pattern_a.group(2).strip().capitalize()
                raw_dest = re.sub(r"\s+at\s+\d+.*$", "", raw_dest, flags=re.IGNORECASE)
                if len(raw_orig) > 2 and raw_orig.lower() not in ["a", "the"]:
                    origin = raw_orig
                if len(raw_dest) > 2 and raw_dest.lower() not in ["a", "the", "somewhere", "hills", "waterfalls"] and not trail:
                    destination = raw_dest
            else:
                pattern_b = re.search(r"to\s+([a-zA-Z0-9\s]+?)\s+from\s+([a-zA-Z0-9\s]+?)(?=\s+through|\s+via|\s+for|\s+at|\s+a|\s+one|\s+under|\s+budget|$)", lower)
                if pattern_b:
                    raw_dest = pattern_b.group(1).strip().capitalize()
                    raw_orig = pattern_b.group(2).strip().capitalize()
                    raw_dest = re.sub(r"\s+at\s+\d+.*$", "", raw_dest, flags=re.IGNORECASE)
                    if len(raw_dest) > 2 and raw_dest.lower() not in ["a", "the", "somewhere", "hills", "waterfalls"] and not trail:
                        destination = raw_dest
                    if len(raw_orig) > 2 and raw_orig.lower() not in ["a", "the"]:
                        origin = raw_orig
                else:
                    pattern_c = re.search(r"(?:plan\s+a?\s*(?:bike|car|ride|trip)?\s*to|to)\s+([a-zA-Z0-9\s]+?)(?=\s+from|\s+through|\s+via|\s+for|\s+at|\s+under|\s+budget|$)", lower)
                    if pattern_c:
                        raw_dest = pattern_c.group(1).strip().capitalize()
                        raw_dest = re.sub(r"\s+at\s+\d+.*$", "", raw_dest, flags=re.IGNORECASE)
                        if len(raw_dest) > 2 and raw_dest.lower() not in ["a", "the", "somewhere", "food", "spots"] and not trail:
                            destination = raw_dest

        # Clean city name if user asked for "Madurai" or "Ooty"
        if destination and "madurai" in destination.lower() and not trail:
            destination = "Madurai"
        if destination and "ooty" in destination.lower() and not trail:
            destination = "Ooty"
        if origin and "chennai" in origin.lower():
            origin = "Chennai"

        # 5. Waypoint / Stop Extraction (e.g. "through madurai", "via salem", "add ooty")
        waypoint_matches = re.findall(
            r"(?:through|via|by way of|stopping at|passing|include|add)\s+([a-zA-Z0-9\s]+?)(?=\s+to|\s+from|\s+for|\s+at|\s+under|\s+budget|\s+and|\s+food|\s+spots|$)",
            lower
        )
        for wp in waypoint_matches:
            candidate = wp.strip().capitalize()
            candidate = re.sub(r"\s+at\s+\d+.*$", "", candidate, flags=re.IGNORECASE)
            if len(candidate) > 2 and candidate.lower() not in ["a", "the", "food", "spots", "places", "stop", "stops", "temple", "temples", "bike", "car", "trip"]:
                if candidate.lower() != (destination or "").lower() and candidate.lower() != (origin or "").lower():
                    if candidate not in waypoints:
                        waypoints.append(candidate)
                        if not is_food_query and intent_category == "PLAN_TRIP":
                            intent_category = "ADD_STOP"

        if waypoints and destination in waypoints:
            waypoints.remove(destination)

        # 6. Duration Days Extraction
        if "one day" in lower or "1 day" in lower or "1-day" in lower:
            duration = 1
            if intent_category == "PLAN_TRIP": intent_category = "CHANGE_DURATION"
        elif "two day" in lower or "2 day" in lower or "2-day" in lower or "two days" in lower or "2 days" in lower:
            duration = 2
            if intent_category == "PLAN_TRIP": intent_category = "CHANGE_DURATION"
        elif "three day" in lower or "3 day" in lower or "3-day" in lower or "three days" in lower or "3 days" in lower:
            duration = 3
            if intent_category == "PLAN_TRIP": intent_category = "CHANGE_DURATION"
        elif "four day" in lower or "4 day" in lower or "4-day" in lower or "four days" in lower or "4 days" in lower:
            duration = 4
            if intent_category == "PLAN_TRIP": intent_category = "CHANGE_DURATION"
        elif "five day" in lower or "5 day" in lower or "5-day" in lower or "five days" in lower or "5 days" in lower:
            duration = 5
            if intent_category == "PLAN_TRIP": intent_category = "CHANGE_DURATION"

        # 7. Transport Mode Extraction
        if any(w in lower for w in ["bike", "motorcycle", "rider", "bullet", "riding"]):
            transport_mode = "motorcycle"
        elif any(w in lower for w in ["car", "drive", "taxi", "cab"]):
            transport_mode = "car"

        # 8. Budget Extraction
        budget_match = re.search(r"(?:under|budget|₹|\brs\.?)\s*(\d+)", lower)
        if budget_match:
            budget = float(budget_match.group(1))
            if intent_category == "PLAN_TRIP": intent_category = "CHANGE_BUDGET"

        # 9. Interests Extraction
        if any(w in lower for w in ["hill", "mountain", "ghat", "peak"]):
            interests.add("hills")
        if any(w in lower for w in ["waterfall", "falls", "cascade"]):
            interests.add("waterfalls")
        if any(w in lower for w in ["temple", "heritage", "shrine", "spiritual", "murugan"]):
            interests.add("temple")

        return StructuredTripIntent(
            origin=origin or "Chennai",
            destination=destination or "Madurai",
            waypoints=waypoints,
            trail=trail,
            transport=transport_mode,
            tripType="round_trip",
            durationDays=duration,
            budget=budget,
            departureTime=departure_time,
            overnightTravel=overnight_travel,
            interests=list(interests),
            foodPreferences=food_prefs,
            intentCategory=intent_category
        )

intent_extractor = IntentExtractor()
