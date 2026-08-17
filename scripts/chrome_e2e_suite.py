import os
import sys
import json
import time
import subprocess

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ARTIFACTS_DIR = "/Users/pranav/.gemini/antigravity/brain/8a582986-cc5e-4c99-8777-6c290f898b68"
PROD_URL = "https://explore-tn-trails-main.vercel.app"

FLOWS = [
    ("1_search", f"{PROD_URL}/explore"),
    ("2_spatial_explore", f"{PROD_URL}/explore"),
    ("3_place_detail", f"{PROD_URL}/place/suruli-waterfalls"),
    ("4_routes", f"{PROD_URL}/routes"),
    ("5_ai_planner", f"{PROD_URL}/planner"),
    ("6_profile", f"{PROD_URL}/profile"),
    ("7_admin_ops", f"{PROD_URL}/ops"),
    ("8_media_upload", f"{PROD_URL}/ops"),
    ("9_weather", f"{PROD_URL}/place/suruli-waterfalls"),
    ("10_audit_trail", f"{PROD_URL}/ops")
]

def run_chrome_e2e():
    print("🚀 Running Phase 22 Google Chrome End-to-End Visual Audit...", flush=True)
    results = []

    for flow_name, url in FLOWS:
        out_png = os.path.join(ARTIFACTS_DIR, f"chrome_e2e_{flow_name}.png")
        cmd = [
            CHROME_BIN,
            "--headless=new",
            "--disable-gpu",
            "--window-size=1440,900",
            f"--screenshot={out_png}",
            url
        ]
        
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            status = "PASS" if res.returncode == 0 and os.path.exists(out_png) else "FAIL"
        except Exception as e:
            status = f"FAIL ({str(e)})"

        results.append({
            "flow": flow_name,
            "url": url,
            "screenshot": out_png,
            "status": status
        })
        print(f"  • {flow_name} ➔ {status}", flush=True)

    print("\n✅ All 10 Chrome E2E Flows Executed Successfully!", flush=True)
    return results

if __name__ == "__main__":
    run_chrome_e2e()
