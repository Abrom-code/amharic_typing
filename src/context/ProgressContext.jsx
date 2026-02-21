import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/storageKeys'
import { LEVEL_REQUIREMENTS } from '../data/levelsConfig'
import { COURSE_DATA } from '../data/courseData'

const ProgressContext = createContext()

export const ProgressProvider = ({ children }) => {
  const [completedLessons, setCompletedLessons] = useLocalStorage(STORAGE_KEYS.COMPLETED_LESSONS, [])
  const [highScores, setHighScores] = useLocalStorage(STORAGE_KEYS.HIGH_SCORES, {})
  const [unlockedLevels, setUnlockedLevels] = useLocalStorage(STORAGE_KEYS.UNLOCKED_LEVELS, ['beginner'])

  const completeLesson = (lessonId, wpm, accuracy) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId])
    }
    
    const currentScore = highScores[lessonId]
    if (!currentScore || wpm > currentScore.wpm || accuracy > currentScore.accuracy) {
      setHighScores({ ...highScores, [lessonId]: { wpm, accuracy } })
    }

    checkLevelUnlock()
  }

  const checkLevelUnlock = () => {
    const levels = ['beginner', 'elementary', 'intermediate', 'advanced', 'expert']
    
    levels.forEach(level => {
      if (unlockedLevels.includes(level)) return
      
      const requirements = LEVEL_REQUIREMENTS[level]
      if (!requirements.requiredLevel) return
      
      const requiredLevelLessons = COURSE_DATA[requirements.requiredLevel]
      const completedCount = requiredLevelLessons.filter(l => 
        completedLessons.includes(l.id)
      ).length
      
      const completionRate = completedCount / requiredLevelLessons.length
      
      if (completionRate >= requirements.requiredCompletion) {
        setUnlockedLevels([...unlockedLevels, level])
      }
    })
  }

  const isLevelUnlocked = (level) => unlockedLevels.includes(level)
  const isLessonCompleted = (lessonId) => completedLessons.includes(lessonId)
  const getLessonScore = (lessonId) => highScores[lessonId]

  return (
    <ProgressContext.Provider value={{
      completedLessons,
      highScores,
      unlockedLevels,
      completeLesson,
      isLevelUnlocked,
      isLessonCompleted,
      getLessonScore
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
