import re
import urllib.parse
from backend.app.core.exceptions import ValidationException

PROHIBITED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "::1",
    "169.254.169.254", # AWS EC2 Metadata
    "metadata.google.internal" # GCP Metadata
]

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gpx", ".kml"}
MAX_PAYLOAD_SIZE_BYTES = 10 * 1024 * 1024 # 10MB

class SecurityGuard:
    @staticmethod
    def validate_external_url(url_str: str) -> str:
        """
        SSRF Protection Engine:
        - Ensures scheme is http or https
        - Blocks private IP ranges, localhost, and cloud metadata endpoints
        """
        try:
            parsed = urllib.parse.urlparse(url_str)
        except Exception:
            raise ValidationException("SSRF Protection: Malformed or unparseable URL.")

        if parsed.scheme not in ["http", "https"]:
            raise ValidationException(f"SSRF Protection: Prohibited scheme '{parsed.scheme}'. Only HTTP and HTTPS URLs are allowed.")

        hostname = (parsed.hostname or "").lower()
        if not hostname:
            raise ValidationException("SSRF Protection: Missing hostname in URL.")

        if hostname in PROHIBITED_HOSTS:
            raise ValidationException(f"SSRF Protection: Prohibited target host '{hostname}'. Request rejected.")

        # Check internal IP subnet ranges (10.x, 192.168.x, 172.16.x)
        if hostname.startswith("10.") or hostname.startswith("192.168.") or hostname.startswith("172.16."):
            raise ValidationException(f"SSRF Protection: Private IP subnet target '{hostname}' is forbidden.")

        return url_str

    @staticmethod
    def validate_ssrf_target(url_str: str) -> dict:
        try:
            SecurityGuard.validate_external_url(url_str)
            return {"allowed": True, "reason": "Target URL passed SSRF security validation."}
        except ValidationException as err:
            return {"allowed": False, "reason": str(err)}

    @staticmethod
    def sanitize_upload_filename(filename: str) -> str:
        r"""
        Path Traversal & Upload Security Engine:
        - Blocks directory traversal sequences (../, ..\)
        - Enforces extension whitelist (.jpg, .jpeg, .png, .webp, .gpx, .kml)
        - Normalizes filename
        """
        if "../" in filename or "..\\" in filename:
            raise ValidationException("Path Traversal Attack: Directory traversal sequences ('../') are forbidden.")

        clean_name = filename.strip().replace(" ", "_")
        dot_idx = clean_name.rfind(".")
        if dot_idx == -1:
            raise ValidationException("File Upload Security: File lacks valid extension.")

        ext = clean_name[dot_idx:].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValidationException(f"File Upload Security: Extension '{ext}' is prohibited. Allowed extensions: {list(ALLOWED_EXTENSIONS)}")

        # Strip unsafe characters
        base_name = clean_name[:dot_idx]
        safe_base = re.sub(r"[^a-zA-Z0-9_-]", "", base_name)
        if not safe_base:
            safe_base = "upload_file"

        return f"{safe_base}{ext}"

    @staticmethod
    def validate_payload_size(byte_length: int, max_bytes: int = MAX_PAYLOAD_SIZE_BYTES):
        if byte_length > max_bytes:
            max_mb = max_bytes / (1024 * 1024)
            raise ValidationException(f"Payload Size Security: File payload size ({round(byte_length / (1024*1024), 2)} MB) exceeds maximum allowed limit ({max_mb} MB).")

security_guard = SecurityGuard()
