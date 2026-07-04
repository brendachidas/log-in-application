import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { loginUser } from '../api/auth'
import useAuth from '../hooks/useAuth'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import type { ErrorDetail } from '../types/api'

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const auth = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const data = await loginUser({ username, password })
      auth.login(data.token)
      navigate('/todo')
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          setError('Invalid credentials')
        } else {
          const detail = (err.response?.data as ErrorDetail | undefined)?.detail
          setError(detail ?? 'An unexpected error occurred.')
        }
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div className="auth-card">
        <h1 className="page-title">Log in to your account</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary">
            {isLoading && <Spinner />}
            {isLoading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <ErrorMessage message={error ?? ''} />

        <p className="text-center text-sm text-muted mt-5">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="link">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
