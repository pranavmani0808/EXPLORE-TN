import time
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.services.web_crawl_service import web_crawl_service, CrawledUrlDTO

router = APIRouter(prefix="/crawl", tags=["Web Crawl Service Integration"])

class CrawlTriggerRequest(BaseModel):
    url: str
    maxPages: Optional[int] = 50

@router.get("/health", response_model=ResponseEnvelope[dict])
async def crawl_health(request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    health_status = web_crawl_service.check_health()
    return ResponseEnvelope(
        data=health_status,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.post("/trigger", response_model=ResponseEnvelope[dict])
async def trigger_crawl(payload: CrawlTriggerRequest, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    try:
        job = web_crawl_service.trigger_crawl(
            target_url=payload.url,
            max_pages=payload.maxPages or 50,
            trace_id=trace_id
        )
        return ResponseEnvelope(
            data=job,
            meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
        )
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

@router.get("/jobs/{job_id}", response_model=ResponseEnvelope[dict])
async def get_crawl_job(job_id: str, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    job = web_crawl_service.get_job_status(job_id, trace_id=trace_id)
    return ResponseEnvelope(
        data=job,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/jobs/{job_id}/urls", response_model=ResponseEnvelope[List[CrawledUrlDTO]])
async def get_crawled_urls(job_id: str, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    urls = web_crawl_service.get_crawled_urls(job_id, trace_id=trace_id)
    return ResponseEnvelope(
        data=urls,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

@router.get("/evidence", response_model=ResponseEnvelope[dict])
async def get_destination_evidence(destination: str, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    evidence = web_crawl_service.fetch_destination_evidence(destination, trace_id=trace_id)
    return ResponseEnvelope(
        data=evidence,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
