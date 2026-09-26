"""
FastAPI API v1 routes for AI Travel Intelligence Engine.
Exposes endpoints for plan generation, single-destination discovery, conversational chat,
and interactive itinerary modifications.
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.ai.schemas import (
    AITravelPlanRequest, AITravelPlanResponse, AIModifyPlanRequest
)
from backend.app.ai.travel_agent import AITravelAgent

router = APIRouter(prefix="/ai_travel", tags=["AI Travel Intelligence Engine"])

@router.post("/plan", response_model=AITravelPlanResponse)
async def generate_ai_plan(request: AITravelPlanRequest):
    try:
        response = await AITravelAgent.generate_plan(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Travel Intelligence error: {str(e)}"
        )

@router.post("/discover", response_model=AITravelPlanResponse)
async def discover_ai_destination(request: AITravelPlanRequest):
    try:
        response = await AITravelAgent.generate_plan(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Destination Discovery error: {str(e)}"
        )

@router.post("/chat", response_model=AITravelPlanResponse)
async def ai_travel_chat(request: AITravelPlanRequest):
    try:
        response = await AITravelAgent.generate_plan(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Travel Chat error: {str(e)}"
        )

@router.post("/modify", response_model=AITravelPlanResponse)
async def modify_ai_plan(request: AIModifyPlanRequest):
    try:
        response = await AITravelAgent.modify_plan(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Plan Modification error: {str(e)}"
        )
