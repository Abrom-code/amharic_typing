export const Card = ({ children, className = '', noPad = false }) => (
  <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-card ${noPad ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
)
