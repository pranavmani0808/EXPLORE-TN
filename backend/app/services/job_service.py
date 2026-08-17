import time
import uuid
import hashlib
from typing import Dict, Any, Optional, List
from backend.app.core.exceptions import ValidationException, ResourceNotFoundException, PermissionDeniedException
from backend.app.core.security import UserContext
from backend.app.services.route_ingestion import route_ingestion_service

class JobService:
    def __init__(self):
        self._jobs_db: Dict[str, dict] = {}
        self._idempotency_index: Dict[str, str] = {} # idempotency_key -> job_id
        self._dead_letter_queue: List[dict] = []

    def compute_payload_hash(self, payload: Any) -> str:
        s = str(payload).encode("utf-8")
        return hashlib.sha256(s).hexdigest()

    def create_job(self, job_type: str, payload: dict, user: UserContext, trace_id: str, idempotency_key: Optional[str] = None) -> dict:
        # Check Idempotency Key
        key = idempotency_key or self.compute_payload_hash(f"{job_type}:{payload}")
        if key in self._idempotency_index:
            existing_job_id = self._idempotency_index[key]
            return self._jobs_db[existing_job_id]

        job_id = f"job-{uuid.uuid4().hex[:8]}"
        job_record = {
            "jobId": job_id,
            "jobType": job_type,
            "status": "QUEUED",
            "progress": 0,
            "payload": payload,
            "result": None,
            "error": None,
            "traceId": trace_id,
            "actorId": user.id,
            "actorRole": user.role.upper(),
            "attemptCount": 0,
            "maxAttempts": 3,
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "startedAt": None,
            "completedAt": None
        }

        self._jobs_db[job_id] = job_record
        self._idempotency_index[key] = job_id
        return job_record

    def execute_worker_job(self, job_id: str, simulate_worker_crash: bool = False, simulate_transient_failure: bool = False) -> dict:
        job = self._jobs_db.get(job_id)
        if not job:
            raise ResourceNotFoundException("Job", job_id)

        if job["status"] in ["COMPLETED", "FAILED"]:
            return job

        job["status"] = "RUNNING"
        job["progress"] = 25
        job["startedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        job["attemptCount"] += 1

        # Failure Injection Tests
        if simulate_worker_crash:
            job["status"] = "FAILED"
            job["error"] = "WorkerProcessCrashed: Worker process killed unexpectedly."
            self._dead_letter_queue.append({
                "jobId": job_id,
                "errorCode": "WORKER_CRASH",
                "message": job["error"],
                "traceId": job["traceId"],
                "attemptCount": job["attemptCount"],
                "failedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            })
            return job

        if simulate_transient_failure and job["attemptCount"] < job["maxAttempts"]:
            # Bounded Exponential Backoff Retry Simulation
            job["status"] = "QUEUED"
            job["progress"] = 0
            job["error"] = f"TransientNetworkTimeout: Attempt {job['attemptCount']} failed. Retrying with exponential backoff."
            return job

        try:
            # Execute Worker by Job Type
            job["progress"] = 50
            if job["jobType"] == "GPX_PARSING":
                gpx_xml = job["payload"].get("gpxXml", "")
                title = job["payload"].get("title", "Ingested GPX Trail")
                district = job["payload"].get("district", "Namakkal")
                difficulty = job["payload"].get("difficulty", "Hard")
                
                actor_user = UserContext(id=job["actorId"], name="AsyncWorker", email="worker@exploretn.com", role=job["actorRole"].lower())
                route_res = route_ingestion_service.ingest_gpx_route(title, district, difficulty, gpx_xml, actor_user)
                job["result"] = route_res

            elif job["jobType"] == "MEDIA_PROCESSING":
                mime_type = job["payload"].get("mimeType", "image/jpeg")
                if mime_type not in ["image/jpeg", "image/png", "image/webp"]:
                    raise ValidationException(f"Unsupported MIME type '{mime_type}'. Only JPEG/PNG/WebP are supported.")
                
                job["result"] = {
                    "assetId": f"med-{uuid.uuid4().hex[:6]}",
                    "exif": {"latitude": 10.2381, "longitude": 77.4892, "camera": "Sony A7IV"},
                    "webpUrl": f"https://explore-tn-trails-main.vercel.app/storage/optimized-{uuid.uuid4().hex[:6]}.webp",
                    "status": "OPTIMIZED"
                }

            elif job["jobType"] == "GEMINI_GENERATION":
                origin = job["payload"].get("origin", "Chennai")
                destination = job["payload"].get("destination", "Kolli Hills")
                job["result"] = {
                    "expeditionTitle": f"{origin} to {destination} 3-Day Trail",
                    "itinerary": [
                        {"day": 1, "activity": f"Depart {origin}, ascend 70 hairpins to Kolli Hills"},
                        {"day": 2, "activity": "Trek Agaya Gangai 1,000 steps waterfall"},
                        {"day": 3, "activity": "Visit Arapaleeswarar Temple and return"}
                    ],
                    "status": "GENERATED"
                }

            job["status"] = "COMPLETED"
            job["progress"] = 100
            job["completedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")

        except Exception as err:
            job["status"] = "FAILED"
            job["error"] = str(err)
            self._dead_letter_queue.append({
                "jobId": job_id,
                "errorCode": "PERMANENT_WORKER_ERROR",
                "message": str(err),
                "traceId": job["traceId"],
                "attemptCount": job["attemptCount"],
                "failedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            })

        return job

    def get_job_status(self, job_id: str, user: UserContext) -> dict:
        job = self._jobs_db.get(job_id)
        if not job:
            raise ResourceNotFoundException("Job", job_id)

        # RBAC Check: Non-admins can only view their own jobs
        if user.role == "explorer" and job["actorId"] != user.id:
            raise PermissionDeniedException("Access Denied: You can only view jobs created by your profile.")

        return job

job_service = JobService()
