import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from backend import config

# Configure the "app" logger once
logger = logging.getLogger("app")

if not logger.handlers:
    _handler = logging.FileHandler(config.LOG_FILE)
    _handler.setFormatter(
        logging.Formatter("%(asctime)s  %(levelname)-8s  %(message)s")
    )
    logger.addHandler(_handler)
    logger.setLevel(logging.INFO)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Logs every request/response pair as 'METHOD /path → STATUS_CODE'."""

    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            response = await call_next(request)
            logger.info(
                "%s %s → %d",
                request.method,
                request.url.path,
                response.status_code,
            )
            return response
        except Exception as exc:
            logger.error(
                "Error processing %s %s: %s: %s",
                request.method,
                request.url.path,
                type(exc).__name__,
                exc,
            )
            raise
