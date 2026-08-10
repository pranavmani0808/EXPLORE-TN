import time
import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from backend.app.core.config import settings
from backend.app.core.exceptions import (
    APIException,
    api_exception_handler,
    request_validation_exception_handler,
    global_exception_handler,
)
from backend.app.api.v1.places import router as places_router
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.admin import router as admin_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Trace ID Injection & Latency Logging Middleware
@app.middleware("http")
async def trace_and_log_middleware(request: Request, call_next):
    trace_id = f"tr-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}"
    request.state.trace_id = trace_id
    
    start_time = time.time()
    response = await call_next(request)
    process_time = round((time.time() - start_time) * 1000, 2)
    
    response.headers["X-Trace-ID"] = trace_id
    response.headers["X-Response-Time-Ms"] = str(process_time)
    return response

# Register Exception Handlers
app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(RequestValidationError, request_validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Include Routers
app.include_router(health_router)
app.include_router(places_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
