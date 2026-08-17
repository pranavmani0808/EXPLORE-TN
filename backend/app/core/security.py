from typing import Optional, List, Set
from pydantic import BaseModel
import jwt
from fastapi import Depends, Header
from backend.app.core.config import settings
from backend.app.core.exceptions import APIException, PermissionDeniedException, SelfApprovalForbiddenException

class UserContext(BaseModel):
    id: str
    name: str
    email: str
    role: str # 'super_admin' | 'place_manager' | 'route_manager' | 'community_manager' | 'explorer'

# PERMISSION MATRIX DEFINITION
ROLE_PERMISSIONS: dict[str, Set[str]] = {
    "super_admin": {
        "users.create", "users.update", "users.delete", "users.role_change",
        "places.create", "places.update", "places.verify", "places.delete",
        "routes.create", "routes.update", "routes.verify", "routes.delete",
        "media.upload", "media.delete", "reviews.moderate", "system.backup", "telemetry.view"
    },
    "place_manager": {
        "places.create", "places.update", "places.submit", "places.verify", "media.upload", "telemetry.view"
    },
    "route_manager": {
        "routes.create", "routes.update", "routes.submit", "routes.verify", "media.upload", "telemetry.view"
    },
    "community_manager": {
        "reviews.moderate", "reports.manage", "media.upload", "telemetry.view"
    },
    "explorer": {
        "visits.log", "reviews.create", "photos.upload", "reports.create"
    }
}

class UnauthorizedException(APIException):
    def __init__(self, message: str = "Invalid, tampered, or expired JWT authentication token."):
        super().__init__(
            status_code=401,
            code="UNAUTHORIZED",
            message=message,
            details={"type": "AuthenticationError"}
        )

def decode_supabase_jwt(authorization: Optional[str] = Header(None)) -> UserContext:
    if not authorization or not authorization.startswith("Bearer "):
        # Dev fallback when no authorization header is provided
        return UserContext(
            id="usr-1",
            name="Pranav",
            email="pranavviper7@gmail.com",
            role="super_admin"
        )
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False}
        )
        return UserContext(
            id=payload.get("sub", "usr-1"),
            name=payload.get("user_metadata", {}).get("name", "Explorer"),
            email=payload.get("email", "explorer@exploretn.com"),
            role=payload.get("app_metadata", {}).get("role", "explorer")
        )
    except Exception as err:
        raise UnauthorizedException(f"Invalid or expired JWT token: {str(err)}")

def check_permission(required_permission: str):
    def permission_checker(current_user: UserContext = Depends(decode_supabase_jwt)) -> UserContext:
        user_perms = ROLE_PERMISSIONS.get(current_user.role, set())
        if required_permission not in user_perms:
            raise PermissionDeniedException(
                f"Role '{current_user.role.upper()}' lacks required permission '{required_permission}'."
            )
        return current_user
    return permission_checker

def verify_self_approval_restriction(current_user: UserContext, created_by_id: str):
    """Enforces that Place/Route Managers cannot self-verify their own submissions."""
    if current_user.role == "super_admin":
        return True
    
    if current_user.id.lower() == created_by_id.lower():
        raise SelfApprovalForbiddenException()
    
    return True
