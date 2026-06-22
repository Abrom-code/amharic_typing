import { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { LessonPlayer } from './LessonPlayer'
import { LEVEL_NAMES, LEVEL_ICONS } from '../utils/constants'
import { COURSE_DATA } from '../data/courseData'
import { useApp } from '../context/AppContext'
import { useProgress } from '../context/ProgressContext'
import { ArrowRight, BookOpen, Zap, Gamepad2, BarChart2, Moon } from 'lucide-react'

const FEATURES = [
  { icon: BookOpen, label: '5 Levels', desc: '72 structured lessons, beginner to expert', color: 'text-brand-500 bg-brand-50 dark:bg-brand-900/30' },
  { icon: Zap,      label: 'Live Metrics', desc: 'Real-time WPM, accuracy and timer', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' },
  { icon: Gamepad2, label: 'Games & Arcade', desc: '7 game modes including typing games', color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/30' },
  { icon: BarChart2,label: 'Statistics', desc: 'Track progress and personal bests', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' },
  { icon: Moon,     label: 'Dark Mode', desc: 'Light and dark theme, auto-saved', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
]

const WelcomeScreen = ({ onLessonSelect }) => {
  const { completedLessons, sessions } = useProgress()
  const totalLessons = Object.values(COURSE_DATA).flat().length
  const avgWPM = sessions.length ? Math.round(sessions.reduce((s, r) => s + (r.wpm || 0), 0) / sessions.length) : 0

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
      <div className="max-w-2xl mx-auto px-5 py-8 flex flex-col gap-7">

        {/* Hero */}
        <div className="text-center pt-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-card-lg mx-auto mb-4 flex items-center justify-center text-3xl">
            🇪🇹
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Amharic Typing Trainer
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            Master the Ethiopic script step by step — from individual fidel groups to full paragraphs.
          </p>
        </div>

        {/* Stats summary */}
        {completedLessons.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Lessons', value: completedLessons.length, sub: `of ${totalLessons}` },
              { label: 'Avg WPM', value: avgWPM || '—', sub: 'all sessions' },
              { label: 'Sessions', value: sessions.length, sub: 'total' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center shadow-card">
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400 tabular-nums">{value}</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{label}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* CTA card */}
        {suggestion && (
          <button
            onClick={() => onLessonSelect(suggestion.lesson, suggestion.level)}
            className="group w-full text-left bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-700 hover:to-violet-700 text-white rounded-2xl p-5 shadow-card-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
                  {completedLessons.length === 0 ? '👋 Start here' : '▶ Continue'}
                </p>
                <p className="text-lg font-bold">{suggestion.lesson.name}</p>
                <p className="text-sm text-white/70 mt-0.5">{LEVEL_ICONS[suggestion.level]} {LEVEL_NAMES[suggestion.level]}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>
        )}

        {/* Feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-card">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 pb-2">
          Pick a level from the sidebar or tap the card above to jump in.
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
    setSelectedLesson(lesson); setSelectedLevel(level); setCurrentLesson(lesson)
  }

  const handleNextLesson = () => {
    if (!selectedLesson || !selectedLevel) return
    const levelLessons = COURSE_DATA[selectedLevel]
    const idx = levelLessons.findIndex(l => l.id === selectedLesson.id)
    if (idx < levelLessons.length - 1) {
      const next = levelLessons[idx + 1]; setSelectedLesson(next); setCurrentLesson(next)
    } else {
      const levels = Object.keys(COURSE_DATA)
      const li = levels.indexOf(selectedLevel)
      if (li < levels.length - 1) {
        const nl = levels[li + 1]; const nLesson = COURSE_DATA[nl][0]
        setSelectedLevel(nl); setSelectedLesson(nLesson); setCurrentLesson(nLesson)
      }
    }
  }

  return (
    <AppLayout onLessonSelect={handleLessonSelect} currentLessonId={selectedLesson?.id}>
      {selectedLesson
        ? <LessonPlayer lesson={selectedLesson} levelName={LEVEL_NAMES[selectedLevel]} onNextLesson={handleNextLesson} />
        : <WelcomeScreen onLessonSelect={handleLessonSelect} />
      }
    </AppLayout>
  )
}
