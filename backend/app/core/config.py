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
    
    # Security & JWT — must come from environment in any shared/deployed environment
    SUPABASE_JWT_SECRET: str = ""
    ALGORITHM: str = "HS256"
    
    # AI API Configuration (never commit live keys)
    AI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    VITE_AI_API_KEY: Optional[str] = None

    # OpenSERP Server-Side Web-Grounding Configuration
    OPENSERP_API_KEY: str = ""
    OPENSERP_BASE_URL: str = "https://api.openserp.com/v1/search"

    # Routing Engine Configuration
    ROUTING_PROVIDER: str = "osrm"
    ROUTING_BASE_URL: str = "http://router.project-osrm.org"

    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "https://explore-tn-trails-main.vercel.app",
    ]
    CORS_ORIGIN_REGEX: str = r"https://.*\.(e2b\.app|vercel\.app)"
    
    # Rate Limiting & Timeouts
    DEFAULT_RATE_LIMIT_PER_MIN: int = 120
    AI_PLANNER_RATE_LIMIT_PER_HOUR: int = 15
    REQUEST_TIMEOUT_SECONDS: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
