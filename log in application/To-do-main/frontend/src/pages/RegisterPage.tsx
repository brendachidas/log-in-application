import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AxiosError } from 'axios'
import { registerUser } from '../api/auth'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import type { ErrorDetail } from '../types/api'

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await registerUser({ username, password })
      setSuccess(result.message)
    } catch (err) {
      if (err instanceof AxiosError) {
        const data = err.response?.data as ErrorDetail | undefined
        setError(data?.detail ?? 'An unexpected error occurred.')
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
        <h1 className="page-title">Create an account</h1>

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
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary">
            {isLoading && <Spinner />}
            {isLoading ? 'Registering…' : 'Register'}
          </button>
        </form>

        <ErrorMessage message={error ?? ''} />

        {success !== null && (
          <div role="status" className="alert alert-success">
            {success}
          </div>
        )}

        <p className="text-center text-sm text-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
