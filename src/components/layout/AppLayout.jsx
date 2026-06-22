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
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Header overallScore={overallScore} onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar onLessonSelect={onLessonSelect} currentLessonId={currentLessonId} />
        </div>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile drawer */}
        <div className={`fixed inset-y-0 left-0 z-50 md:hidden transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar
            onLessonSelect={onLessonSelect}
            currentLessonId={currentLessonId}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>

      {/* Achievement toast */}
      {showAchievement && (
        <div className="fixed top-16 right-4 md:top-20 md:right-6 z-50 animate-slide-down">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl shadow-card-lg max-w-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-lg flex-shrink-0">🎉</div>
            <p className="text-sm font-semibold">{achievementText}</p>
          </div>
        </div>
      )}
    </div>
  )
}
