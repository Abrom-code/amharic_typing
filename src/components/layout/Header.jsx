import { Sun, Moon, Menu } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export const Header = ({ overallScore = 0, onMenuClick }) => {
  const { isDark, toggleTheme } = useApp()

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4 md:px-8 py-3 md:py-4 shadow-lg flex-shrink-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Hamburger — only on mobile */}
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg md:text-2xl font-bold">🇪🇹 Amharic Typing Trainer</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden sm:block text-sm md:text-lg font-medium">
            Score: {overallScore}%
          </span>
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  )
}
