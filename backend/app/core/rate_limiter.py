import time
from typing import Dict, List, Tuple
from fastapi import Request
from backend.app.core.exceptions import APIException
from backend.app.core.redis_manager import redis_manager

class RateLimitExceededException(APIException):
    def __init__(self, retry_after: int = 60):
        super().__init__(
            status_code=429,
            code="RATE_LIMIT_EXCEEDED",
            message=f"Rate limit exceeded. Too many requests. Please try again in {retry_after} seconds.",
            details={"retryAfter": retry_after}
        )

class RateLimiterService:
    def __init__(self):
        # In-memory sliding window fallback: key -> list of timestamps
        self._history: Dict[str, List[float]] = {}

    def check_rate_limit(self, identifier: str, limit: int = 120, window_seconds: int = 60):
        """
        Sliding Window Rate Limiter:
        - Keyed by client IP or authenticated User ID.
        - Keeps track of timestamps within sliding window.
        - Throws RateLimitExceededException (HTTP 429) when limit is breached.
        """
        now = time.time()
        window_start = now - window_seconds
        
        # Redis sliding window attempt
        redis_key = f"ratelimit:{identifier}"
        redis_history = redis_manager.get_key(redis_key) or []
        
        # Filter timestamps older than sliding window
        valid_redis_history = [t for t in redis_history if t > window_start]
        valid_redis_history.append(now)
        redis_manager.set_key(redis_key, valid_redis_history, ttl_seconds=window_seconds)

        if len(valid_redis_history) > limit:
            retry_after = int(window_seconds - (now - valid_redis_history[0]))
            raise RateLimitExceededException(retry_after=max(1, retry_after))

        # Backup memory sliding window
        if identifier not in self._history:
            self._history[identifier] = []
        
        timestamps = [t for t in self._history[identifier] if t > window_start]
        timestamps.append(now)
        self._history[identifier] = timestamps

        if len(timestamps) > limit:
            retry_after = int(window_seconds - (now - timestamps[0]))
            raise RateLimitExceededException(retry_after=max(1, retry_after))

rate_limiter = RateLimiterService()

def check_rate_limit(prefix: str = "global", limit: int = 120, window_seconds: int = 60):
    async def dependency(request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        identifier = f"{prefix}:{client_ip}"
        rate_limiter.check_rate_limit(identifier, limit=limit, window_seconds=window_seconds)
    return dependency
