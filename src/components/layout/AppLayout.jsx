import { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useApp } from '../../context/AppContext'
import { useProgress } from '../../context/ProgressContext'
import { COURSE_DATA } from '../../data/courseData'

export const AppLayout = ({ children, onLessonSelect, currentLessonId }) => {
  const { showAchievement, achievementText } = useApp()
  const { completedLessons } = useProgress()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const totalLessons = Object.values(COURSE_DATA).flat().length
  const overallScore = totalLessons
    ? Math.round((completedLessons.length / totalLessons) * 100)
    : 0

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Header
        overallScore={overallScore}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Desktop sidebar — always visible ≥ md ── */}
        <div className="hidden md:flex">
          <Sidebar
            onLessonSelect={onLessonSelect}
            currentLessonId={currentLessonId}
          />
        </div>

        {/* ── Mobile drawer backdrop ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Mobile drawer ── */}
        <div
          className={`fixed inset-y-0 left-0 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar
            onLessonSelect={onLessonSelect}
            currentLessonId={currentLessonId}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>

      {showAchievement && (
        <div className="fixed top-20 right-4 md:top-24 md:right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 md:px-6 py-3 md:py-4 rounded-lg shadow-2xl animate-slide-in z-50 max-w-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <p className="font-semibold text-sm md:text-base">{achievementText}</p>
          </div>
        </div>
      )}
    </div>
  )
}
