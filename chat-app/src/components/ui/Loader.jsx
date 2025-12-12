import { cn } from '../../utils/helpers'
import './Loader.css'

export const Loader = ({ size = 'medium', className }) => {
  return (
    <div className={cn('loader', `loader-${size}`, className)}>
      <div className="loader-spinner"></div>
    </div>
  )
}



