import time
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.core.security import decode_supabase_jwt, UserContext
from backend.app.services.job_service import job_service

router = APIRouter(prefix="/jobs", tags=["Background Jobs"])

class JobCreatePayload(BaseModel):
    jobType: str = Field(..., json_schema_extra={"example": "GPX_PARSING"})
    payload: Dict[str, Any]
    idempotencyKey: Optional[str] = None

@router.post("", response_model=ResponseEnvelope[dict])
async def enqueue_job(
    job_in: JobCreatePayload,
    request: Request,
    current_user: UserContext = Depends(decode_supabase_jwt)
):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    job_record = job_service.create_job(
        job_type=job_in.jobType,
        payload=job_in.payload,
        user=current_user,
        trace_id=trace_id,
        idempotency_key=job_in.idempotencyKey
    )
    return ResponseEnvelope(
        data=job_record,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/{job_id}", response_model=ResponseEnvelope[dict])
async def get_job_status(
    job_id: str,
    request: Request,
    current_user: UserContext = Depends(decode_supabase_jwt)
):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    job_record = job_service.get_job_status(job_id, current_user)
    return ResponseEnvelope(
        data=job_record,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
