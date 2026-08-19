from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from backend.app.services.routing.models import IsolatedRouteRequestDTO, IsolatedRouteResultDTO
from backend.app.services.routing.service import routing_service
from backend.app.services.intelligence.route_stop_engine import (
    RouteRecommendationRequest,
    RouteRecommendationResponse,
    route_stop_engine_service,
)

router = APIRouter(tags=["Isolated Route Engine"])

@router.post("/routes/calculate", response_model=Dict[str, Any])
@router.post("/routes", response_model=Dict[str, Any])
async def calculate_route_endpoint(request: IsolatedRouteRequestDTO):
    if not request.origin or not request.destination:
        raise HTTPException(status_code=400, detail="Origin and Destination coordinates are required.")
    
    result: IsolatedRouteResultDTO = routing_service.calculate_isolated_route(request)
    return {
        "status": "success",
        "data": result.model_dump()
    }

@router.post("/routes/recommend-stops", response_model=Dict[str, Any])
async def recommend_stops_endpoint(request: RouteRecommendationRequest):
    if not request.routePolyline or len(request.routePolyline) < 2:
        raise HTTPException(status_code=400, detail="Route polyline with at least 2 points is required.")
    
    response: RouteRecommendationResponse = route_stop_engine_service.recommend_stops(request)
    return {
        "status": "success",
        "data": response.model_dump()
    }
