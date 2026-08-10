import logging
import json
import time
from typing import Any, Dict

class StructuredJsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Extract custom context attributes if passed
        for key in ["trace_id", "request_id", "user_id", "path", "method", "status_code", "latency_ms"]:
            if hasattr(record, key):
                log_data[key] = getattr(record, key)
                
        return json.dumps(log_data)

def setup_logging():
    logger = logging.getLogger("explorer_tn")
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler()
    handler.setFormatter(StructuredJsonFormatter())
    
    logger.handlers.clear()
    logger.addHandler(handler)
    return logger

logger = setup_logging()
