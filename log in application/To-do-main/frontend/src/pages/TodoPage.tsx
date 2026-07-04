import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { getProtected } from '../api/auth'
import useAuth from '../hooks/useAuth'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import type { ErrorDetail } from '../types/api'

/** Static placeholder to-do items shown while full CRUD is not yet implemented. */
const PLACEHOLDER_TODOS: readonly string[] = [
  'Buy groceries',
  'Read a book',
  'Go for a morning walk',
  'Call a friend',
  'Learn something new',
]

const TodoPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)

  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    const fetchProtected = async (): Promise<void> => {
      try {
        const data = await getProtected()
        if (!cancelled) {
          setWelcomeMessage(data.message)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          // 401 is handled by the Axios response interceptor automatically
          // (clears token + redirects to /login), so only surface other errors.
          if (err instanceof AxiosError && err.response?.status !== 401) {
            const detail = (err.response?.data as ErrorDetail | undefined)?.detail
            setError(detail ?? 'An unexpected error occurred.')
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchProtected()
    return () => { cancelled = true }
  }, [])

  const handleLogout = (): void => {
    auth.logout()
    navigate('/login')
  }

  return (
    <div className="todo-layout">
      {/* ── Header ── */}
      <header className="todo-header">
        <h1 className="todo-header__title">✅ My To-Do List</h1>
        <button type="button" onClick={handleLogout} className="btn btn-danger">
          Log out
        </button>
      </header>

      {/* ── Main content ── */}
      <main className="todo-main">
        <div className="todo-content">
          {isLoading ? (
            <div className="spinner-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <ErrorMessage message={error ?? ''} />

              {welcomeMessage !== null && (
                <p className="alert alert-info" style={{ marginBottom: '24px' }}>
                  {welcomeMessage}
                </p>
              )}

              <div className="todo-card">
                <h2 className="todo-card__header">Tasks</h2>
                <ul className="todo-list" aria-label="To-do list">
                  {PLACEHOLDER_TODOS.map((item, index) => (
                    <li key={index} className="todo-item">
                      <span className="todo-item__checkbox" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default TodoPage
