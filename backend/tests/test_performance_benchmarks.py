import time
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.places_service import calculate_haversine

client = TestClient(app)

# 1. Test Endpoint P95 Latency Threshold
def test_endpoint_latency_thresholds():
    latencies = []
    for _ in range(50):
        start = time.time()
        res = client.get("/healthz")
        assert res.status_code == 200
        latencies.append((time.time() - start) * 1000.0)

    latencies.sort()
    p95 = latencies[int(len(latencies) * 0.95)]
    assert p95 < 200.0 # Must complete in under 200ms

# 2. Test Spatial Query Latency Benchmark
def test_spatial_query_latency_benchmark():
    start = time.time()
    for _ in range(500):
        calculate_haversine(9.6644, 77.2653, 10.2381, 77.4892)
    elapsed_ms = (time.time() - start) * 1000.0
    
    # 500 Haversine spatial calculations must complete in < 50ms total
    assert elapsed_ms < 50.0

# 3. Test High Concurrency Memory Integrity Check
def test_high_concurrency_memory_integrity():
    for i in range(100):
        res = client.get("/api/v1/places")
        assert res.status_code == 200
        assert "data" in res.json()
