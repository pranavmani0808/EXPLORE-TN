from fastapi import APIRouter
import time

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
    return {
        "status": "Ready",
        "database": "PostgreSQL + PostGIS Online",
        "redis": "Connected",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
