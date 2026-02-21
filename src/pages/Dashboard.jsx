import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { LessonPlayer } from './LessonPlayer'
import { LEVEL_NAMES } from '../utils/constants'

export const Dashboard = () => {
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)

  const handleLessonSelect = (lesson, level) => {
    setSelectedLesson(lesson)
    setSelectedLevel(level)
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
