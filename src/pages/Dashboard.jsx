import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { LessonPlayer } from './LessonPlayer'
import { LEVEL_NAMES, LEVEL_ICONS } from '../utils/constants'
import { COURSE_DATA } from '../data/courseData'
import { useApp } from '../context/AppContext'
import { useProgress } from '../context/ProgressContext'

// ── feature highlights shown on the landing screen ──────────────────────────
const FEATURES = [
  { icon: '📚', title: '5 Levels', desc: 'Beginner to Expert — 72 structured lessons' },
  { icon: '⏱️', title: 'Live Metrics', desc: 'Real-time WPM, accuracy and timer' },
  { icon: '🎮', title: 'Games & Arcade', desc: 'Falling Words, Zombies, Space, Race, Combo + Time Attack & Word Sprint' },  { icon: '📊', title: 'Statistics', desc: 'Track progress, streaks and top scores' },
  { icon: '🌙', title: 'Dark Mode', desc: 'Light and dark theme, saved automatically' },
]

// ── welcome screen ────────────────────────────────────────────────────────────
const WelcomeScreen = ({ onLessonSelect }) => {
  const { completedLessons, sessions } = useProgress()
  const totalLessons = Object.values(COURSE_DATA).flat().length
  const avgWPM = sessions.length
    ? Math.round(sessions.reduce((s, r) => s + (r.wpm || 0), 0) / sessions.length)
    : 0

  // find the first uncompleted lesson across all levels
  const suggestLesson = () => {
    for (const [level, lessons] of Object.entries(COURSE_DATA)) {
      const next = lessons.find(l => !completedLessons.includes(l.id))
      if (next) return { lesson: next, level }
    }
    return null
  }
  const suggestion = suggestLesson()

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Hero */}
        <div className="text-center">
          <div className="text-5xl mb-3">🇪🇹</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Amharic Typing Trainer
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
            Master the Ethiopic script step by step — from individual fidel groups to full paragraphs.
          </p>
        </div>

        {/* Progress summary — only shown after any activity */}
        {completedLessons.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Lessons Done', value: completedLessons.length, sub: `of ${totalLessons}` },
              { label: 'Avg WPM', value: avgWPM || '—', sub: 'across all sessions' },
              { label: 'Sessions', value: sessions.length, sub: 'total' },
            ].map(({ label, value, sub }) => (
              <div
                key={label}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center shadow-sm"
              >
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{label}</div>
                <div className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Next lesson suggestion */}
        {suggestion && (
          <div
            onClick={() => onLessonSelect(suggestion.lesson, suggestion.level)}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl p-5 flex items-center justify-between shadow-lg transition-all hover:-translate-y-0.5"
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">
                {completedLessons.length === 0 ? 'Start here' : 'Continue where you left off'}
              </div>
              <div className="text-xl font-bold">{suggestion.lesson.name}</div>
              <div className="text-sm opacity-70 mt-0.5">
                {LEVEL_ICONS[suggestion.level]} {LEVEL_NAMES[suggestion.level]}
              </div>
            </div>
            <span className="text-3xl ml-4">→</span>
          </div>
        )}

        {/* Feature cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          Pick any level from the sidebar to start, or click the card above to jump right in.
        </p>
      </div>
    </div>
  )
}

export const Dashboard = () => {
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const { setCurrentLesson } = useApp()

  const handleLessonSelect = (lesson, level) => {
    setSelectedLesson(lesson)
    setSelectedLevel(level)
    setCurrentLesson(lesson)
  }

  const handleNextLesson = () => {
    if (!selectedLesson || !selectedLevel) return

    const currentLevelLessons = COURSE_DATA[selectedLevel]
    const currentIndex = currentLevelLessons.findIndex(l => l.id === selectedLesson.id)

    if (currentIndex < currentLevelLessons.length - 1) {
      const nextLesson = currentLevelLessons[currentIndex + 1]
      setSelectedLesson(nextLesson)
      setCurrentLesson(nextLesson)
    } else {
      const levels = Object.keys(COURSE_DATA)
      const currentLevelIndex = levels.indexOf(selectedLevel)
      if (currentLevelIndex < levels.length - 1) {
        const nextLevel = levels[currentLevelIndex + 1]
        const nextLesson = COURSE_DATA[nextLevel][0]
        setSelectedLevel(nextLevel)
        setSelectedLesson(nextLesson)
        setCurrentLesson(nextLesson)
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
        <WelcomeScreen onLessonSelect={handleLessonSelect} />
      )}
    </AppLayout>
  )
}
