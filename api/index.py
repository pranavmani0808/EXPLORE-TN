import sys
import os

# Ensure the root project directory is on sys.path so backend imports succeed
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app
