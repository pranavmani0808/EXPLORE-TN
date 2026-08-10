from fastapi import HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from typing import Optional

class ErrorDetail(BaseModel):
    code: str
    message: str
    traceId: str
    details: Optional[dict] = None

class ErrorEnvelope(BaseModel):
    error: ErrorDetail

class APIException(HTTPException):
    def __init__(self, status_code: int, code: str, message: str, details: Optional[dict] = None):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message
        self.details = details

class PermissionDeniedException(APIException):
    def __init__(self, message: str = "Insufficient platform permissions for this operation."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            message=message,
        )

class ResourceNotFoundException(APIException):
    def __init__(self, entity: str, identifier: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="RESOURCE_NOT_FOUND",
            message=f"{entity} with identifier '{identifier}' was not found.",
        )

class ValidationException(APIException):
    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            message=message,
            details=details,
        )

class SelfApprovalForbiddenException(APIException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="SELF_APPROVAL_DISABLED",
            message="Self-verification disabled: Submissions require Super Admin or independent Verifier QA review.",
        )

async def api_exception_handler(request: Request, exc: APIException):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorEnvelope(
            error=ErrorDetail(
                code=exc.code,
                message=exc.message,
                traceId=trace_id,
                details=exc.details
            )
        ).model_dump()
    )

async def request_validation_exception_handler(request: Request, exc: RequestValidationError):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    first_err = exc.errors()[0]
    msg = str(first_err.get("msg", "Validation error occurred."))
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=ErrorEnvelope(
            error=ErrorDetail(
                code="VALIDATION_ERROR",
                message=msg,
                traceId=trace_id
            )
        ).model_dump()
    )

async def global_exception_handler(request: Request, exc: Exception):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    return JSONResponse(
        status_code=500,
        content=ErrorEnvelope(
            error=ErrorDetail(
                code="INTERNAL_SERVER_ERROR",
                message="An internal server error occurred.",
                traceId=trace_id
            )
        ).model_dump()
    )
