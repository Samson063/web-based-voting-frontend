import { AlertCircle, CheckCircle, Info } from 'lucide-react'

const styles = {
  error:   'bg-red-50 border-red-200 text-red-800',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
}
const icons = {
  error:   <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />,
  success: <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />,
  info:    <Info className="h-4 w-4 shrink-0 mt-0.5" />,
}

export default function Alert({ type = 'info', message }) {
  if (!message) return null
  return (
    <div className={`flex gap-2 items-start border rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  )
}
