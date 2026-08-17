import time
from typing import Dict, Any, Optional

class IdempotencyService:
    def __init__(self):
        self._cache: Dict[str, dict] = {} # key -> response_payload

    def get_cached_response(self, key: str) -> Optional[dict]:
        record = self._cache.get(key)
        if not record:
            return None
        if time.time() > record["expiresAt"]:
            del self._cache[key]
            return None
        return record["payload"]

    def cache_response(self, key: str, payload: dict, ttl_seconds: int = 86400):
        self._cache[key] = {
            "payload": payload,
            "expiresAt": time.time() + ttl_seconds
        }

idempotency_service = IdempotencyService()
