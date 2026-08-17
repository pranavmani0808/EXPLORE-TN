import asyncio
import time
import statistics
import httpx
from typing import List, Dict, Any

APP_URL = "http://localhost:8000"

ENDPOINTS = [
    {"name": "Infrastructure Liveness", "path": "/healthz", "method": "GET"},
    {"name": "Infrastructure Readiness", "path": "/readyz", "method": "GET"},
    {"name": "Places Spatial List", "path": "/api/v1/places", "method": "GET"},
    {"name": "Place Detail Lookup", "path": "/api/v1/places/suruli-waterfalls", "method": "GET"},
    {"name": "Admin Telemetry Stream", "path": "/api/v1/admin/telemetry", "method": "GET"},
]

async def send_single_request(client: httpx.AsyncClient, path: str, method: str) -> Dict[str, Any]:
    start = time.time()
    try:
        if method == "GET":
            res = await client.get(f"{APP_URL}{path}", timeout=10.0)
        else:
            res = await client.post(f"{APP_URL}{path}", timeout=10.0)
        
        latency_ms = (time.time() - start) * 1000.0
        return {
            "path": path,
            "status": res.status_code,
            "latencyMs": latency_ms,
            "success": res.status_code in [200, 201, 202, 429]
        }
    except Exception as e:
        latency_ms = (time.time() - start) * 1000.0
        return {
            "path": path,
            "status": 500,
            "latencyMs": latency_ms,
            "success": False,
            "error": str(e)
        }

async def run_concurrency_tier(concurrency: int, requests_per_user: int = 10) -> Dict[str, Any]:
    print(f"\n⚡ Running Concurrency Load Test: {concurrency} Virtual Users ({concurrency * requests_per_user} Total Requests) ...")
    
    async with httpx.AsyncClient(limits=httpx.Limits(max_connections=concurrency + 50, max_keepalive_connections=50)) as client:
        tasks = []
        for _ in range(concurrency):
            for ep in ENDPOINTS:
                for _ in range(requests_per_user // len(ENDPOINTS) + 1):
                    tasks.append(send_single_request(client, ep["path"], ep["method"]))
        
        start_tier = time.time()
        results = await asyncio.gather(*tasks)
        total_time_sec = time.time() - start_tier

    total_requests = len(results)
    successful_requests = sum(1 for r in results if r["success"])
    failed_requests = total_requests - successful_requests
    
    latencies = [r["latencyMs"] for r in results]
    latencies.sort()

    p50 = statistics.median(latencies) if latencies else 0.0
    p95 = latencies[int(len(latencies) * 0.95)] if latencies else 0.0
    p99 = latencies[int(len(latencies) * 0.99)] if latencies else 0.0
    throughput = round(total_requests / total_time_sec, 2) if total_time_sec > 0 else 0.0

    print(f"   ✓ Total Requests: {total_requests} | Success: {successful_requests} | Failed: {failed_requests}")
    print(f"   ✓ Throughput: {throughput} req/sec | P50: {round(p50, 2)}ms | P95: {round(p95, 2)}ms | P99: {round(p99, 2)}ms")

    return {
        "concurrency": concurrency,
        "totalRequests": total_requests,
        "successfulRequests": successful_requests,
        "failedRequests": failed_requests,
        "throughputReqSec": throughput,
        "p50Ms": round(p50, 2),
        "p95Ms": round(p95, 2),
        "p99Ms": round(p99, 2),
        "minMs": round(min(latencies), 2) if latencies else 0.0,
        "maxMs": round(max(latencies), 2) if latencies else 0.0
    }

async def run_full_load_test_suite():
    print("=======================================================================")
    print("⚡ EXPLORERTN PRODUCTION PERFORMANCE & LOAD ENGINEERING SUITE")
    print("=======================================================================")

    tiers = [10, 50, 100, 500]
    tier_results = []

    for c in tiers:
        res = await run_concurrency_tier(c, requests_per_user=10)
        tier_results.append(res)

    print("\n=======================================================================")
    print("CONCURRENCY LOAD TEST SUMMARY TABLE")
    print("=======================================================================")
    print(f"{'Concurrency':<12} | {'Req/Sec':<10} | {'P50 (ms)':<10} | {'P95 (ms)':<10} | {'P99 (ms)':<10} | {'Errors':<8}")
    print("-" * 65)
    for r in tier_results:
        err_pct = f"{round((r['failedRequests']/r['totalRequests'])*100, 2)}%"
        print(f"{r['concurrency']:<12} | {r['throughputReqSec']:<10} | {r['p50Ms']:<10} | {r['p95Ms']:<10} | {r['p99Ms']:<10} | {err_pct:<8}")

if __name__ == "__main__":
    asyncio.run(run_full_load_test_suite())
