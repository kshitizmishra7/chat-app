import { cn } from '../../utils/helpers'
import './Button.css'

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className,
  ...props
}) => {
  return (
    <button
      type={type}
      className={cn('btn', `btn-${variant}`, `btn-${size}`, className)}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="btn-spinner"></span>}
      {children}
    </button>
  )
}


