from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class AuditLogCreate(BaseModel):
    actorId: str
    actorName: str
    actorRole: str
    action: str
    entityType: str
    entityId: str
    entityName: str
    description: str
    beforeData: Optional[Dict[str, Any]] = None
    afterData: Optional[Dict[str, Any]] = None

class AuditLogResponse(BaseModel):
    id: str
    actorId: str
    actorName: str
    actorRole: str
    action: str
    entityType: str
    entityId: str
    entityName: str
    description: str
    beforeData: Optional[Dict[str, Any]] = None
    afterData: Optional[Dict[str, Any]] = None
    traceId: str
    createdAt: str
