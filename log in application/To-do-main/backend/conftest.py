"""
pytest configuration — ensures the backend/ directory is on sys.path so that
bare imports like `from store.user_store import UserStore` resolve correctly
when running `pytest` from within the backend/ directory.
"""
import sys
import os

# Add the backend/ directory itself to sys.path so bare imports work
sys.path.insert(0, os.path.dirname(__file__))
