from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from backend.app.services.routing.models import IsolatedRouteRequestDTO, IsolatedRouteResultDTO
from backend.app.services.routing.service import routing_service

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
