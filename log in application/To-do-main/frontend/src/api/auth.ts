/**
 * Authentication API functions for the fullstack-todo-app.
 *
 * Each function wraps a single endpoint on the FastAPI backend. Errors are
 * not caught here — they propagate as thrown `AxiosError` instances for the
 * calling component to handle (e.g. display an inline validation message).
 *
 * The `apiClient` instance automatically:
 *  - Attaches `Authorization: Bearer <token>` when a token exists in
 *    `localStorage` (used by {@link getProtected}).
 *  - Redirects to `/login` and clears the stored token on any HTTP 401.
 */

import apiClient from './client'
import type { LoginRequest, MessageResponse, RegisterRequest, TokenResponse } from '../types/api'

/**
 * Register a new user account.
 *
 * Sends the provided credentials to `POST /register`. On success the server
 * returns a confirmation message. On failure (e.g. username already taken)
 * an `AxiosError` is thrown with the server's error detail in the response
 * body.
 *
 * @param data - The username and password for the new account.
 * @returns A promise that resolves to a {@link MessageResponse} confirming registration.
 */
export async function registerUser(data: RegisterRequest): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/register', data)
  return response.data
}

/**
 * Authenticate an existing user and retrieve a JWT.
 *
 * Sends the provided credentials to `POST /login`. On success the server
 * returns a signed JWT that should be persisted in `localStorage` under the
 * key `"token"` so that subsequent requests are automatically authenticated.
 * On failure (e.g. invalid credentials) an `AxiosError` is thrown.
 *
 * @param data - The username and password to authenticate.
 * @returns A promise that resolves to a {@link TokenResponse} containing the JWT.
 */
export async function loginUser(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/login', data)
  return response.data
}

/**
 * Call the protected endpoint to verify a valid token is in use.
 *
 * Sends `GET /protected`. The `apiClient` request interceptor automatically
 * attaches the `Authorization: Bearer <token>` header using the token stored
 * in `localStorage`, so no manual header management is needed here. Returns a
 * confirmation message when the token is valid; the response interceptor
 * handles HTTP 401 by clearing the token and redirecting to `/login`.
 *
 * @returns A promise that resolves to a {@link MessageResponse} from the protected route.
 */
export async function getProtected(): Promise<MessageResponse> {
  const response = await apiClient.get<MessageResponse>('/protected')
  return response.data
}
