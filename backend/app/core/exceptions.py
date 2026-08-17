from fastapi import HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from typing import Optional

class ErrorDetail(BaseModel):
    code: str
    message: str
    traceId: str
    errorCategory: Optional[str] = "INTERNAL_ERROR"
    details: Optional[dict] = None

class ErrorEnvelope(BaseModel):
    error: ErrorDetail

class APIException(HTTPException):
    def __init__(self, status_code: int, code: str, message: str, error_category: Optional[str] = None, details: Optional[dict] = None):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message
        self.details = details
        self.error_category = error_category or self._infer_error_category(status_code, code)

    def _infer_error_category(self, status_code: int, code: str) -> str:
        if status_code in [401, 403]:
            return "AUTH_ERROR"
        if status_code in [400, 404, 409]:
            return "VALIDATION_ERROR"
        if status_code == 429:
            return "RATE_LIMIT_ERROR"
        if status_code == 503 and "DATABASE" in code:
            return "DATABASE_ERROR"
        if status_code == 504 and ("GATEWAY" in code or "GEMINI" in code):
            return "AI_PROVIDER_ERROR"
        if status_code == 504:
            return "EXTERNAL_API_ERROR"
        return "INTERNAL_ERROR"

class PermissionDeniedException(APIException):
    def __init__(self, message: str = "Insufficient platform permissions for this operation."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            message=message,
            error_category="AUTH_ERROR"
        )

class ResourceNotFoundException(APIException):
    def __init__(self, entity: str, identifier: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="RESOURCE_NOT_FOUND",
            message=f"{entity} with identifier '{identifier}' was not found.",
            error_category="VALIDATION_ERROR"
        )

class ValidationException(APIException):
    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            message=message,
            error_category="VALIDATION_ERROR",
            details=details,
        )

class ConflictException(APIException):
    def __init__(self, message: str = "This record was modified by another user. Refresh before saving."):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="CONFLICT",
            message=message,
            error_category="VALIDATION_ERROR"
        )

class SelfApprovalForbiddenException(APIException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="SELF_APPROVAL_DISABLED",
            message="Self-verification disabled: Submissions require Super Admin or independent Verifier QA review.",
            error_category="AUTH_ERROR"
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
                errorCategory=getattr(exc, "error_category", "INTERNAL_ERROR"),
                details=exc.details
            )
        ).model_dump()
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    trace_id = getattr(request.state, "trace_id", "tr-default")
    code_str = "RESOURCE_NOT_FOUND" if exc.status_code == 404 else "HTTP_ERROR"
    cat_str = "VALIDATION_ERROR" if exc.status_code == 404 else "INTERNAL_ERROR"
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorEnvelope(
            error=ErrorDetail(
                code=code_str,
                message=str(exc.detail),
                traceId=trace_id,
                errorCategory=cat_str
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
                traceId=trace_id,
                errorCategory="VALIDATION_ERROR"
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
                traceId=trace_id,
                errorCategory="INTERNAL_ERROR"
            )
        ).model_dump()
    )
