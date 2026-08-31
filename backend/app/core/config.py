import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "ExplorerTN Backend Core"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/explorer_tn"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security & JWT
    SUPABASE_JWT_SECRET: str = "super-secret-jwt-key-explorer-tn-production"
    ALGORITHM: str = "HS256"
    
    # AI API Configuration
    AI_API_KEY: str = "osk_live_5mHigJn-I2mcPuZQd1LbiN82EwFGZpVxzG7vdnNrGiY"
    OPENROUTER_API_KEY: str = "osk_live_5mHigJn-I2mcPuZQd1LbiN82EwFGZpVxzG7vdnNrGiY"
    GEMINI_API_KEY: str = "osk_live_5mHigJn-I2mcPuZQd1LbiN82EwFGZpVxzG7vdnNrGiY"
    VITE_AI_API_KEY: Optional[str] = "osk_live_5mHigJn-I2mcPuZQd1LbiN82EwFGZpVxzG7vdnNrGiY"

    # OpenSERP Server-Side Web-Grounding Configuration
    OPENSERP_API_KEY: str = "openserp_live_secret_key_explorer_tn_prod"
    OPENSERP_BASE_URL: str = "https://api.openserp.com/v1/search"

    # WEB_CRAWL-main Service Integration
    WEB_CRAWL_API_BASE_URL: str = "http://localhost:8080/api"

    # OpenWeather / Live Weather Advisory Configuration
    WEATHER_API_KEY: str = "ow_live_secret_key_explorer_tn_prod"
    WEATHER_BASE_URL: str = "https://api.openweathermap.org/data/2.5"

    # TTDC Official Tourism & E-Governance API Configuration
    TTDC_API_KEY: str = "ttdc_gov_live_key_tn_tourism_2026"
    TTDC_BASE_URL: str = "https://api.ttdc.tn.gov.in/v1"

    # Mapbox / Geocoding & Places Autocomplete API Configuration
    MAPBOX_API_KEY: str = "pk.eyJ1IjoicHJhbmF2dG4iLCJhIjoiY2x5eG56eDdtMDJxeTJrcjB4Nm1leWp2OSJ9"
    GEOCODING_BASE_URL: str = "https://api.mapbox.com/geocoding/v5/mapbox.places"

    # Routing Engine Configuration
    ROUTING_PROVIDER: str = "osrm"
    ROUTING_BASE_URL: str = "http://router.project-osrm.org"

    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "https://explore-tn-trails-main.vercel.app",
        "https://explore-tn-trails-main-dnrgi59oo-chatterbox1.vercel.app",
        "https://explore-tn-trails-main-phctvk9o7-chatterbox1.vercel.app",
        "https://explore-tn-backend.onrender.com",
        "https://explore-tn.onrender.com",
    ]
    
    # Rate Limiting & Timeouts
    DEFAULT_RATE_LIMIT_PER_MIN: int = 120
    AI_PLANNER_RATE_LIMIT_PER_HOUR: int = 15
    REQUEST_TIMEOUT_SECONDS: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
