import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Shield } from 'lucide-react'
import { wordByLength, randomWord } from '../../utils/gameWords'
import { useProgress } from '../../context/ProgressContext'

const TICK = 80
const MAX_HP = 5
const WAVE_SIZE = (wave) => 4 + wave * 2
const ZOMBIE_TYPES = {
  normal: { emoji: '🧟', speed: 0.12, label: 'normal', color: 'bg-green-900 border-green-600 text-green-200', wordType: 'medium' },
  runner: { emoji: '🏃', speed: 0.22, label: 'runner', color: 'bg-yellow-900 border-yellow-600 text-yellow-200', wordType: 'short' },
  tank:   { emoji: '🦍', speed: 0.06, label: 'tank',   color: 'bg-red-900 border-red-600 text-red-200',     wordType: 'long' },
  boss:   { emoji: '👹', speed: 0.08, label: 'boss',   color: 'bg-purple-900 border-purple-600 text-purple-200', wordType: 'long' },
}

let _zid = 0
const zid = () => ++_zid

const makeZombie = (wave, forceBoss = false) => {
  const types = ['normal','normal','normal','runner','runner','tank']
  if (wave >= 3) types.push('tank')
  const type = forceBoss ? 'boss' : types[Math.floor(Math.random() * types.length)]
  const def = ZOMBIE_TYPES[type]
  return {
    id: zid(),
    type,
    emoji: def.emoji,
    color: def.color,
    speed: def.speed + wave * 0.005,
    word: wordByLength(def.wordType),
    x: 10 + Math.random() * 80,
    y: 0,
  }
}

export default function ZombieSurvival() {
  const navigate = useNavigate()
  const { saveGameScore, gameScores } = useProgress()

  const [phase, setPhase] = useState('menu')
  const [zombies, setZombies] = useState([])
  const [typed, setTyped] = useState('')
  const [hp, setHp] = useState(MAX_HP)
  const [wave, setWave] = useState(1)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [waveMsg, setWaveMsg] = useState('')
  const [powerUp, setPowerUp] = useState(null) // 'shield' | 'slow'

  const zombiesRef = useRef([])
  const hpRef      = useRef(MAX_HP)
  const scoreRef   = useRef(0)
  const comboRef   = useRef(0)
  const waveRef    = useRef(1)
  const phaseRef   = useRef('menu')
  const spawnedRef = useRef(0)
  const waveMaxRef = useRef(WAVE_SIZE(1))
  const shieldRef  = useRef(false)
  const tickRef    = useRef(null)
  const inputRef   = useRef(null)

  const endGame = useCallback(() => {
    phaseRef.current = 'over'
    clearInterval(tickRef.current)
    setPhase('over')
    saveGameScore('zombie', { score: scoreRef.current, wave: waveRef.current, combo: comboRef.current })
  }, [saveGameScore])

  const nextWave = useCallback(() => {
    const nw = waveRef.current + 1
    waveRef.current = nw
    spawnedRef.current = 0
    waveMaxRef.current = WAVE_SIZE(nw)
    setWave(nw)
    setWaveMsg(`Wave ${nw}!`)
    setTimeout(() => setWaveMsg(''), 1500)
    // reward
    if (nw % 3 === 0) {
      setPowerUp('shield')
      shieldRef.current = true
      setTimeout(() => { shieldRef.current = false; setPowerUp(null) }, 8000)
    }
  }, [])

  const tick = useCallback(() => {
    if (phaseRef.current !== 'playing') return

    const updated = []
    let damage = 0
    const isBoss = waveRef.current % 5 === 0 && spawnedRef.current === 0

    // Spawn next zombie
    if (spawnedRef.current < waveMaxRef.current) {
      if (Math.random() < 0.04) {
        const z = makeZombie(waveRef.current, isBoss)
        zombiesRef.current = [...zombiesRef.current, z]
        spawnedRef.current++
      }
    }

    for (const z of zombiesRef.current) {
      const ny = z.y + z.speed
      if (ny >= 92) {
        damage++
      } else {
        updated.push({ ...z, y: ny })
      }
    }

    if (damage > 0 && !shieldRef.current) {
      const nh = Math.max(0, hpRef.current - damage)
      hpRef.current = nh
      setHp(nh)
      comboRef.current = 0
      setCombo(0)
      if (nh <= 0) {
        zombiesRef.current = []
        setZombies([])
        endGame()
        return
      }
    }

    zombiesRef.current = updated
    setZombies([...updated])

    // Wave clear
    if (spawnedRef.current >= waveMaxRef.current && updated.length === 0) {
      nextWave()
    }
  }, [endGame, nextWave])

  const startGame = useCallback(() => {
    _zid = 0
    zombiesRef.current = []
    hpRef.current = MAX_HP
    scoreRef.current = 0
    comboRef.current = 0
    waveRef.current = 1
    spawnedRef.current = 0
    waveMaxRef.current = WAVE_SIZE(1)
    shieldRef.current = false
    phaseRef.current = 'playing'
    setZombies([]); setHp(MAX_HP); setScore(0); setCombo(0); setWave(1); setTyped(''); setPowerUp(null)
    setPhase('playing')
    setWaveMsg('Wave 1!')
    setTimeout(() => setWaveMsg(''), 1500)
    clearInterval(tickRef.current)
    tickRef.current = setInterval(tick, TICK)
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [tick])

  useEffect(() => () => clearInterval(tickRef.current), [])

  const handleInput = (e) => {
    const val = e.target.value
    setTyped(val)
    const match = zombiesRef.current.find(z => z.word === val)
    if (match) {
      comboRef.current++
      const pts = (match.type === 'boss' ? 200 : match.type === 'tank' ? 80 : match.type === 'runner' ? 40 : 30) * Math.max(1, Math.floor(comboRef.current / 3))
      scoreRef.current += pts
      setScore(scoreRef.current)
      setCombo(comboRef.current)
      zombiesRef.current = zombiesRef.current.filter(z => z.id !== match.id)
      setZombies([...zombiesRef.current])
      setTyped(''); e.target.value = ''
    }
  }

  const best = gameScores?.zombie

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <button onClick={() => { clearInterval(tickRef.current); navigate('/games') }} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-5 text-sm font-semibold">
          <span className="text-yellow-400">Score: {score.toLocaleString()}</span>
          <span className="text-orange-400">Combo: x{combo}</span>
          <span className="text-green-400">Wave: {wave}</span>
          <div className="flex gap-1">
            {Array.from({ length: MAX_HP }).map((_, i) => (
              <Heart key={i} className={`w-4 h-4 ${i < hp ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
            ))}
          </div>
          {powerUp === 'shield' && <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />}
        </div>
        {best && <span className="text-xs text-gray-500">Best: Wave {best.wave}</span>}
      </div>

      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950">
        {waveMsg && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="text-4xl font-black text-red-400 animate-bounce">{waveMsg}</div>
          </div>
        )}

        {zombies.map(z => (
          <div
            key={z.id}
            className={`absolute text-center ${z.color} border rounded-xl px-2 py-1 text-sm font-bold whitespace-nowrap transition-none`}
            style={{ left: `${z.x}%`, top: `${z.y}%`, transform: 'translateX(-50%)' }}
          >
            <div>{z.emoji}</div>
            <div className="font-amharic">{z.word}</div>
          </div>
        ))}

        {/* Ground / player */}
        <div className="absolute bottom-14 left-0 right-0 h-1 bg-green-900/50" />
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-3xl">🧍</div>

        {phase === 'playing' && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-900/90 border-t border-gray-800">
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-gray-800 text-white font-amharic text-xl px-4 py-2 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
              placeholder="Type the zombie's word…"
              onChange={handleInput}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            />
          </div>
        )}

        {phase === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/90">
            <div className="text-center max-w-sm">
              <div className="text-6xl mb-4">🧟</div>
              <h2 className="text-3xl font-bold mb-2">Zombie Survival</h2>
              <p className="text-gray-400 text-sm mb-6">Type words to defeat zombies. Survive as many waves as possible.</p>
              {best && <p className="text-green-400 text-sm mb-4">Best: Wave {best.wave} — {best.score?.toLocaleString()} pts</p>}
              <button onClick={startGame} className="px-8 py-3 bg-green-700 hover:bg-green-600 rounded-xl font-bold text-lg transition">Start</button>
            </div>
          </div>
        )}

        {phase === 'over' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/90">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full text-center border border-gray-700">
              <div className="text-5xl mb-3">💀</div>
              <h2 className="text-2xl font-bold mb-5">Survived {wave} waves</h2>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[['Score', score.toLocaleString()], ['Wave', wave], ['Max Combo', combo]].map(([l, v]) => (
                  <div key={l} className="bg-gray-800 rounded-xl p-3">
                    <div className="text-xs text-gray-500 uppercase">{l}</div>
                    <div className="text-xl font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={startGame} className="px-6 py-2 bg-green-700 hover:bg-green-600 rounded-lg font-semibold transition">Play Again</button>
                <button onClick={() => navigate('/games')} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition">Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
