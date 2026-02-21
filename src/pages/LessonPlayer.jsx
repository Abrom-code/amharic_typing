import { useState, useEffect } from 'react'
import { useTyping } from '../hooks/useTyping'
import { useTimer } from '../hooks/useTimer'
import { useSound } from '../hooks/useSound'
import { useProgress } from '../context/ProgressContext'
import { useApp } from '../context/AppContext'
import { GhostText } from '../components/typing/GhostText'
import { VirtualKeyboard } from '../components/typing/VirtualKeyboard'
import { MetricsBar } from '../components/stats/MetricsBar'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { getGrade } from '../utils/helpers'

export const LessonPlayer = ({ lesson, levelName }) => {
  const [isActive, setIsActive] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const { play } = useSound()
  const { completeLesson } = useProgress()
  const { showAchievementPopup } = useApp()

  const {
    currentIndex,
    typedChars,
    wpm,
    accuracy,
    isComplete,
    activeKey,
    errorKey,
    updateWPM,
    reset: resetTyping
  } = useTyping(lesson.text, isActive)

  const { time, reset: resetTimer } = useTimer(isActive, lesson.timeLimit)

  useEffect(() => {
    if (isActive && time > 0) {
      updateWPM(time)
    }
  }, [time, isActive, updateWPM])

  useEffect(() => {
    if (isComplete) {
      setIsActive(false)
      setShowResults(true)
      
      const passed = accuracy >= lesson.minAccuracy && (!lesson.minWPM || wpm >= lesson.minWPM)
      
      if (passed) {
        play('success')
        completeLesson(lesson.id, wpm, accuracy)
        showAchievementPopup(`${lesson.name} Completed!`)
      } else {
        play('error')
      }
    }
  }, [isComplete])

  useEffect(() => {
    if (activeKey) play('key')
    if (errorKey) play('error')
  }, [activeKey, errorKey])

  const handleStart = () => {
    resetTyping()
    resetTimer()
    setIsActive(true)
    setShowResults(false)
  }

  const handleRestart = () => {
    handleStart()
  }

  const grade = getGrade(accuracy)
  const passed = accuracy >= lesson.minAccuracy && (!lesson.minWPM || wpm >= lesson.minWPM)

  return (
    <div className="h-full flex flex-col">
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{lesson.name}</h2>
            <p className="text-gray-600">{levelName}</p>
          </div>

          <MetricsBar wpm={wpm} accuracy={accuracy} time={time} />

          <div className="my-8 p-8 bg-gray-50 rounded-xl border-2 border-gray-200 min-h-[200px] flex items-center justify-center">
            <GhostText 
              text={lesson.text} 
              currentIndex={currentIndex} 
              typedChars={typedChars}
            />
          </div>

          <div className="flex gap-4">
            {!isActive && !showResults && (
              <Button onClick={handleStart}>Start Lesson</Button>
            )}
            {isActive && (
              <Button variant="secondary" onClick={handleRestart}>Restart</Button>
            )}
          </div>
        </div>
      </div>



      <Modal isOpen={showResults} onClose={() => setShowResults(false)}>
        <h3 className="text-3xl font-bold text-center mb-6">Lesson Complete!</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">WPM</p>
            <p className="text-3xl font-bold">{wpm}</p>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Accuracy</p>
            <p className="text-3xl font-bold">{accuracy}%</p>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Grade</p>
            <p className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {grade}
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          {passed && <Button variant="success" onClick={() => setShowResults(false)}>Continue</Button>}
          <Button variant="secondary" onClick={handleRestart}>Try Again</Button>
        </div>
      </Modal>
    </div>
  )
}
