import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { LessonPlayer } from './LessonPlayer'
import { LEVEL_NAMES } from '../utils/constants'
import { COURSE_DATA } from '../data/courseData'

export const Dashboard = () => {
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)

  const handleLessonSelect = (lesson, level) => {
    setSelectedLesson(lesson)
    setSelectedLevel(level)
  }

  const handleNextLesson = () => {
    if (!selectedLesson || !selectedLevel) return

    const currentLevelLessons = COURSE_DATA[selectedLevel]
    const currentIndex = currentLevelLessons.findIndex(l => l.id === selectedLesson.id)

    // Check if there's a next lesson in the current level
    if (currentIndex < currentLevelLessons.length - 1) {
      const nextLesson = currentLevelLessons[currentIndex + 1]
      setSelectedLesson(nextLesson)
    } else {
      // Move to next level
      const levels = Object.keys(COURSE_DATA)
      const currentLevelIndex = levels.indexOf(selectedLevel)
      
      if (currentLevelIndex < levels.length - 1) {
        const nextLevel = levels[currentLevelIndex + 1]
        const nextLesson = COURSE_DATA[nextLevel][0]
        setSelectedLevel(nextLevel)
        setSelectedLesson(nextLesson)
      }
    }
  }

  return (
    <AppLayout 
      onLessonSelect={handleLessonSelect}
      currentLessonId={selectedLesson?.id}
    >
      {selectedLesson ? (
        <LessonPlayer 
          lesson={selectedLesson} 
          levelName={LEVEL_NAMES[selectedLevel]}
          onNextLesson={handleNextLesson}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to Amharic Typing Trainer
            </h2>
            <p className="text-xl text-gray-600">
              Select a lesson from the sidebar to begin your journey
            </p>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
