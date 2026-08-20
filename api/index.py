import sys
import os

# Ensure the root project directory is on sys.path so backend imports succeed
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from backend.app.main import app
except Exception as e:
    import traceback
    print("Vercel Python serverless import error:", str(e))
    traceback.print_exc()
    raise e
