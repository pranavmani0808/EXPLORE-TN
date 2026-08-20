import time
from typing import Optional
from fastapi import APIRouter, Request
from pydantic import BaseModel
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.core.security import get_optional_user
from backend.app.services.planner_service import planner_service

router = APIRouter(prefix="/planner", tags=["AI Trip Planner"])

class PlannerChatRequest(BaseModel):
    conversationId: Optional[str] = None
    message: str

@router.post("/chat", response_model=ResponseEnvelope[dict])
async def planner_chat(request_data: PlannerChatRequest, request: Request):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    auth_user = get_optional_user(request.headers.get("Authorization"))
    user_id = auth_user.id if auth_user else "anonymous"

    response_payload = planner_service.process_chat_message(
        conversation_id=request_data.conversationId,
        user_message=request_data.message,
        trace_id=trace_id,
        user_id=user_id
    )
    return ResponseEnvelope(
        data=response_payload,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )
