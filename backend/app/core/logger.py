import json
import time
import logging
from typing import Dict, Any, Optional

class StructuredLogger:
    def __init__(self, service_name: str = "ExplorerTN-Backend"):
        self.service_name = service_name
        self._logger = logging.getLogger(service_name)
        self._logger.setLevel(logging.INFO)
        if not self._logger.handlers:
            handler = logging.StreamHandler()
            handler.setFormatter(logging.Formatter("%(message)s"))
            self._logger.addHandler(handler)

    def format_log(
        self,
        level: str,
        message: str,
        trace_id: str,
        actor_id: Optional[str] = None,
        actor_role: Optional[str] = None,
        endpoint: Optional[str] = None,
        method: Optional[str] = None,
        status_code: Optional[int] = None,
        total_ms: Optional[float] = None,
        db_ms: float = 0.0,
        redis_ms: float = 0.0,
        external_ms: float = 0.0,
        error_category: Optional[str] = None,
        extra: Optional[Dict[str, Any]] = None
    ) -> str:
        log_payload = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "service": self.service_name,
            "level": level,
            "message": message,
            "traceId": trace_id,
            "actorId": actor_id or "usr-anonymous",
            "actorRole": actor_role or "EXPLORER",
            "endpoint": endpoint,
            "method": method,
            "statusCode": status_code,
            "latencyMs": {
                "total": round(total_ms, 2) if total_ms is not None else 0.0,
                "db": round(db_ms, 2),
                "redis": round(redis_ms, 2),
                "external": round(external_ms, 2)
            },
            "errorCategory": error_category,
            "extra": extra or {}
        }
        return json.dumps(log_payload)

    def info(self, message: str, trace_id: str, **kwargs):
        log_str = self.format_log("INFO", message, trace_id, **kwargs)
        self._logger.info(log_str)

    def warning(self, message: str, trace_id: str, **kwargs):
        log_str = self.format_log("WARNING", message, trace_id, **kwargs)
        self._logger.warning(log_str)

    def error(self, message: str, trace_id: str, error_category: str = "INTERNAL_ERROR", **kwargs):
        log_str = self.format_log("ERROR", message, trace_id, error_category=error_category, **kwargs)
        self._logger.error(log_str)

structured_logger = StructuredLogger()
