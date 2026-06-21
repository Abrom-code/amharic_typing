import { Sun, Moon } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export const Header = ({ overallScore = 0 }) => {
  const { isDark, toggleTheme } = useApp()

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-8 py-4 shadow-lg flex-shrink-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🇪🇹 Amharic Typing Trainer</h1>
        <div className="flex items-center gap-4">
          <span className="text-lg font-medium">Overall Score: {overallScore}%</span>
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
