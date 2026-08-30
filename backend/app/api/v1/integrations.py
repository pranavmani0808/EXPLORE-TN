import time
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Request, HTTPException, Query
from backend.app.schemas.envelope import ResponseEnvelope, MetaInfo
from backend.app.services.weather_service import weather_service, WeatherForecastDTO
from backend.app.services.ttdc_service import ttdc_service, TTDCAdvisoryDTO
from backend.app.services.geocoding_service import geocoding_service, GeocodeResultDTO
from backend.app.services.external_api_service import external_api_service, ExternalApiProxyRequestDTO, ExternalApiResponseDTO

router = APIRouter(prefix="/integrations", tags=["External API Connectors Suite"])

# 1. OpenWeather / Weather Forecast API Endpoint
@router.get("/weather", response_model=ResponseEnvelope[WeatherForecastDTO])
async def get_weather(
    destination: str = Query(..., description="Destination name (e.g. Ooty, Madurai, Valparai)"),
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    request: Request = None
):
    trace_id = getattr(request.state, "trace_id", "tr-weather") if request else "tr-weather"
    forecast = weather_service.get_weather_forecast(destination=destination, lat=lat, lon=lon, trace_id=trace_id)
    return ResponseEnvelope(
        data=forecast,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 2. TTDC Official Tourism Advisories API Endpoint
@router.get("/ttdc/advisories", response_model=ResponseEnvelope[List[TTDCAdvisoryDTO]])
async def get_ttdc_advisories(
    district: Optional[str] = Query(None, description="District filter (e.g. Namakkal, Theni)"),
    request: Request = None
):
    trace_id = getattr(request.state, "trace_id", "tr-ttdc") if request else "tr-ttdc"
    advisories = ttdc_service.get_official_advisories(district=district, trace_id=trace_id)
    return ResponseEnvelope(
        data=advisories,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 3. Mapbox / Geocoding Autocomplete API Endpoint
@router.get("/geocoding/search", response_model=ResponseEnvelope[List[GeocodeResultDTO]])
async def search_geocoding(
    q: str = Query(..., description="Location search query (e.g. Meenakshi, Kodaikanal)"),
    request: Request = None
):
    trace_id = getattr(request.state, "trace_id", "tr-geo") if request else "tr-geo"
    results = geocoding_service.search_place_autocomplete(query=q, trace_id=trace_id)
    return ResponseEnvelope(
        data=results,
        meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    )

# 4. Generic REST & GraphQL External API Proxy Endpoint
@router.post("/external/proxy", response_model=ResponseEnvelope[ExternalApiResponseDTO])
async def proxy_external_api(payload: ExternalApiProxyRequestDTO, request: Request = None):
    trace_id = getattr(request.state, "trace_id", "tr-proxy") if request else "tr-proxy"
    try:
        res = external_api_service.execute_proxy_request(payload, trace_id=trace_id)
        return ResponseEnvelope(
            data=res,
            meta=MetaInfo(traceId=trace_id, timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"))
        )
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
