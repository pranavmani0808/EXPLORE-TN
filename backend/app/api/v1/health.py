from fastapi import APIRouter
import time
from backend.app.core.redis_manager import redis_manager

router = APIRouter(tags=["Health"])

@router.get("/healthz")
async def health_check():
    return {
        "status": "Healthy",
        "service": "ExplorerTN FastAPI Core",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }

@router.get("/readyz")
async def readiness_check():
    redis_health = redis_manager.check_health()
    redis_status_str = redis_health["status"]
    
    return {
        "status": "Ready" if redis_status_str == "healthy" else "Degraded",
        "database": "healthy",
        "redis": redis_status_str,
        "details": {
            "database": "PostgreSQL + PostGIS Pool Active",
            "redis": redis_health["details"]
        },
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
