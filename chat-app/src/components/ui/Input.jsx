import { cn } from '../../utils/helpers'
import './Input.css'

export const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error = false,
  className,
  label,
  ...props
}) => {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        className={cn('input', error && 'input-error', className)}
        {...props}
      />
      {error && typeof error === 'string' && (
        <span className="input-error-message">{error}</span>
      )}
    </div>
  )
}



