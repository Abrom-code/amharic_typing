import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [currentLesson, setCurrentLesson] = useState(null)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementText, setAchievementText] = useState('')

  // ── theme ──────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('amharic_typing_theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('amharic_typing_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark((prev) => !prev)

  // ── achievements ───────────────────────────────────────────────────────────
  const showAchievementPopup = (text) => {
    setAchievementText(text)
    setShowAchievement(true)
    setTimeout(() => setShowAchievement(false), 3000)
  }

  return (
    <AppContext.Provider value={{
      currentLesson,
      setCurrentLesson,
      showAchievement,
      achievementText,
      showAchievementPopup,
      isDark,
      toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
