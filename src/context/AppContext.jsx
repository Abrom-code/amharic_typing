import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [currentLesson, setCurrentLesson] = useState(null)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementText, setAchievementText] = useState('')

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
      showAchievementPopup
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
