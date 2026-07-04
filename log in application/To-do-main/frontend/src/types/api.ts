/**
 * Shared API types for the fullstack-todo-app frontend.
 *
 * These interfaces mirror the backend Pydantic models defined in
 * `backend/models/schemas.py` exactly, ensuring end-to-end type safety
 * between the React SPA and the FastAPI server.
 */

/**
 * Request body sent to POST /register.
 *
 * Both fields are required and must be non-empty strings.
 */
export interface RegisterRequest {
  /** The desired username for the new account. */
  username: string;
  /** The plaintext password chosen by the user (hashed server-side). */
  password: string;
}

/**
 * Request body sent to POST /login.
 *
 * Both fields are required and must be non-empty strings.
 */
export interface LoginRequest {
  /** The username of the account to authenticate. */
  username: string;
  /** The plaintext password to verify against the stored hash. */
  password: string;
}

/**
 * Response body returned by POST /login on successful authentication.
 *
 * The token is a signed HS256 JWT that must be included in subsequent
 * requests as `Authorization: Bearer <token>`.
 */
export interface TokenResponse {
  /** A signed JWT string that grants access to protected endpoints. */
  token: string;
}

/**
 * Generic success response body carrying a human-readable confirmation.
 *
 * Returned by endpoints such as POST /register and GET /protected when
 * the operation completes successfully.
 */
export interface MessageResponse {
  /** A human-readable description of the successful outcome. */
  message: string;
}

/**
 * Error response body returned by the API on failure.
 *
 * The `detail` field name matches FastAPI's default `HTTPException` response
 * shape so that all error payloads are structurally identical, whether raised
 * via `HTTPException` or returned explicitly.
 */
export interface ErrorDetail {
  /** A human-readable description of the error that occurred. */
  detail: string;
}
