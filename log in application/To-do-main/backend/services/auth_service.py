"""
Authentication service for the fullstack-todo-app backend.

Provides three pure functions that implement user registration, authentication,
and JWT token verification.  This module has no direct knowledge of HTTP or
FastAPI; all transport concerns are handled by the router layer.
"""

from datetime import datetime, timedelta

import bcrypt
from jose import JWTError, jwt

from backend import config
from backend.store.user_store import UserStore


def _hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt directly."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def register_user(username: str, password: str, store: UserStore) -> None:
    """Register a new user by hashing their password and persisting it.

    Args:
        username: The desired username for the new account.  Must be a
            non-empty, non-whitespace-only string.
        password: The plaintext password chosen by the user.  Must be a
            non-empty, non-whitespace-only string.
        store: The :class:`~store.user_store.UserStore` instance that will
            hold the new credential.

    Raises:
        ValueError: If *username* or *password* is empty or whitespace-only,
            with the message ``"Username and password are required"``.
        ValueError: If *username* already exists in *store*, with the message
            ``"Username already exists"``.

    Returns:
        ``None`` on success.  The hashed credential is written to *store*.
    """
    if not username or not username.strip() or not password or not password.strip():
        raise ValueError("Username and password are required")

    if store.exists(username):
        raise ValueError("Username already exists")

    hashed = _hash_password(password)
    store.add(username, hashed)


def authenticate_user(username: str, password: str, store: UserStore) -> str:
    """Authenticate a user and return a signed JWT on success.

    The function looks up the stored hash for *username*, verifies *password*
    against it, and — if verification passes — issues a HS256 JWT that expires
    24 hours from the moment of issuance.

    Args:
        username: The username of the account to authenticate.  Must be a
            non-empty, non-whitespace-only string.
        password: The plaintext password to verify.  Must be a non-empty,
            non-whitespace-only string.
        store: The :class:`~store.user_store.UserStore` instance that holds
            the persisted credential.

    Raises:
        ValueError: If *username* or *password* is empty or whitespace-only,
            with the message ``"Username and password are required"``.
        ValueError: If *username* is not found in *store* or if *password*
            does not match the stored hash, with the message
            ``"Invalid username or password"``.

    Returns:
        A signed JWT string that encodes ``{"sub": username, "exp": <+24 h>}``.
    """
    if not username or not username.strip() or not password or not password.strip():
        raise ValueError("Username and password are required")

    stored_hash = store.get_hash(username)
    if stored_hash is None or not _verify_password(password, stored_hash):
        raise ValueError("Invalid username or password")

    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    token = jwt.encode(payload, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return token


def verify_token(token: str) -> str:
    """Verify a JWT and return the encoded username.

    Args:
        token: A signed JWT string previously returned by
            :func:`authenticate_user`.

    Raises:
        ValueError: If the token is missing, malformed, expired, or signed
            with a different key — with the message
            ``"Invalid or expired token"``.

    Returns:
        The ``sub`` claim from the token payload, which is the username that
        was embedded when the token was created.
    """
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise ValueError("Invalid or expired token")
        return username
    except JWTError:
        raise ValueError("Invalid or expired token")
