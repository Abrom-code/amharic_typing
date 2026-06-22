import { Sun, Moon, Menu } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export const Header = ({ overallScore = 0, onMenuClick }) => {
  const { isDark, toggleTheme } = useApp()

  return (
    <header className="flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-3 z-30">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">

        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-card">
              🇪🇹
            </div>
            <span className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:block">
              Amharic Typing
            </span>
          </div>
        </div>

        {/* Right: score + theme toggle */}
        <div className="flex items-center gap-2 md:gap-3">
          {overallScore > 0 && (
            <div className="hidden sm:flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 rounded-xl px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">{overallScore}% complete</span>
            </div>
          )}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isDark
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            }
          </button>
        </div>
      </div>
    </header>
  )
}
