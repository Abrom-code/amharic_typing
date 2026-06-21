export const calculateWPM = (correctChars, timeInSeconds) => {
  if (timeInSeconds === 0) return 0
  const words = correctChars / 5
  const minutes = timeInSeconds / 60
  return Math.round(words / minutes)
}

export const calculateAccuracy = (correctChars, totalChars) => {
  if (totalChars === 0) return 100
  return Math.round((correctChars / totalChars) * 100)
}

export const getGrade = (accuracy) => {
  if (accuracy >= 95) return 'Excellent'
  if (accuracy >= 90) return 'Advanced'
  if (accuracy >= 80) return 'Good'
  return 'Practice Again'
}

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}


