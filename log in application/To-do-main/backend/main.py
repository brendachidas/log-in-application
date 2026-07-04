"""FastAPI application entry point for the fullstack-todo-app API."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend import config
from backend.middleware.logging_middleware import LoggingMiddleware, logger
from backend.routers.auth import router

# ---------------------------------------------------------------------------
# Application instance
# ---------------------------------------------------------------------------

app = FastAPI(title="fullstack-todo-app API")

# ---------------------------------------------------------------------------
# Middleware (order matters: CORS first, then logging)
# ---------------------------------------------------------------------------

_allowed_origins = [config.FRONTEND_ORIGIN, "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)

# ---------------------------------------------------------------------------
# Global exception handler
# ---------------------------------------------------------------------------


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc: Exception):
    """Catch-all handler that logs unhandled exceptions and returns HTTP 500."""
    logger.error("Unhandled exception: %s: %s", type(exc).__name__, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(router)

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health")
async def health():
    """Simple liveness probe."""
    return {"status": "ok"}
