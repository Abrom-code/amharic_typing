import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Timer, Zap, Trophy, RotateCcw } from 'lucide-react'
import { useProgress } from '../context/ProgressContext'
import { useSound } from '../hooks/useSound'
import { GhostText } from '../components/typing/GhostText'
import { Button } from '../components/ui/Button'
import {
  GAME_MODES,
  TIME_ATTACK_OPTIONS,
  WORD_SPRINT_OPTIONS,
  ARCADE_WORD_POOL,
} from '../utils/constants'
import { calculateWPM, calculateAccuracy, formatTime } from '../utils/helpers'

// ─── word generators ─────────────────────────────────────────────────────────

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const buildWordList = (n) => {
  const result = []
  while (result.length < n) result.push(...shuffle(ARCADE_WORD_POOL))
  return result.slice(0, n)
}
const pickWords   = (n) => buildWordList(n).join(' ')
const genTimeText = () => buildWordList(200).join(' ')

// ─── game cards ───────────────────────────────────────────────────────────────

const GAMES = [
  {
    id: 'falling', path: '/games/falling', emoji: '🌧️', title: 'Falling Words',
    desc: 'Words fall from the sky — type them before they hit the ground.',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'zombie', path: '/games/zombie', emoji: '🧟', title: 'Zombie Survival',
    desc: 'A horde advances. Type words to defeat zombies. Survive as many waves as possible.',
    color: 'from-green-700 to-emerald-500',
  },
  {
    id: 'space', path: '/games/space', emoji: '🚀', title: 'Space Shooter',
    desc: 'Enemy ships invade. Type words to fire missiles and protect your spacecraft.',
    color: 'from-indigo-700 to-purple-500',
  },
  {
    id: 'race', path: '/games/race', emoji: '🏎️', title: 'Race vs AI',
    desc: 'Your typing speed is your engine. Race AI opponents to the finish.',
    color: 'from-orange-600 to-red-500',
  },
  {
    id: 'combo', path: '/games/combo', emoji: '🔥', title: 'Endless Combo',
    desc: 'Pure streak mode. Keep the combo alive as long as possible.',
    color: 'from-pink-600 to-rose-500',
  },
]

// ─── arcade sub-components ────────────────────────────────────────────────────

const OptionPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
      active ? 'bg-blue-600 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
  >
    {label}
  </button>
)

const ScoreBadge = ({ label, value }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
    <div className="text-3xl font-bold text-white">{value}</div>
  </div>
)

// ─── main hub ─────────────────────────────────────────────────────────────────

export default function GamesHub() {
  const navigate = useNavigate()
  const { play } = useSound()
  const { arcadeScores, saveArcadeScore, gameScores } = useProgress()

  // ── arcade state ──
  const [arcadeMode, setArcadeMode] = useState(GAME_MODES.TIME_ATTACK)
  const [timeOption, setTimeOption]  = useState(TIME_ATTACK_OPTIONS[1])
  const [wordOption, setWordOption]  = useState(WORD_SPRINT_OPTIONS[1])
  const [arcadePhase, setArcadePhase] = useState('config')
  const [targetText, setTargetText] = useState('')
  const [typedText,  setTypedText]  = useState('')
  const [countdown,  setCountdown]  = useState(0)
  const [elapsed,    setElapsed]    = useState(0)
  const [finalWPM,   setFinalWPM]   = useState(0)
  const [finalAcc,   setFinalAcc]   = useState(100)
  const [finalWords, setFinalWords] = useState(0)
  const [finalTime,  setFinalTime]  = useState(0)
  const [isNewBest,  setIsNewBest]  = useState(false)

  const correctRef      = useRef(0)
  const totalRef        = useRef(0)
  const typedRef        = useRef('')
  const elapsedRef      = useRef(0)
  const countdownRef    = useRef(0)
  const phaseRef        = useRef('config')
  const targetRef       = useRef('')
  const modeRef         = useRef(arcadeMode)
  const timeOptRef      = useRef(timeOption)
  const wordOptRef      = useRef(wordOption)
  const isComposingRef  = useRef(false)
  const arcadeInputRef  = useRef(null)
  const intervalRef     = useRef(null)
  const timerStartedRef = useRef(false)

  useEffect(() => { modeRef.current    = arcadeMode  }, [arcadeMode])
  useEffect(() => { timeOptRef.current = timeOption  }, [timeOption])
  useEffect(() => { wordOptRef.current = wordOption  }, [wordOption])

  const endArcade = useCallback(() => {
    if (phaseRef.current === 'results') return
    phaseRef.current = 'results'
    clearInterval(intervalRef.current)
    const cc = correctRef.current, tc = totalRef.current
    const el = elapsedRef.current, cd = countdownRef.current
    const tt = typedRef.current
    const m = modeRef.current, tO = timeOptRef.current, wO = wordOptRef.current
    const timeUsed = m === GAME_MODES.TIME_ATTACK ? tO.seconds - cd : el
    const wpm = calculateWPM(cc, Math.max(timeUsed, 1))
    const acc = calculateAccuracy(cc, tc)
    const words = tt.trim().split(/\s+/).filter(Boolean).length
    setFinalWPM(wpm); setFinalAcc(acc); setFinalWords(words); setFinalTime(el)
    setArcadePhase('results')
    play('success')
    const key = m === GAME_MODES.TIME_ATTACK ? String(tO.seconds) : String(wO.count)
    const existing = (arcadeScores[m] || {})[key]
    const better = !existing || (m === GAME_MODES.TIME_ATTACK ? wpm > existing.wpm : el < existing.time)
    setIsNewBest(better)
    if (m === GAME_MODES.TIME_ATTACK) saveArcadeScore(m, key, { wpm, accuracy: acc, wordsTyped: words })
    else saveArcadeScore(m, key, { time: el, accuracy: acc, wpm })
  }, [play, arcadeScores, saveArcadeScore])

  const startArcade = useCallback(() => {
    clearInterval(intervalRef.current)
    const m = modeRef.current, tO = timeOptRef.current, wO = wordOptRef.current
    const text = m === GAME_MODES.TIME_ATTACK ? genTimeText() : pickWords(wO.count)
    correctRef.current = 0; totalRef.current = 0; typedRef.current = ''
    elapsedRef.current = 0; countdownRef.current = m === GAME_MODES.TIME_ATTACK ? tO.seconds : 0
    phaseRef.current = 'playing'; targetRef.current = text; timerStartedRef.current = false
    setTargetText(text); setTypedText(''); setCountdown(m === GAME_MODES.TIME_ATTACK ? tO.seconds : 0)
    setElapsed(0); setFinalWPM(0); setFinalAcc(100); setFinalWords(0); setFinalTime(0); setIsNewBest(false)
    setArcadePhase('playing')
    setTimeout(() => { const el = document.getElementById('arcade-hub-input'); if (el) { el.value = ''; el.focus() } }, 60)
  }, [])

  useEffect(() => {
    if (arcadePhase !== 'playing') { clearInterval(intervalRef.current); timerStartedRef.current = false; return }
    const el = document.getElementById('arcade-hub-input')
    if (!el) return
    const onCS = () => { isComposingRef.current = true }
    const onCE = () => { isComposingRef.current = false }
    const onInput = (e) => {
      if (phaseRef.current !== 'playing') return
      const input = e.target.value, prev = typedRef.current, target = targetRef.current
      if (input.length === 1 && prev.length === 0 && !timerStartedRef.current) {
        timerStartedRef.current = true
        intervalRef.current = setInterval(() => {
          if (modeRef.current === GAME_MODES.TIME_ATTACK) {
            countdownRef.current -= 1; setCountdown(countdownRef.current)
            if (countdownRef.current <= 0) { clearInterval(intervalRef.current); endArcade() }
          } else { elapsedRef.current += 1; setElapsed(elapsedRef.current) }
        }, 1000)
      }
      if (input.length < prev.length) { typedRef.current = input; setTypedText(input); return }
      if (input.length > target.length) { e.target.value = prev; return }
      const newChar = input[input.length - 1], expChar = target[input.length - 1]
      typedRef.current = input; setTypedText(input)
      if (!isComposingRef.current && input.length > prev.length) {
        totalRef.current++
        if (newChar === expChar) correctRef.current++
      }
      if (modeRef.current === GAME_MODES.WORD_SPRINT && input.length === target.length && !isComposingRef.current) {
        setTimeout(() => { if (document.getElementById('arcade-hub-input')?.value.length === target.length) endArcade() }, 100)
      }
    }
    el.addEventListener('compositionstart', onCS)
    el.addEventListener('compositionend',   onCE)
    el.addEventListener('input', onInput)
    return () => { el.removeEventListener('compositionstart', onCS); el.removeEventListener('compositionend', onCE); el.removeEventListener('input', onInput) }
  }, [arcadePhase, endArcade])

  const arcadeBest = arcadeScores[arcadeMode]?.[arcadeMode === GAME_MODES.TIME_ATTACK ? String(timeOption.seconds) : String(wordOption.count)]
  const timerDisplay = arcadeMode === GAME_MODES.TIME_ATTACK ? formatTime(countdown) : formatTime(elapsed)
  const timerColor = arcadeMode === GAME_MODES.TIME_ATTACK && countdown > 0 && countdown <= 10 ? 'text-red-400 animate-pulse' : 'text-white'
  const wordProgress = typedText.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center gap-4 flex-shrink-0">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" /> Games &amp; Arcade
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8 space-y-10">

          {/* ── Section 1: Typing Games ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-300 mb-1">🎮 Typing Games</h2>
            <p className="text-gray-500 text-sm mb-5">Amharic words. Build speed and reflexes.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GAMES.map((g) => {
                const best = gameScores?.[g.id]
                return (
                  <button
                    key={g.id}
                    onClick={() => navigate(g.path)}
                    className={`text-left rounded-2xl p-6 bg-gradient-to-br ${g.color} hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl`}
                  >
                    <div className="text-4xl mb-3">{g.emoji}</div>
                    <div className="text-xl font-bold mb-1">{g.title}</div>
                    <p className="text-sm text-white/80 mb-4">{g.desc}</p>
                    {best && (
                      <div className="text-xs text-white/60 bg-black/20 rounded-lg px-3 py-1 inline-block">
                        Best: {best.score?.toLocaleString()} pts
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Section 2: Arcade Mode ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-300 mb-1">🕹️ Arcade Mode</h2>
            <p className="text-gray-500 text-sm mb-5">Timed or word-count challenges with random Amharic words.</p>

            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="flex flex-col lg:flex-row">

                {/* Config panel */}
                <div className="lg:w-64 p-6 border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col gap-5">
                  {/* Mode */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Mode</div>
                    <div className="flex flex-col gap-2">
                      {[
                        { id: GAME_MODES.TIME_ATTACK, label: '⏱️ Time Attack', desc: 'Type as many words as possible' },
                        { id: GAME_MODES.WORD_SPRINT, label: '🏃 Word Sprint',  desc: 'Finish a set of words fast' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setArcadeMode(m.id); setArcadePhase('config') }}
                          className={`text-left p-3 rounded-xl border transition-all text-sm ${
                            arcadeMode === m.id
                              ? 'border-blue-500 bg-blue-900/30 text-white'
                              : 'border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <div className="font-semibold">{m.label}</div>
                          <div className="text-xs opacity-70 mt-0.5">{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                      {arcadeMode === GAME_MODES.TIME_ATTACK ? 'Duration' : 'Word Count'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {arcadeMode === GAME_MODES.TIME_ATTACK
                        ? TIME_ATTACK_OPTIONS.map(o => (
                            <OptionPill key={o.seconds} label={o.label}
                              active={timeOption.seconds === o.seconds}
                              onClick={() => { setTimeOption(o); setArcadePhase('config') }} />
                          ))
                        : WORD_SPRINT_OPTIONS.map(o => (
                            <OptionPill key={o.count} label={o.label}
                              active={wordOption.count === o.count}
                              onClick={() => { setWordOption(o); setArcadePhase('config') }} />
                          ))
                      }
                    </div>
                  </div>

                  {/* Personal best */}
                  {arcadeBest && (
                    <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs mb-1">
                        <Trophy className="w-3 h-3" /> Personal Best
                      </div>
                      <div className="text-xl font-bold">{arcadeBest.wpm} WPM</div>
                      <div className="text-xs text-gray-400">{arcadeBest.accuracy}% accuracy</div>
                    </div>
                  )}
                </div>

                {/* Game area */}
                <div className="flex-1 flex flex-col min-h-[420px]">
                  {/* Timer strip */}
                  {arcadePhase === 'playing' && (
                    <div className="flex items-center justify-between px-6 py-3 bg-gray-800/50 border-b border-gray-700">
                      <div className="flex items-center gap-4">
                        <Timer className="w-4 h-4 text-gray-400" />
                        <span className={`text-2xl font-bold tabular-nums ${timerColor}`}>{timerDisplay}</span>
                        <span className="text-sm text-gray-400">
                          {arcadeMode === GAME_MODES.WORD_SPRINT
                            ? `${wordProgress} / ${wordOption.count} words`
                            : `${wordProgress} words`}
                        </span>
                      </div>
                      <button
                        onClick={() => { clearInterval(intervalRef.current); phaseRef.current = 'config'; setArcadePhase('config'); setTypedText(''); typedRef.current = '' }}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition"
                      >
                        <RotateCcw className="w-3 h-3" /> Quit
                      </button>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center p-6">
                    {/* Config */}
                    {arcadePhase === 'config' && (
                      <div className="text-center">
                        <div className="text-5xl mb-3">{arcadeMode === GAME_MODES.TIME_ATTACK ? '⏱️' : '🏃'}</div>
                        <h3 className="text-2xl font-bold mb-1">{arcadeMode === GAME_MODES.TIME_ATTACK ? 'Time Attack' : 'Word Sprint'}</h3>
                        <p className="text-gray-400 text-sm mb-6">
                          {arcadeMode === GAME_MODES.TIME_ATTACK
                            ? `Type as many words as possible in ${timeOption.label}.`
                            : `Type ${wordOption.count} words as fast as you can.`}
                        </p>
                        <Button onClick={startArcade}>Start Game</Button>
                      </div>
                    )}

                    {/* Playing */}
                    {arcadePhase === 'playing' && (
                      <div className="flex flex-col gap-4">
                        <div className="h-44 overflow-y-auto p-4 bg-gray-800 rounded-xl border border-gray-700">
                          <GhostText text={targetText} typedText={typedText} />
                        </div>
                        <input
                          id="arcade-hub-input"
                          ref={arcadeInputRef}
                          type="text"
                          className="w-full px-4 py-3 text-xl font-amharic bg-gray-800 border border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-500"
                          placeholder="Type here… timer starts on first keystroke"
                          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                        />
                      </div>
                    )}

                    {/* Results */}
                    {arcadePhase === 'results' && (
                      <div className="text-center">
                        <h3 className="text-2xl font-bold mb-1">
                          {arcadeMode === GAME_MODES.TIME_ATTACK ? "⏱️ Time's Up!" : '🏁 Sprint Complete!'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-5">
                          {arcadeMode === GAME_MODES.TIME_ATTACK ? `${timeOption.label} challenge` : `${wordOption.count}-word sprint`}
                        </p>
                        <div className="grid grid-cols-3 gap-3 mb-4 max-w-sm mx-auto">
                          <ScoreBadge label="WPM" value={finalWPM} />
                          <ScoreBadge label="Accuracy" value={`${finalAcc}%`} />
                          <ScoreBadge
                            label={arcadeMode === GAME_MODES.TIME_ATTACK ? 'Words' : 'Time'}
                            value={arcadeMode === GAME_MODES.TIME_ATTACK ? finalWords : formatTime(finalTime)}
                          />
                        </div>
                        {isNewBest && (
                          <div className="text-yellow-400 font-semibold flex items-center justify-center gap-2 mb-4">
                            <Trophy className="w-4 h-4" /> New Personal Best!
                          </div>
                        )}
                        <div className="flex gap-3 justify-center flex-wrap">
                          <Button onClick={startArcade}>Play Again</Button>
                          <Button variant="secondary" onClick={() => setArcadePhase('config')}>Change Mode</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
