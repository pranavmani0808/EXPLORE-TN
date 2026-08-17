import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.rate_limiter import rate_limiter, RateLimitExceededException
from backend.app.core.security_guard import security_guard
from backend.app.core.exceptions import ValidationException

client = TestClient(app)

# 1. Test Sliding Window Rate Limiter Throttling
def test_rate_limiter_throttling():
    test_id = "test_client_ip_123"
    
    # Send 3 valid requests under limit of 3
    for _ in range(3):
        rate_limiter.check_rate_limit(identifier=test_id, limit=3, window_seconds=60)

    # 4th request exceeds limit and raises RateLimitExceededException (HTTP 429)
    with pytest.raises(RateLimitExceededException) as exc_info:
        rate_limiter.check_rate_limit(identifier=test_id, limit=3, window_seconds=60)
    
    assert exc_info.value.status_code == 429
    assert exc_info.value.code == "RATE_LIMIT_EXCEEDED"

# 2. Test SSRF Protection Engine
def test_ssrf_protection_engine():
    # Valid External Public URLs
    assert security_guard.validate_external_url("https://api.openweathermap.org/data/2.5/weather") == "https://api.openweathermap.org/data/2.5/weather"

    # Prohibited Localhost Target (http://127.0.0.1:8000/internal)
    with pytest.raises(ValidationException) as exc1:
        security_guard.validate_external_url("http://127.0.0.1:8000/internal")
    assert "Prohibited target host" in str(exc1.value)

    # Prohibited AWS EC2 Metadata Service Target (http://169.254.169.254/latest/meta-data)
    with pytest.raises(ValidationException) as exc2:
        security_guard.validate_external_url("http://169.254.169.254/latest/meta-data")
    assert "Prohibited target host" in str(exc2.value)

    # Prohibited Private IP Subnet Target (http://10.0.0.1/admin)
    with pytest.raises(ValidationException) as exc3:
        security_guard.validate_external_url("http://10.0.0.1/admin")
    assert "Private IP subnet target" in str(exc3.value)

    # Prohibited Non-HTTP Scheme (ftp://malicious.com/file)
    with pytest.raises(ValidationException) as exc4:
        security_guard.validate_external_url("ftp://malicious.com/file")
    assert "Prohibited scheme" in str(exc4.value)

# 3. Test Path Traversal Attack & Upload Extension Whitelist
def test_path_traversal_and_upload_security():
    # Valid File Uploads
    assert security_guard.sanitize_upload_filename("kolli_pass.gpx") == "kolli_pass.gpx"
    assert security_guard.sanitize_upload_filename("suruli falls.jpg") == "suruli_falls.jpg"

    # Directory Traversal Attempt (../../../etc/passwd)
    with pytest.raises(ValidationException) as exc1:
        security_guard.sanitize_upload_filename("../../../etc/passwd.jpg")
    assert "Directory traversal sequences" in str(exc1.value)

    # Disallowed Extension (.exe / .sh)
    with pytest.raises(ValidationException) as exc2:
        security_guard.sanitize_upload_filename("malicious_script.sh")
    assert "Extension '.sh' is prohibited" in str(exc2.value)

# 4. Test Payload Size Bounds Security
def test_payload_size_security_bounds():
    # 5MB Payload (Valid)
    security_guard.validate_payload_size(5 * 1024 * 1024)

    # 15MB Payload (Exceeds 10MB limit)
    with pytest.raises(ValidationException) as exc_info:
        security_guard.validate_payload_size(15 * 1024 * 1024)
    assert "exceeds maximum allowed limit" in str(exc_info.value)

# 5. Test Response Security Headers
def test_http_security_headers_injection():
    res = client.get("/healthz")
    assert res.status_code == 200
    headers = res.headers
    
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert "max-age=31536000" in headers.get("Strict-Transport-Security", "")

# 6. Test Hardened CORS Preflight Security
def test_cors_preflight_security():
    # Valid Production Origin Preflight OPTIONS Request
    headers = {
        "Origin": "https://explore-tn-trails-main.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Authorization, Content-Type"
    }
    res = client.options("/api/v1/places", headers=headers)
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "https://explore-tn-trails-main.vercel.app"
    assert res.headers.get("access-control-max-age") == "600"

    # Unauthorized Origin Request
    bad_headers = {
        "Origin": "https://malicious-attacker-site.com",
        "Access-Control-Request-Method": "POST"
    }
    res_bad = client.options("/api/v1/places", headers=bad_headers)
    assert res_bad.headers.get("access-control-allow-origin") is None
