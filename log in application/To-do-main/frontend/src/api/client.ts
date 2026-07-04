/**
 * Axios instance pre-configured for the fullstack-todo-app API server.
 *
 * Two interceptors are registered:
 *  - **Request interceptor**: attaches an `Authorization: Bearer <token>` header
 *    to every outgoing request when a token is found in `localStorage`.
 *  - **Response interceptor**: on any HTTP 401 response, removes the stored token
 *    and redirects the browser to `/login` so the user can re-authenticate.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor — attach Bearer token if present in localStorage.
 *
 * Runs before every request leaves the browser. If `localStorage` contains
 * an entry under the key `"token"`, the value is appended to the request
 * headers as `Authorization: Bearer <token>`. If no token is stored (the
 * user is unauthenticated), the headers are left untouched and the request
 * proceeds without an `Authorization` header.
 */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Response interceptor — on HTTP 401, clear the stored token and redirect.
 *
 * The fulfilled handler is a transparent pass-through that returns every
 * successful response unchanged.
 *
 * The rejection handler examines the status code of every error response.
 * If the server returns HTTP 401 (Unauthorized), the interceptor:
 *   1. Removes the `"token"` entry from `localStorage` to invalidate any
 *      stale or expired credential.
 *   2. Navigates the browser to `/login` so the user is prompted to
 *      re-authenticate.
 *
 * In all cases the rejected promise is forwarded so that call-site `.catch`
 * handlers and React state updates can still respond to the error.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
