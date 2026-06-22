const variants = {
  primary:   'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-card-md hover:shadow-card-lg focus-visible:ring-brand-400',
  secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 focus-visible:ring-slate-400',
  success:   'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-card-md focus-visible:ring-emerald-400',
  danger:    'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-card-md focus-visible:ring-red-400',
  ghost:     'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus-visible:ring-slate-400',
  outline:   'border border-slate-300 dark:border-slate-600 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus-visible:ring-brand-400',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'lg',
  onClick,
  disabled,
  className = '',
  type = 'button',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      inline-flex items-center justify-center gap-2 font-semibold
      transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
      ${variants[variant] ?? variants.primary}
      ${sizes[size] ?? sizes.lg}
      ${className}
    `}
  >
    {children}
  </button>
)
