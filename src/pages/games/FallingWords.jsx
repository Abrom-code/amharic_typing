import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart } from 'lucide-react'
import { randomWord } from '../../utils/gameWords'
import { useProgress } from '../../context/ProgressContext'

const TICK = 50          // ms per frame
const BASE_SPEED = 0.18  // % per tick
const BASE_INTERVAL = 2200
const MAX_LIVES = 3

let _nextId = 0
const uid = () => ++_nextId

export default function FallingWords() {
  const navigate = useNavigate()
  const { saveGameScore, gameScores } = useProgress()

  const [phase, setPhase] = useState('menu')
  const [words, setWords] = useState([])
  const [lives, setLives] = useState(MAX_LIVES)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [flash, setFlash] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  // Increment this to remount the <input> and reset IME state
  const [inputKey, setInputKey] = useState(0)

  const wordsRef   = useRef([])
  const livesRef   = useRef(MAX_LIVES)
  const scoreRef   = useRef(0)
  const comboRef   = useRef(0)
  const maxComboRef= useRef(0)
  const elapsedRef = useRef(0)
  const phaseRef   = useRef('menu')
  const tickRef    = useRef(null)
  const spawnRef   = useRef(null)
  const inputRef   = useRef(null)

  const difficulty = (t) => {
    const level = Math.floor(t / 20)
    return {
      speed: BASE_SPEED + level * 0.015,
      interval: Math.max(800, BASE_INTERVAL - level * 120),
    }
  }

  const endGame = useCallback(() => {
    phaseRef.current = 'over'
    clearInterval(tickRef.current)
    clearInterval(spawnRef.current)
    setPhase('over')
    const s = scoreRef.current
    saveGameScore('falling', { score: s, combo: maxComboRef.current, time: elapsedRef.current })
  }, [saveGameScore])

  const spawnWord = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    const t = elapsedRef.current
    const d = difficulty(t)
    const w = {
      id: uid(),
      text: randomWord(),
      x: 5 + Math.random() * 80, // % from left
      y: 0,
      speed: d.speed,
    }
    wordsRef.current = [...wordsRef.current, w]
    setWords([...wordsRef.current])
  }, [])

  const tick = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    elapsedRef.current += TICK / 1000

    const updated = []
    let lost = 0
    for (const w of wordsRef.current) {
      const ny = w.y + w.speed
      if (ny >= 100) {
        lost++
      } else {
        updated.push({ ...w, y: ny })
      }
    }

    if (lost > 0) {
      const nl = Math.max(0, livesRef.current - lost)
      livesRef.current = nl
      setLives(nl)
      comboRef.current = 0
      setCombo(0)
      if (nl <= 0) {
        wordsRef.current = []
        setWords([])
        endGame()
        return
      }
    }

    wordsRef.current = updated
    setWords([...updated])
    setElapsed(Math.floor(elapsedRef.current))
  }, [endGame])

  const startGame = useCallback(() => {
    _nextId = 0
    wordsRef.current = []
    livesRef.current = MAX_LIVES
    scoreRef.current = 0
    comboRef.current = 0
    maxComboRef.current = 0
    elapsedRef.current = 0
    phaseRef.current = 'playing'
    setWords([])
    setLives(MAX_LIVES)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setElapsed(0)
    setPhase('playing')

    clearInterval(tickRef.current)
    clearInterval(spawnRef.current)
    tickRef.current = setInterval(tick, TICK)

    // spawn first word immediately then on interval
    spawnWord()
    const startSpawn = () => {
      const d = difficulty(elapsedRef.current)
      spawnRef.current = setTimeout(() => {
        if (phaseRef.current !== 'playing') return
        spawnWord()
        startSpawn()
      }, d.interval)
    }
    startSpawn()

    setTimeout(() => {
      if (inputRef.current) { inputRef.current.value = ''; inputRef.current.focus() }
    }, 80)
  }, [tick, spawnWord])

  useEffect(() => {
    return () => {
      clearInterval(tickRef.current)
      clearInterval(spawnRef.current)
    }
  }, [])

  const handleInput = (e) => {
    const val = e.target.value
    const match = wordsRef.current.find(w => w.text === val)
    if (match) {
      comboRef.current += 1
      if (comboRef.current > maxComboRef.current) {
        maxComboRef.current = comboRef.current
        setMaxCombo(comboRef.current)
      }
      const multiplier = Math.max(1, Math.floor(comboRef.current / 3))
      const pts = match.text.length * 10 * multiplier
      scoreRef.current += pts
      setScore(scoreRef.current)
      setCombo(comboRef.current)
      setFlash({ id: match.id, text: `+${pts}` })
      setTimeout(() => setFlash(null), 600)
      wordsRef.current = wordsRef.current.filter(w => w.id !== match.id)
      setWords([...wordsRef.current])
      // Remount input to reset Windows IME composition state
      setInputKey(k => k + 1)
    }
  }

  const best = gameScores?.falling

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden select-none">
      {/* HUD */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <button onClick={() => { clearInterval(tickRef.current); clearInterval(spawnRef.current); navigate('/games') }} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-6 text-sm font-semibold">
          <span className="text-yellow-400">Score: {score.toLocaleString()}</span>
          <span className="text-orange-400">Combo: x{combo}</span>
          <span className="text-gray-400">Time: {elapsed}s</span>
          <div className="flex gap-1">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
            ))}
          </div>
        </div>
        {best && <span className="text-xs text-gray-500">Best: {best.score?.toLocaleString()}</span>}
      </div>

      {/* Game area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Falling words */}
        {words.map(w => (
          <div
            key={w.id}
            className="absolute transition-none font-amharic text-lg font-bold px-3 py-1 rounded-lg bg-blue-900/80 border border-blue-500/50 text-blue-200 whitespace-nowrap"
            style={{ left: `${w.x}%`, top: `${w.y}%`, transform: 'translateX(-50%)' }}
          >
            {w.text}
            {flash?.id === w.id && (
              <span className="ml-2 text-yellow-400 text-sm animate-bounce">{flash.text}</span>
            )}
          </div>
        ))}

        {/* Ground line */}
        <div className="absolute bottom-14 left-0 right-0 h-0.5 bg-red-800/60" />

        {/* Input */}
        {phase === 'playing' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900/90 border-t border-gray-800">
            <input
              key={inputKey}
              ref={inputRef}
              type="text"
              className="w-full bg-gray-800 text-white font-amharic text-xl px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Type the falling words…"
              onChange={handleInput}
              autoFocus
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            />
          </div>
        )}

        {/* Menu */}
        {phase === 'menu' && (
          <div className="absolute inset-0 overflow-y-auto bg-gray-950/95">
            <div className="min-h-full flex items-center justify-center py-8 px-4">
              <div className="text-center max-w-sm w-full">
                <div className="text-6xl mb-4">🌧️</div>
                <h2 className="text-3xl font-bold mb-2">Falling Words</h2>
                <p className="text-gray-400 text-sm mb-2">Words fall from the sky. Type them before they hit the ground.</p>
                <p className="text-gray-500 text-xs mb-6">You have {MAX_LIVES} lives. Combos multiply your score.</p>
                {best && <p className="text-yellow-400 text-sm mb-4">Best: {best.score?.toLocaleString()} pts</p>}
                <button onClick={startGame} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition">
                  Start
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over */}
        {phase === 'over' && (
          <div className="absolute inset-0 overflow-y-auto bg-gray-950/95">
            <div className="min-h-full flex items-center justify-center py-8 px-4">
              <div className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full text-center border border-gray-700">
                <div className="text-5xl mb-4">💀</div>
                <h2 className="text-2xl font-bold mb-6">Game Over</h2>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[['Score', score.toLocaleString()], ['Max Combo', `x${maxCombo}`], ['Time', `${elapsed}s`]].map(([l, v]) => (
                    <div key={l} className="bg-gray-800 rounded-xl p-3">
                      <div className="text-xs text-gray-500 uppercase">{l}</div>
                      <div className="text-xl font-bold text-white">{v}</div>
                    </div>
                  ))}
                </div>
                {best && score >= best.score && <p className="text-yellow-400 font-semibold mb-4">🏆 New Personal Best!</p>}
                <div className="flex gap-3 justify-center">
                  <button onClick={startGame} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition">Play Again</button>
                  <button onClick={() => navigate('/games')} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition">Back</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
