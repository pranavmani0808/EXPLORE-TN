import os
import pytest
from backend.app.core.config import settings

# Provide test-environment defaults for pytest so tests run reliably without live env keys
if not settings.SUPABASE_JWT_SECRET:
    settings.SUPABASE_JWT_SECRET = "test-jwt-secret-for-local-pytest-runs"
