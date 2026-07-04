import os

SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
LOG_FILE: str = os.getenv("LOG_FILE", "app.log")
