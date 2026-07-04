/**
 * Authentication state management hook for the fullstack-todo-app.
 *
 * Encapsulates the relationship between `localStorage` token persistence and
 * the in-memory React authentication state. Components that need to know
 * whether the user is authenticated, or that need to trigger login/logout
 * transitions, should consume this hook rather than reading `localStorage`
 * directly.
 *
 * @example
 * ```tsx
 * const { isAuthenticated, login, logout } = useAuth()
 *
 * // After a successful API call:
 * login(tokenResponse.token)
 *
 * // On a logout button click:
 * logout()
 * ```
 */

import { useState } from 'react'

/** Shape of the object returned by {@link useAuth}. */
interface UseAuthReturn {
  /** `true` when a token is currently stored in `localStorage`. */
  isAuthenticated: boolean
  /**
   * Persist `token` to `localStorage` and mark the user as authenticated.
   *
   * Should be called after a successful `/login` response. The token is
   * written under the key `"token"` so that the Axios request interceptor in
   * `api/client.ts` can attach it automatically on every subsequent request.
   *
   * @param token - The JWT string returned by the backend `/login` endpoint.
   */
  login: (token: string) => void
  /**
   * Remove the stored token from `localStorage` and mark the user as
   * unauthenticated.
   *
   * Should be called when the user activates the logout control. After this
   * call `isAuthenticated` is `false` and the Axios interceptor will no longer
   * attach an `Authorization` header to outgoing requests.
   */
  logout: () => void
}

/**
 * Manage authentication state derived from `localStorage`.
 *
 * The initial value of `isAuthenticated` is determined synchronously by
 * checking whether a `"token"` key exists in `localStorage` at mount time.
 * Subsequent calls to `login` and `logout` both update `localStorage` **and**
 * the React state so that any component consuming the hook re-renders
 * immediately without requiring a page reload.
 *
 * @returns An object containing the current auth state and transition functions.
 */
function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('token') !== null
  )

  /**
   * Store `token` in `localStorage` and flip `isAuthenticated` to `true`.
   *
   * @param token - The JWT string to persist.
   */
  const login = (token: string): void => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true)
  }

  /**
   * Remove the token from `localStorage` and flip `isAuthenticated` to `false`.
   */
  const logout = (): void => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  return { isAuthenticated, login, logout }
}

export default useAuth
