import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useApp } from '../../context/AppContext'
import { useProgress } from '../../context/ProgressContext'
import { COURSE_DATA } from '../../data/courseData'

export const AppLayout = ({ children, onLessonSelect, currentLessonId }) => {
  const { showAchievement, achievementText } = useApp()
  const { completedLessons } = useProgress()

  const totalLessons = Object.values(COURSE_DATA).flat().length
  const overallScore = totalLessons
    ? Math.round((completedLessons.length / totalLessons) * 100)
    : 0

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header overallScore={overallScore} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onLessonSelect={onLessonSelect} currentLessonId={currentLessonId} />

        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>

      {showAchievement && (
        <div className="fixed top-24 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in z-50">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎉</span>
            <p className="font-semibold">{achievementText}</p>
          </div>
        </div>
      )}
    </div>
  )
}
