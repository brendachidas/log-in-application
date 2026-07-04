import React from 'react'

interface ErrorMessageProps {
  /** The error text to display. Renders nothing when empty. */
  message: string
}

/**
 * Inline error alert.
 *
 * Renders nothing when `message` is an empty string, so callers can always
 * pass `error ?? ''` without extra conditional logic.
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null

  return (
    <div role="alert" className="alert alert-error">
      {message}
    </div>
  )
}

export default ErrorMessage
