import React from 'react'

interface SpinnerProps {
  /** Use 'lg' for a stand-alone page-level spinner; defaults to button-inline size. */
  size?: 'default' | 'lg'
}

/**
 * Animated CSS spinner.
 *
 * The keyframes and class are defined in `index.css`. Renders with
 * `role="status"` and an accessible label so screen readers announce loading state.
 */
const Spinner: React.FC<SpinnerProps> = ({ size = 'default' }) => (
  <span
    className={size === 'lg' ? 'spinner spinner--lg' : 'spinner'}
    role="status"
    aria-label="Loading"
  />
)

export default Spinner
