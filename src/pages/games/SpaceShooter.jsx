import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { wordByLength, randomWord } from '../../utils/gameWords'
import { useProgress } from '../../context/ProgressContext'

const TICK = 70
const MAX_HP = 4
const LEVEL_ENEMIES = (lvl) => 4 + lvl * 2

let _eid = 0
const eid = () => ++_eid

const makeEnemy = (level, isBoss = false) => {
  const emoji = isBoss ? '👾' : ['🛸', '🚀', '☄️', '💫'][Math.floor(Math.random() * 4)]
  const wType = level < 3 ? 'short' : level < 6 ? 'medium' : 'long'
  return {
    id: eid(),
    emoji,
    isBoss,
    word: isBoss ? randomWord() + ' ' + wordByLength('short') : wordByLength(wType),
    x: 5 + Math.random() * 88,
    y: 0,
    speed: (isBoss ? 0.04 : 0.09 + level * 0.012),
    color: isBoss ? 'text-purple-400' : 'text-cyan-300',
  }
}

export default function SpaceShooter() {
  const navigate = useNavigate()
  const { saveGameScore, gameScores } = useProgress()

  const [phase, setPhase] = useState('menu')
  const [enemies, setEnemies] = useState([])
  const [typed, setTyped] = useState('')
  const [hp, setHp] = useState(MAX_HP)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [levelMsg, setLevelMsg] = useState('')
  const [missiles, setMissiles] = useState([]) // { id, x, y, targetId }

  const enemiesRef  = useRef([])
  const hpRef       = useRef(MAX_HP)
  const scoreRef    = useRef(0)
  const streakRef   = useRef(0)
  const levelRef    = useRef(1)
  const spawnedRef  = useRef(0)
  const levelMaxRef = useRef(LEVEL_ENEMIES(1))
  const phaseRef    = useRef('menu')
  const tickRef     = useRef(null)
  const inputRef    = useRef(null)

  const endGame = useCallback(() => {
    phaseRef.current = 'over'
    clearInterval(tickRef.current)
    setPhase('over')
    saveGameScore('space', { score: scoreRef.current, level: levelRef.current, streak: streakRef.current })
  }, [saveGameScore])

  const nextLevel = useCallback(() => {
    const nl = levelRef.current + 1
    levelRef.current = nl
    spawnedRef.current = 0
    levelMaxRef.current = LEVEL_ENEMIES(nl)
    setLevel(nl)
    setLevelMsg(`Level ${nl}!`)
    setTimeout(() => setLevelMsg(''), 1500)
  }, [])

  const tick = useCallback(() => {
    if (phaseRef.current !== 'playing') return

    const isBoss = levelRef.current % 4 === 0 && spawnedRef.current === 0 && levelRef.current > 1

    if (spawnedRef.current < levelMaxRef.current && Math.random() < 0.05) {
      const e = makeEnemy(levelRef.current, isBoss)
      enemiesRef.current = [...enemiesRef.current, e]
      spawnedRef.current++
    }

    const updated = []
    let damage = 0
    for (const e of enemiesRef.current) {
      const ny = e.y + e.speed
      if (ny >= 90) {
        damage++
      } else {
        updated.push({ ...e, y: ny })
      }
    }

    if (damage > 0) {
      const nh = Math.max(0, hpRef.current - damage)
      hpRef.current = nh
      setHp(nh)
      streakRef.current = 0
      setStreak(0)
      if (nh <= 0) { enemiesRef.current = []; setEnemies([]); endGame(); return }
    }

    enemiesRef.current = updated
    setEnemies([...updated])

    if (spawnedRef.current >= levelMaxRef.current && updated.length === 0) nextLevel()
  }, [endGame, nextLevel])

  const startGame = useCallback(() => {
    _eid = 0
    enemiesRef.current = []
    hpRef.current = MAX_HP; scoreRef.current = 0; streakRef.current = 0
    levelRef.current = 1; spawnedRef.current = 0; levelMaxRef.current = LEVEL_ENEMIES(1)
    phaseRef.current = 'playing'
    setEnemies([]); setHp(MAX_HP); setScore(0); setStreak(0); setLevel(1); setTyped(''); setMissiles([])
    setPhase('playing')
    setLevelMsg('Level 1!')
    setTimeout(() => setLevelMsg(''), 1500)
    clearInterval(tickRef.current)
    tickRef.current = setInterval(tick, TICK)
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [tick])

  useEffect(() => () => clearInterval(tickRef.current), [])

  const handleInput = (e) => {
    const val = e.target.value
    setTyped(val)
    const match = enemiesRef.current.find(en => en.word === val)
    if (match) {
      streakRef.current++
      const bonus = streakRef.current >= 5 ? 2 : 1
      const pts = (match.isBoss ? 300 : match.word.length * 15) * bonus
      scoreRef.current += pts
      setScore(scoreRef.current)
      setStreak(streakRef.current)
      // show missile animation
      setMissiles(prev => [...prev, { id: match.id, x: match.x, y: match.y }])
      setTimeout(() => setMissiles(prev => prev.filter(m => m.id !== match.id)), 400)
      enemiesRef.current = enemiesRef.current.filter(en => en.id !== match.id)
      setEnemies([...enemiesRef.current])
      setTyped(''); e.target.value = ''
    }
  }

  const best = gameScores?.space

  return (
    <div className="h-screen text-white flex flex-col overflow-hidden select-none" style={{ background: 'radial-gradient(ellipse at center, #0d1b4b 0%, #020811 100%)' }}>
      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white opacity-30" style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
        ))}
      </div>

      <div className="flex items-center justify-between px-6 py-3 bg-black/40 border-b border-indigo-900 flex-shrink-0 z-10">
        <button onClick={() => { clearInterval(tickRef.current); navigate('/games') }} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-5 text-sm font-semibold">
          <span className="text-yellow-400">Score: {score.toLocaleString()}</span>
          <span className="text-cyan-400">Streak: {streak}</span>
          <span className="text-indigo-300">Level: {level}</span>
          <div className="flex gap-1">
            {Array.from({ length: MAX_HP }).map((_, i) => (
              <span key={i} className={`text-lg ${i < hp ? '' : 'opacity-20'}`}>🛡️</span>
            ))}
          </div>
        </div>
        {best && <span className="text-xs text-gray-500">Best: Lv{best.level}</span>}
      </div>

      <div className="flex-1 relative overflow-hidden z-10">
        {levelMsg && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="text-4xl font-black text-cyan-400 animate-bounce">{levelMsg}</div>
          </div>
        )}

        {enemies.map(en => (
          <div key={en.id} className={`absolute text-center transition-none ${en.color}`}
            style={{ left: `${en.x}%`, top: `${en.y}%`, transform: 'translateX(-50%)' }}>
            <div className="text-2xl">{en.emoji}</div>
            <div className="font-amharic text-xs bg-black/60 px-2 py-0.5 rounded">{en.word}</div>
          </div>
        ))}

        {missiles.map(m => (
          <div key={m.id} className="absolute text-yellow-400 text-xl animate-bounce" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translateX(-50%)' }}>💥</div>
        ))}

        {/* Player ship */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-4xl">🚀</div>

        {phase === 'playing' && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/70 border-t border-indigo-900">
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-indigo-950/80 text-white font-amharic text-xl px-4 py-2 rounded-lg border border-indigo-700 focus:border-cyan-500 focus:outline-none"
              placeholder="Type the enemy word to fire…"
              onChange={handleInput}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            />
          </div>
        )}

        {phase === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center max-w-sm">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-3xl font-bold mb-2">Space Shooter</h2>
              <p className="text-gray-400 text-sm mb-6">Enemy ships invade. Type their word to fire and destroy them.</p>
              {best && <p className="text-cyan-400 text-sm mb-4">Best: Level {best.level} — {best.score?.toLocaleString()} pts</p>}
              <button onClick={startGame} className="px-8 py-3 bg-indigo-700 hover:bg-indigo-600 rounded-xl font-bold text-lg transition">Launch</button>
            </div>
          </div>
        )}

        {phase === 'over' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full text-center border border-indigo-800">
              <div className="text-5xl mb-3">💥</div>
              <h2 className="text-2xl font-bold mb-5">Base Destroyed</h2>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[['Score', score.toLocaleString()], ['Level', level], ['Streak', streak]].map(([l, v]) => (
                  <div key={l} className="bg-gray-800 rounded-xl p-3">
                    <div className="text-xs text-gray-500 uppercase">{l}</div>
                    <div className="text-xl font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={startGame} className="px-6 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg font-semibold transition">Try Again</button>
                <button onClick={() => navigate('/games')} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition">Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
