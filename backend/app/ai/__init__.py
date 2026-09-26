"""
AI Travel Intelligence Module for ExploreTN.
Integrates Gemini LLM reasoning with PostGIS spatial database queries,
Google Maps/OSRM routing engines, and web discovery.
"""

from backend.app.ai.travel_agent import AITravelAgent

__all__ = ["AITravelAgent"]
