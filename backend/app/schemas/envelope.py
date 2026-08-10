from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, Any

T = TypeVar("T")

class MetaInfo(BaseModel):
    traceId: str
    timestamp: str

class ResponseEnvelope(BaseModel, Generic[T]):
    data: T
    meta: MetaInfo
