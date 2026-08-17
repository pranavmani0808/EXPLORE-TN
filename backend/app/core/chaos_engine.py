from backend.app.core.exceptions import APIException
from backend.app.core.redis_manager import redis_manager

class DatabaseUnavailableException(APIException):
    def __init__(self):
        super().__init__(
            status_code=503,
            code="DATABASE_UNAVAILABLE",
            message="Database connection pool is unavailable or interrupted. Please try again shortly.",
            details={"retryable": True}
        )

class GatewayTimeoutException(APIException):
    def __init__(self, provider: str = "Gemini AI"):
        super().__init__(
            status_code=504,
            code="GATEWAY_TIMEOUT",
            message=f"External provider '{provider}' timed out after 10,000ms limit.",
            details={"provider": provider, "retryable": True}
        )

class ChaosEngineService:
    def __init__(self):
        self._db_offline: bool = False
        self._external_timeout: bool = False

    def set_database_offline(self, status: bool):
        self._db_offline = status

    def set_external_timeout(self, status: bool):
        self._external_timeout = status

    def check_database_health(self):
        if self._db_offline:
            raise DatabaseUnavailableException()

    def check_external_provider_health(self, provider: str = "Gemini AI"):
        if self._external_timeout:
            raise GatewayTimeoutException(provider)

chaos_engine = ChaosEngineService()
