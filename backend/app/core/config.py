from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "ExplorerTN Backend Core"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/explorer_tn"
    
    # Security & JWT
    SUPABASE_JWT_SECRET: str = "super-secret-jwt-key-explorer-tn-production"
    ALGORITHM: str = "HS256"
    
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

settings = Settings()
