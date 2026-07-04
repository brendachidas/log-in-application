"""
Auth router for the fullstack-todo-app backend.

Exposes three endpoints:
  POST /register  — create a new user account
  POST /login     — authenticate and receive a JWT
  GET  /protected — validate a Bearer token

All endpoints delegate business logic to :mod:`services.auth_service`.
The :class:`~store.user_store.UserStore` instance is supplied via FastAPI
dependency injection using ``Depends(get_store)``.
"""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from backend.models.schemas import (
    ErrorResponse,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    TokenResponse,
)
from backend.services.auth_service import authenticate_user, register_user, verify_token
from backend.store.user_store import UserStore

# ---------------------------------------------------------------------------
# Module-level UserStore instance (shared for the lifetime of the process)
# ---------------------------------------------------------------------------

_store = UserStore()


def get_store() -> UserStore:
    """FastAPI dependency that returns the shared :class:`UserStore` instance."""
    return _store


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter()


@router.post("/register", status_code=201)
def register(body: RegisterRequest, store: UserStore = Depends(get_store)):
    """Register a new user account.

    Args:
        body:  Request body containing ``username`` and ``password``.
        store: Injected :class:`~store.user_store.UserStore` dependency.

    Returns:
        HTTP 201 with a :class:`~models.schemas.MessageResponse` on success.
        HTTP 409 when the username is already taken.
        HTTP 400 when either field is blank or whitespace-only.
    """
    try:
        register_user(body.username, body.password, store)
        return MessageResponse(message="User registered successfully")
    except ValueError as e:
        msg = str(e)
        if msg == "Username already exists":
            return JSONResponse(
                status_code=409,
                content=ErrorResponse(detail=msg).model_dump(),
            )
        # "Username and password are required"
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(detail=msg).model_dump(),
        )


@router.post("/login")
def login(body: LoginRequest, store: UserStore = Depends(get_store)):
    """Authenticate a user and return a signed JWT.

    Args:
        body:  Request body containing ``username`` and ``password``.
        store: Injected :class:`~store.user_store.UserStore` dependency.

    Returns:
        HTTP 200 with a :class:`~models.schemas.TokenResponse` on success.
        HTTP 400 when either field is blank or whitespace-only.
        HTTP 401 when credentials are invalid.
    """
    try:
        token = authenticate_user(body.username, body.password, store)
        return TokenResponse(token=token)
    except ValueError as e:
        msg = str(e)
        if msg == "Username and password are required":
            return JSONResponse(
                status_code=400,
                content=ErrorResponse(detail=msg).model_dump(),
            )
        # "Invalid username or password"
        return JSONResponse(
            status_code=401,
            content=ErrorResponse(detail=msg).model_dump(),
        )


@router.get("/protected")
def protected(request: Request):
    """Validate a Bearer token and return a greeting.

    The token is extracted from the ``Authorization`` request header.

    Args:
        request: The incoming FastAPI/Starlette :class:`~starlette.requests.Request`.

    Returns:
        HTTP 200 with a :class:`~models.schemas.MessageResponse` on success.
        HTTP 401 when the header is absent, malformed, or the token is invalid.
    """
    auth_header: str | None = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content=ErrorResponse(detail="Authorization header missing").model_dump(),
        )

    token = auth_header[len("Bearer "):]

    try:
        username = verify_token(token)
        return MessageResponse(message=f"Hello, {username}! Your token is valid.")
    except ValueError as e:
        return JSONResponse(
            status_code=401,
            content=ErrorResponse(detail=str(e)).model_dump(),
        )
