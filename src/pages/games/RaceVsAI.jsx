import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { pickWords } from '../../utils/gameWords'
import { useProgress } from '../../context/ProgressContext'

const WORD_COUNT = 30
const TICK = 100

const AI_SPEEDS = {
  easy:   { wpm: 8,  label: 'Easy',   emoji: '🐢' },
  medium: { wpm: 14, label: 'Medium',  emoji: '🐇' },
  hard:   { wpm: 22, label: 'Hard',    emoji: '🏎️' },
  expert: { wpm: 30, label: 'Expert',  emoji: '🚀' },
}

export default function RaceVsAI() {
  const navigate = useNavigate()
  const { saveGameScore, gameScores } = useProgress()

  const [phase, setPhase] = useState('menu')
  const [diff, setDiff] = useState('medium')
  const [words, setWords] = useState([])
  const [typed, setTyped] = useState('')
  const [playerPct, setPlayerPct] = useState(0)
  const [aiPct, setAiPct] = useState(0)
  const [result, setResult] = useState(null) // 'win' | 'lose'
  const [elapsed, setElapsed] = useState(0)
  const [currentWord, setCurrentWord] = useState(0)
  const [inputVal, setInputVal] = useState('')

  const wordsRef      = useRef([])
  const currentRef    = useRef(0)
  const playerPctRef  = useRef(0)
  const elapsedRef    = useRef(0)
  const phaseRef      = useRef('menu')
  const tickRef       = useRef(null)
  const inputRef      = useRef(null)

  const endRace = useCallback((winner) => {
    phaseRef.current = 'over'
    clearInterval(tickRef.current)
    setPhase('over')
    setResult(winner)
    const wpm = Math.round((currentRef.current / 5) / Math.max(elapsedRef.current / 60, 0.01))
    saveGameScore('race', { score: winner === 'win' ? 1000 : 0, wpm, diff, time: elapsedRef.current })
  }, [saveGameScore, diff])

  const tick = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    elapsedRef.current += TICK / 1000
    setElapsed(Math.floor(elapsedRef.current))

    // AI progress: wpm → chars/sec → pct per tick
    const aiDef = AI_SPEEDS[diff]
    const charsPerSec = (aiDef.wpm * 5) / 60
    const totalChars = wordsRef.current.join(' ').length
    const aiChars = charsPerSec * elapsedRef.current
    const np = Math.min(100, (aiChars / totalChars) * 100)
    setAiPct(np)

    if (np >= 100) endRace('lose')
  }, [diff, endRace])

  const startRace = useCallback(() => {
    const ws = pickWords(WORD_COUNT)
    wordsRef.current = ws
    currentRef.current = 0
    playerPctRef.current = 0
    elapsedRef.current = 0
    phaseRef.current = 'playing'
    setWords(ws); setCurrentWord(0); setPlayerPct(0); setAiPct(0)
    setTyped(''); setInputVal(''); setElapsed(0); setResult(null)
    setPhase('playing')
    clearInterval(tickRef.current)
    tickRef.current = setInterval(tick, TICK)
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [tick])

  useEffect(() => () => clearInterval(tickRef.current), [])

  const handleInput = (e) => {
    const val = e.target.value
    setInputVal(val)
    setTyped(val)

    const target = wordsRef.current[currentRef.current]
    if (!target) return

    // Check space or exact match
    const trimmed = val.trimEnd()
    if (val.endsWith(' ') && trimmed === target) {
      const nextIdx = currentRef.current + 1
      currentRef.current = nextIdx
      setCurrentWord(nextIdx)
      const pct = Math.min(100, (nextIdx / wordsRef.current.length) * 100)
      playerPctRef.current = pct
      setPlayerPct(pct)
      setInputVal('')
      setTyped('')
      e.target.value = ''
      if (nextIdx >= wordsRef.current.length) endRace('win')
    }
  }

  const aiDef = AI_SPEEDS[diff]
  const best = gameScores?.race

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <button onClick={() => { clearInterval(tickRef.current); navigate('/games') }} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-5 text-sm font-semibold">
          <span className="text-yellow-400">Time: {elapsed}s</span>
          <span className="text-blue-400">Word: {currentWord}/{WORD_COUNT}</span>
        </div>
        {best?.wpm && <span className="text-xs text-gray-500">Best: {best.wpm} WPM</span>}
      </div>

      <div className="flex-1 p-6 flex flex-col gap-4">
        {/* Race tracks */}
        {phase !== 'menu' && (
          <div className="space-y-4">
            {/* Player track */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>🧍 You</span>
                <span>{Math.round(playerPct)}%</span>
              </div>
              <div className="h-8 bg-gray-800 rounded-full overflow-hidden relative">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${playerPct}%` }} />
                <div className="absolute top-0 h-full flex items-center" style={{ left: `${Math.max(0, playerPct - 3)}%` }}>
                  <span className="text-xl">🚗</span>
                </div>
              </div>
            </div>
            {/* AI track */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{aiDef.emoji} AI ({aiDef.label})</span>
                <span>{Math.round(aiPct)}%</span>
              </div>
              <div className="h-8 bg-gray-800 rounded-full overflow-hidden relative">
                <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{ width: `${aiPct}%` }} />
                <div className="absolute top-0 h-full flex items-center" style={{ left: `${Math.max(0, aiPct - 3)}%` }}>
                  <span className="text-xl">{aiDef.emoji}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Text to type */}
        {phase === 'playing' && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-gray-900 rounded-xl p-4 leading-loose font-amharic text-lg flex-1 overflow-y-auto">
              {words.map((w, i) => (
                <span key={i} className={`mr-2 ${
                  i < currentWord ? 'text-green-500' :
                  i === currentWord ? 'bg-yellow-500/30 text-white rounded px-0.5' :
                  'text-gray-500'
                }`}>{w}</span>
              ))}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              className="w-full bg-gray-800 text-white font-amharic text-xl px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Type word then press space…"
              onChange={handleInput}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            />
          </div>
        )}

        {/* Menu */}
        {phase === 'menu' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm w-full">
              <div className="text-6xl mb-4">🏎️</div>
              <h2 className="text-3xl font-bold mb-2">Race vs AI</h2>
              <p className="text-gray-400 text-sm mb-6">Type words to accelerate. Beat the AI to the finish line.</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {Object.entries(AI_SPEEDS).map(([k, v]) => (
                  <button key={k} onClick={() => setDiff(k)}
                    className={`py-2 rounded-lg font-semibold text-sm transition ${diff === k ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                    {v.emoji} {v.label}
                  </button>
                ))}
              </div>
              {best?.wpm && <p className="text-orange-400 text-sm mb-4">Best: {best.wpm} WPM</p>}
              <button onClick={startRace} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-bold text-lg transition w-full">Race!</button>
            </div>
          </div>
        )}

        {/* Result overlay */}
        {phase === 'over' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/90 z-10">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full text-center border border-gray-700">
              <div className="text-5xl mb-3">{result === 'win' ? '🏆' : '😞'}</div>
              <h2 className="text-2xl font-bold mb-2">{result === 'win' ? 'You Win!' : 'AI Wins'}</h2>
              <p className="text-gray-400 text-sm mb-5">Time: {elapsed}s · Words: {currentWord}/{WORD_COUNT}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={startRace} className="px-6 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg font-semibold transition">Race Again</button>
                <button onClick={() => { setPhase('menu'); setPlayerPct(0); setAiPct(0) }} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition">Change AI</button>
                <button onClick={() => navigate('/games')} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition">Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
