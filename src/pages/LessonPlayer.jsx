import { useState, useEffect, useRef } from 'react'
import { useTyping } from '../hooks/useTyping'
import { useTimer } from '../hooks/useTimer'
import { useSound } from '../hooks/useSound'
import { useProgress } from '../context/ProgressContext'
import { useApp } from '../context/AppContext'
import { GhostText } from '../components/typing/GhostText'
import { MetricsBar } from '../components/stats/MetricsBar'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { getGrade } from '../utils/helpers'
import { Play, RotateCcw, CheckCircle2, XCircle } from 'lucide-react'

export const LessonPlayer = ({ lesson, levelName, onNextLesson }) => {
  const [isActive, setIsActive] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [timerStarted, setTimerStarted] = useState(false)
  const inputRef = useRef(null)
  const { play } = useSound()
  const { completeLesson } = useProgress()
  const { showAchievementPopup } = useApp()

  const { typedText, wpm, accuracy, isComplete, letterStats, updateWPM, reset: resetTyping } =
    useTyping(lesson.text, isActive, () => { if (!timerStarted) setTimerStarted(true) })

  const { time, reset: resetTimer } = useTimer(timerStarted, lesson.timeLimit)

  useEffect(() => { resetTyping(); resetTimer(); setIsActive(false); setShowResults(false); setTimerStarted(false) }, [lesson.id])
  useEffect(() => { if (timerStarted && time > 0) updateWPM(time) }, [time, timerStarted])
  useEffect(() => {
    if (!isComplete) return
    setIsActive(false); setTimerStarted(false); setShowResults(true)
    const passed = accuracy >= lesson.minAccuracy && (!lesson.minWPM || wpm >= lesson.minWPM)
    if (passed) { play('success'); completeLesson(lesson.id, wpm, accuracy, letterStats); showAchievementPopup(`${lesson.name} Completed!`) }
    else play('error')
  }, [isComplete])
  useEffect(() => { if (isActive) inputRef.current?.focus() }, [isActive])

  const handleStart = () => {
    resetTyping(); resetTimer(); setIsActive(true); setTimerStarted(false); setShowResults(false)
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (isActive || showResults || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.length === 1 || e.key === 'Enter' || e.key === ' ') handleStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isActive, showResults])

  const grade = getGrade(accuracy)
  const passed = accuracy >= lesson.minAccuracy && (!lesson.minWPM || wpm >= lesson.minWPM)

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Header strip ── */}
      <div className="px-4 md:px-8 pt-5 pb-4 flex-shrink-0 max-w-4xl w-full mx-auto">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-brand-500 dark:text-brand-400 uppercase tracking-widest">{levelName}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">{lesson.name}</h2>
        </div>
        <MetricsBar wpm={wpm} accuracy={accuracy} time={time} />
      </div>

      {/* ── Ghost text box ── */}
      <div className="px-4 md:px-8 flex-shrink-0 max-w-4xl w-full mx-auto">
        <div className="h-40 md:h-52 overflow-y-auto p-4 md:p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-card">
          <GhostText text={lesson.text} typedText={typedText} />
        </div>
      </div>

      {/* ── Input + controls ── */}
      <div className="px-4 md:px-8 pt-3 pb-5 flex-shrink-0 max-w-4xl w-full mx-auto space-y-3">
        <input
          ref={inputRef}
          id="typing-input-hidden"
          type="text"
          className="w-full px-4 py-3 text-xl md:text-2xl font-amharic rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
          disabled={!isActive}
          placeholder={isActive ? 'Type here…' : 'Press any key or tap Start'}
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
        />
        {isActive && typedText.length === lesson.text.length && (
          <p className="text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
            ✓ Done! Press Enter to see results
          </p>
        )}
        <div className="flex gap-3">
          {!isActive && !showResults && (
            <Button onClick={handleStart} size="md">
              <Play className="w-4 h-4" /> Start Lesson
            </Button>
          )}
          {isActive && (
            <Button variant="outline" size="md" onClick={handleStart}>
              <RotateCcw className="w-4 h-4" /> Restart
            </Button>
          )}
        </div>
      </div>

      {/* ── Results modal ── */}
      <Modal isOpen={showResults} onClose={() => setShowResults(false)}>
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl ${passed ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
            {passed ? '🎉' : '💪'}
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {passed ? 'Lesson Complete!' : 'Almost there!'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{lesson.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[['WPM', wpm], ['Accuracy', `${accuracy}%`], ['Grade', grade]].map(([l, v]) => (
            <div key={l} className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{l}</p>
              <p className={`text-xl font-bold ${l === 'Grade' ? (passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400') : 'text-slate-800 dark:text-slate-100'}`}>{v}</p>
            </div>
          ))}
        </div>

        {(lesson.minWPM || lesson.minAccuracy) && (
          <div className="flex justify-center gap-6 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-5 text-sm">
            {lesson.minWPM && (
              <div className="flex items-center gap-1.5">
                {wpm >= lesson.minWPM ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span className="text-slate-600 dark:text-slate-400">Need {lesson.minWPM} WPM</span>
              </div>
            )}
            {lesson.minAccuracy && (
              <div className="flex items-center gap-1.5">
                {accuracy >= lesson.minAccuracy ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span className="text-slate-600 dark:text-slate-400">Need {lesson.minAccuracy}%</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {passed && <Button variant="success" size="md" onClick={() => { setShowResults(false); onNextLesson?.() }}>Continue →</Button>}
          <Button variant="outline" size="md" onClick={handleStart}><RotateCcw className="w-4 h-4" /> Try Again</Button>
        </div>
      </Modal>
    </div>
  )
}
