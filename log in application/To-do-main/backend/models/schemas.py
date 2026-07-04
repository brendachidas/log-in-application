"""Pydantic request/response models for the fullstack-todo-app API."""

from pydantic import BaseModel


class RegisterRequest(BaseModel):
    """Request body for the POST /register endpoint."""

    username: str
    password: str


class LoginRequest(BaseModel):
    """Request body for the POST /login endpoint."""

    username: str
    password: str


class TokenResponse(BaseModel):
    """Response body returned on successful authentication."""

    token: str


class MessageResponse(BaseModel):
    """Generic success response body carrying a human-readable message."""

    message: str


class ErrorResponse(BaseModel):
    """Error response body.

    The ``detail`` field name matches FastAPI's default ``HTTPException``
    response shape so that all error payloads — whether raised via
    ``HTTPException`` or returned explicitly — are structurally identical.
    """

    detail: str
