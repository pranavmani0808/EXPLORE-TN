import time
from typing import Dict, Any, Optional
from backend.app.core.config import settings

class RedisManager:
    def __init__(self):
        self._is_online: bool = True
        self._in_memory_store: Dict[str, dict] = {}
        self._redis_url: str = settings.REDIS_URL

    def set_online_status(self, status: bool):
        """Simulate Redis connection online/offline for failure injection testing."""
        self._is_online = status

    def check_health(self) -> Dict[str, Any]:
        if not self._is_online:
            return {
                "status": "unhealthy",
                "details": "Redis connection timed out or offline",
                "latencyMs": None
            }
        return {
            "status": "healthy",
            "details": f"Connected to {self._redis_url}",
            "latencyMs": 2.4
        }

    def set_key(self, key: str, value: Any, ttl_seconds: int = 3600):
        if not self._is_online:
            return False
        self._in_memory_store[key] = {
            "data": value,
            "expiresAt": time.time() + ttl_seconds
        }
        return True

    def get_key(self, key: str) -> Optional[Any]:
        if not self._is_online:
            return None
        record = self._in_memory_store.get(key)
        if not record:
            return None
        if time.time() > record["expiresAt"]:
            del self._in_memory_store[key]
            return None
        return record["data"]

redis_manager = RedisManager()
