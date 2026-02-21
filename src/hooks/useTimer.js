import { useState, useEffect, useRef } from 'react'

export const useTimer = (isActive, timeLimit = null) => {
  const [time, setTime] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (timeLimit && prev >= timeLimit) {
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeLimit])

  const reset = () => setTime(0)

  return { time, reset }
}
