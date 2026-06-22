import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { wordByLength } from '../../utils/gameWords'
import { useProgress } from '../../context/ProgressContext'

const BASE_TIME = 4000  // ms to type each word
const EVENTS = ['normal', 'normal', 'normal', 'speed', 'long', 'accuracy']

const nextEvent = () => EVENTS[Math.floor(Math.random() * EVENTS.length)]
const nextWord = (event) => wordByLength(event === 'long' ? 'long' : event === 'speed' ? 'short' : 'medium')
const timeForEvent = (event, combo) => {
  const base = event === 'speed' ? BASE_TIME * 0.5 : event === 'long' ? BASE_TIME * 1.8 : BASE_TIME
  return Math.max(1200, base - combo * 30)
}

export default function EndlessCombo() {
  const navigate = useNavigate()
  const { saveGameScore, gameScores } = useProgress()

  const [phase, setPhase] = useState('menu')
  const [word, setWord] = useState('')
  const [event, setEvent] = useState('normal')
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(1)
  const [totalTime, setTotalTime] = useState(1)
  const [inputVal, setInputVal] = useState('')
  const [flash, setFlash] = useState('')

  const comboRef    = useRef(0)
  const maxComboRef = useRef(0)
  const scoreRef    = useRef(0)
  const phaseRef    = useRef('menu')
  const wordRef     = useRef('')
  const eventRef    = useRef('normal')
  const timerRef    = useRef(null)
  const tickRef     = useRef(null)
  const timeLeftRef = useRef(BASE_TIME)
  const inputRef    = useRef(null)

  const endGame = useCallback(() => {
    phaseRef.current = 'over'
    clearInterval(timerRef.current)
    clearInterval(tickRef.current)
    setPhase('over')
    saveGameScore('combo', { score: scoreRef.current, combo: maxComboRef.current })
  }, [saveGameScore])

  const nextRound = useCallback(() => {
    const ev = nextEvent()
    const w  = nextWord(ev)
    const t  = timeForEvent(ev, comboRef.current)
    eventRef.current = ev
    wordRef.current = w
    timeLeftRef.current = t
    setWord(w)
    setEvent(ev)
    setTimeLeft(t)
    setTotalTime(t)
    setInputVal('')
    if (inputRef.current) inputRef.current.value = ''

    clearInterval(timerRef.current)
    clearInterval(tickRef.current)

    tickRef.current = setInterval(() => {
      timeLeftRef.current -= 100
      setTimeLeft(timeLeftRef.current)
      if (timeLeftRef.current <= 0) {
        clearInterval(tickRef.current)
        endGame()
      }
    }, 100)
  }, [endGame])

  const startGame = useCallback(() => {
    comboRef.current = 0; maxComboRef.current = 0; scoreRef.current = 0
    phaseRef.current = 'playing'
    setCombo(0); setMaxCombo(0); setScore(0); setPhase('playing'); setFlash('')
    nextRound()
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [nextRound])

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(tickRef.current) }, [])

  const handleInput = (e) => {
    const val = e.target.value
    setInputVal(val)

    if (val === wordRef.current) {
      comboRef.current++
      if (comboRef.current > maxComboRef.current) {
        maxComboRef.current = comboRef.current
        setMaxCombo(comboRef.current)
      }
      const multiplier = 1 + Math.floor(comboRef.current / 5)
      const pts = wordRef.current.length * 20 * multiplier
      scoreRef.current += pts
      setScore(scoreRef.current)
      setCombo(comboRef.current)
      setFlash(`+${pts} ×${multiplier}`)
      setTimeout(() => setFlash(''), 700)
      clearInterval(tickRef.current)
      nextRound()
    }
  }

  const pct = Math.max(0, (timeLeft / totalTime) * 100)
  const barColor = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'

  const eventLabel = { normal: '', speed: '⚡ Speed Burst', long: '📏 Long Word', accuracy: '🎯 Accuracy Round' }
  const best = gameScores?.combo

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden select-none">
      <div className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <button onClick={() => { clearInterval(timerRef.current); clearInterval(tickRef.current); navigate('/games') }} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 md:gap-5 text-xs md:text-sm font-semibold">
          <span className="text-yellow-400">⭐{score.toLocaleString()}</span>
          <span className="text-orange-400">×{combo}</span>
          <span className="text-pink-400">↑{maxCombo}</span>
        </div>
        {best && <span className="text-xs text-gray-500 hidden sm:block">Record: ×{best.combo}</span>}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-6 p-4 md:p-6 overflow-y-auto">
        {phase !== 'menu' && (
          <>
            {/* Timer bar */}
            <div className="w-full max-w-lg h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full ${barColor} transition-all duration-100 rounded-full`} style={{ width: `${pct}%` }} />
            </div>

            {/* Event label */}
            {eventLabel[event] && (
              <div className="text-sm text-yellow-400 font-semibold tracking-wide">{eventLabel[event]}</div>
            )}

            {/* Combo ring */}
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-pink-600 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-pink-400">×{combo}</div>
                  <div className="text-xs text-gray-500">combo</div>
                </div>
              </div>
            </div>

            {/* Word */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-amharic font-bold text-white tracking-widest">{word}</div>
              {flash && <div className="text-yellow-400 font-bold text-base md:text-lg mt-2 animate-bounce">{flash}</div>}
            </div>

            {/* Input */}
            {phase === 'playing' && (
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                className="w-full max-w-md bg-gray-800 text-white font-amharic text-xl md:text-2xl px-4 md:px-6 py-2 md:py-3 rounded-xl border border-gray-600 focus:border-pink-500 focus:outline-none text-center"
                placeholder="Type the word…"
                onChange={handleInput}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
              />
            )}
          </>
        )}

        {phase === 'menu' && (
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">🔥</div>
            <h2 className="text-3xl font-bold mb-2">Endless Combo</h2>
            <p className="text-gray-400 text-sm mb-2">Type each word before time runs out. Combos multiply your score.</p>
            <p className="text-gray-500 text-xs mb-6">Random events change the challenge: Speed Burst, Long Word, Accuracy Round.</p>
            {best && <p className="text-pink-400 text-sm mb-4">Best Combo: ×{best.combo}</p>}
            <button onClick={startGame} className="px-8 py-3 bg-pink-700 hover:bg-pink-600 rounded-xl font-bold text-lg transition">Start</button>
          </div>
        )}

        {phase === 'over' && (
          <div className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full text-center border border-gray-700">
            <div className="text-5xl mb-3">💔</div>
            <h2 className="text-2xl font-bold mb-5">Combo Broken!</h2>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[['Score', score.toLocaleString()], ['Max Combo', `×${maxCombo}`]].map(([l, v]) => (
                <div key={l} className="bg-gray-800 rounded-xl p-3">
                  <div className="text-xs text-gray-500 uppercase">{l}</div>
                  <div className="text-2xl font-bold">{v}</div>
                </div>
              ))}
            </div>
            {best && maxCombo >= best.combo && <p className="text-yellow-400 font-semibold mb-4">🏆 New Record!</p>}
            <div className="flex gap-3 justify-center">
              <button onClick={startGame} className="px-6 py-2 bg-pink-700 hover:bg-pink-600 rounded-lg font-semibold transition">Try Again</button>
              <button onClick={() => navigate('/games')} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition">Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
