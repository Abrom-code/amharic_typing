import { useCallback } from 'react'

export const useSound = () => {
  const play = useCallback((soundName) => {
    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`)
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch (error) {
      console.warn('Sound playback failed:', error)
    }
  }, [])

  return { play }
}
