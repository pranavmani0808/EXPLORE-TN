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

    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://explore-tn-trails-main.vercel.app",
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
