"""
Intent parsing engine leveraging Gemini API JSON mode with rule-based fallback.
Classifies query into IntentType and extracts origin, destination, days, interests, budget, etc.
"""

import json
import logging
import re
import httpx
from typing import Dict, Any, Optional
from backend.app.core.config import settings
from backend.app.ai.schemas import StructuredTripIntent, IntentType

logger = logging.getLogger(__name__)

GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

class IntentParser:
    """
    Parses natural-language travel requests into StructuredTripIntent objects.
    """

    @classmethod
    async def parse_intent(cls, query: str, context: Optional[Dict[str, Any]] = None) -> StructuredTripIntent:
        query_clean = query.strip()

        if settings.GEMINI_API_KEY:
            try:
                llm_result = await cls._parse_with_gemini(query_clean, context)
                if llm_result:
                    return llm_result
            except Exception as e:
                logger.warning(f"Gemini API intent parsing failed: {e}. Falling back to rule-based parser.")

        return cls._parse_rule_based(query_clean, context)

    @classmethod
    async def _parse_with_gemini(cls, query: str, context: Optional[Dict[str, Any]] = None) -> Optional[StructuredTripIntent]:
        system_prompt = (
            "You are an expert Tamil Nadu AI travel intent parser. Analyze the user request and return JSON matching this schema:\n"
            "{\n"
            '  "intent_type": "ROUTE_PLANNING" | "SINGLE_DESTINATION_DISCOVERY" | "NATURAL_LANGUAGE_PLANNING" | "PLAN_MODIFY",\n'
            '  "origin": "City/Location name or null",\n'
            '  "destination": "City/Location name or null",\n'
            '  "days": integer (default 1),\n'
            '  "travelers": integer (default 1),\n'
            '  "interests": ["list", "of", "interests"],\n'
            '  "budget": "budget" | "moderate" | "luxury",\n'
            '  "transport_mode": "driving" | "transit" | "walking",\n'
            '  "max_driving_hours": float (default 8.0),\n'
            '  "radius_km": float (default 50.0),\n'
            '  "categories": ["list", "of", "categories"],\n'
            '  "constraints": ["list", "of", "constraints"]\n'
            "}"
        )

        user_content = f"User Request: '{query}'"
        if context:
            user_content += f"\nContext: {json.dumps(context)}"

        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": system_prompt}, {"text": user_content}]}
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }

        url = f"{GEMINI_ENDPOINT}?key={settings.GEMINI_API_KEY}"
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                intent_dict = json.loads(text)
                intent_dict["raw_query"] = query
                return StructuredTripIntent(**intent_dict)

        return None

    @classmethod
    def _parse_rule_based(cls, query: str, context: Optional[Dict[str, Any]] = None) -> StructuredTripIntent:
        q_lower = query.lower()

        days_match = re.search(r'(\d+)\s*(?:-\s*)?days?', q_lower)
        days = int(days_match.group(1)) if days_match else 1

        from_to_match = re.search(r'(?:from\s+)?([a-zA-Z0-9\s-]+?)\s+to\s+([a-zA-Z0-9\s-]+)', q_lower)

        origin = None
        destination = None
        intent_type = IntentType.NATURAL_LANGUAGE_PLANNING

        if from_to_match:
            g1 = from_to_match.group(1).strip()
            g2 = from_to_match.group(2).strip()

            g1_clean = re.sub(r'^(?:plan\s+a\s+)?(?:\d+\s*-\s*|\d+\s*)?days?\s*trips?\s*(?:from\s+)?', '', g1, flags=re.IGNORECASE).strip()
            g2_clean = re.sub(r'\s*(?:with|for|in|focusing).*$', '', g2, flags=re.IGNORECASE).strip()

            if g1_clean and g2_clean:
                origin = g1_clean.title()
                destination = g2_clean.title()
                intent_type = IntentType.ROUTE_PLANNING

        if not origin and not destination:
            near_match = re.search(r'(?:near|in|around|about)\s+([a-zA-Z\s]+)', q_lower)
            if near_match:
                destination = near_match.group(1).strip().title()
                intent_type = IntentType.SINGLE_DESTINATION_DISCOVERY
            else:
                destination = query.strip().title()
                intent_type = IntentType.SINGLE_DESTINATION_DISCOVERY

        categories = []
        interests = []
        cat_keywords = {
            "beach": "coastal", "beaches": "coastal",
            "temple": "temple", "temples": "temple",
            "waterfall": "waterfall", "waterfalls": "waterfall",
            "heritage": "heritage", "history": "heritage",
            "hill": "mountain", "hills": "mountain", "mountain": "mountain",
            "food": "food", "cuisine": "food",
            "fort": "fort", "forts": "fort"
        }
        for kw, cat in cat_keywords.items():
            if kw in q_lower:
                categories.append(cat)
                interests.append(kw)

        return StructuredTripIntent(
            intent_type=intent_type,
            raw_query=query,
            origin=origin,
            destination=destination,
            days=max(1, min(14, days)),
            travelers=1,
            interests=list(set(interests)),
            budget="moderate",
            transport_mode="driving",
            max_driving_hours=8.0,
            radius_km=50.0,
            categories=list(set(categories)),
            constraints=[]
        )
