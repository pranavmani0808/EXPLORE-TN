import time
import httpx
from typing import Dict, Any, Optional
from pydantic import BaseModel
from backend.app.core.logger import structured_logger
from backend.app.core.security_guard import security_guard

class ExternalApiProxyRequestDTO(BaseModel):
    url: str
    method: Optional[str] = "GET"
    headers: Optional[Dict[str, str]] = None
    queryParams: Optional[Dict[str, Any]] = None
    body: Optional[Dict[str, Any]] = None
    timeoutSeconds: Optional[float] = 3.0

class ExternalApiResponseDTO(BaseModel):
    url: str
    statusCode: int
    data: Any
    latencyMs: float
    retrievedAt: str

class ExternalApiService:
    def execute_proxy_request(self, payload: ExternalApiProxyRequestDTO, trace_id: str = "tr-proxy-default") -> ExternalApiResponseDTO:
        """
        Generic REST & GraphQL API proxy client with SSRF security verification.
        """
        start_time = time.time()
        target_url = payload.url

        structured_logger.info(
            message=f"Executing External API Proxy call [{payload.method}] -> '{target_url}'",
            trace_id=trace_id,
            endpoint="ExternalApiService.execute_proxy_request"
        )

        # Enforce SSRF Security Policy
        ssrf_check = security_guard.validate_ssrf_target(target_url)
        if not ssrf_check["allowed"]:
            raise ValueError(f"Security Guard Block: Target URL '{target_url}' failed SSRF safety checks. {ssrf_check['reason']}")

        method = (payload.method or "GET").upper()
        headers = payload.headers or {"User-Agent": "ExplorerTN-API-Connector/1.0"}
        timeout = payload.timeoutSeconds or 3.0

        try:
            with httpx.Client(timeout=timeout) as client:
                res = client.request(
                    method=method,
                    url=target_url,
                    headers=headers,
                    params=payload.queryParams,
                    json=payload.body if method in ["POST", "PUT", "PATCH"] else None
                )
                latency = round((time.time() - start_time) * 1000, 2)
                
                try:
                    response_data = res.json()
                except Exception:
                    response_data = res.text

                return ExternalApiResponseDTO(
                    url=target_url,
                    statusCode=res.status_code,
                    data=response_data,
                    latencyMs=latency,
                    retrievedAt=time.strftime("%Y-%m-%dT%H:%M:%SZ")
                )
        except Exception as err:
            latency = round((time.time() - start_time) * 1000, 2)
            structured_logger.warning(
                message=f"External API call failed: {str(err)}",
                trace_id=trace_id,
                endpoint="ExternalApiService"
            )
            return ExternalApiResponseDTO(
                url=target_url,
                statusCode=502,
                data={"error": f"External API request error: {str(err)}"},
                latencyMs=latency,
                retrievedAt=time.strftime("%Y-%m-%dT%H:%M:%SZ")
            )

external_api_service = ExternalApiService()
