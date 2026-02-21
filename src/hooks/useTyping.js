import { useState, useEffect } from 'react'
import { calculateWPM, calculateAccuracy } from '../utils/helpers'

export const useTyping = (targetText, isActive) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [typedChars, setTypedChars] = useState([])
  const [correctChars, setCorrectChars] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [isComplete, setIsComplete] = useState(false)
  const [activeKey, setActiveKey] = useState(null)
  const [errorKey, setErrorKey] = useState(null)

  useEffect(() => {
    if (!isActive) return

    const handleKeyPress = (e) => {
      if (currentIndex >= targetText.length) return

      const expectedChar = targetText[currentIndex]
      const typedChar = e.key

      if (typedChar === expectedChar) {
        setTypedChars([...typedChars, typedChar])
        setCurrentIndex(currentIndex + 1)
        setCorrectChars(correctChars + 1)
        setTotalChars(totalChars + 1)
        setActiveKey(typedChar)
        setTimeout(() => setActiveKey(null), 100)

        if (currentIndex + 1 === targetText.length) {
          setIsComplete(true)
        }
      } else if (typedChar.length === 1) {
        setTypedChars([...typedChars, typedChar])
        setCurrentIndex(currentIndex + 1)
        setTotalChars(totalChars + 1)
        setErrorKey(expectedChar)
        setTimeout(() => setErrorKey(null), 300)
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [isActive, currentIndex, targetText, typedChars, correctChars, totalChars])

  useEffect(() => {
    setAccuracy(calculateAccuracy(correctChars, totalChars))
  }, [correctChars, totalChars])

  const updateWPM = (timeInSeconds) => {
    setWpm(calculateWPM(correctChars, timeInSeconds))
  }

  const reset = () => {
    setCurrentIndex(0)
    setTypedChars([])
    setCorrectChars(0)
    setTotalChars(0)
    setWpm(0)
    setAccuracy(100)
    setIsComplete(false)
    setActiveKey(null)
    setErrorKey(null)
  }

  return {
    currentIndex,
    typedChars,
    correctChars,
    totalChars,
    wpm,
    accuracy,
    isComplete,
    activeKey,
    errorKey,
    updateWPM,
    reset
  }
}
