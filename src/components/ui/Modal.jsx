import { useEffect } from 'react'
import { X } from 'lucide-react'

export const Modal = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl shadow-card-lg w-full max-w-lg mx-auto animate-pop overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
