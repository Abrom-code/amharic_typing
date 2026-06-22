import { useState } from 'react'
import { X, ChevronDown, ChevronRight, BarChart2, Gamepad2 } from 'lucide-react'
import { COURSE_DATA } from '../../data/courseData'
import { LEVEL_ICONS, LEVEL_NAMES } from '../../utils/constants'
import { useProgress } from '../../context/ProgressContext'
import { useNavigate } from 'react-router-dom'

export const Sidebar = ({ onLessonSelect, currentLessonId, onClose }) => {
  const { isLessonCompleted } = useProgress()
  const [expandedLevel, setExpandedLevel] = useState(null)
  const navigate = useNavigate()

  const handleLessonClick = (lesson, level) => {
    onLessonSelect(lesson, level)
    if (onClose) onClose()
  }

  const handleNav = (path) => {
    navigate(path)
    if (onClose) onClose()
  }

  return (
    <aside className="w-72 bg-slate-900 text-slate-100 flex flex-col h-full flex-shrink-0">

      {/* Sidebar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <span className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Lessons</span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Level list */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {Object.keys(COURSE_DATA).map((level) => {
          const expanded = expandedLevel === level
          const lessons = COURSE_DATA[level]
          const doneCount = lessons.filter(l => isLessonCompleted(l.id)).length

          return (
            <div key={level}>
              {/* Level header */}
              <button
                onClick={() => setExpandedLevel(expanded ? null : level)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-slate-800 group"
              >
                <span className="text-lg leading-none">{LEVEL_ICONS[level]}</span>
                <span className="flex-1 text-sm font-medium text-slate-200 group-hover:text-white">{LEVEL_NAMES[level]}</span>
                <span className="text-xs text-slate-500 tabular-nums">{doneCount}/{lessons.length}</span>
                {expanded
                  ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  : <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                }
              </button>

              {/* Lesson list */}
              {expanded && (
                <div className="mt-1 ml-3 pl-3 border-l border-slate-700 space-y-0.5">
                  {lessons.map((lesson) => {
                    const completed = isLessonCompleted(lesson.id)
                    const active = currentLessonId === lesson.id

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson, level)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all ${
                          active
                            ? 'bg-brand-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex-1 truncate">{lesson.name}</span>
                        {completed && (
                          <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-emerald-900/60 text-emerald-400'}`}>
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom navigation */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <button
          onClick={() => handleNav('/games')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <Gamepad2 className="w-4 h-4 text-violet-400" />
          Games &amp; Arcade
        </button>
        <button
          onClick={() => handleNav('/stats')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <BarChart2 className="w-4 h-4 text-brand-400" />
          Statistics
        </button>
      </div>
    </aside>
  )
}
