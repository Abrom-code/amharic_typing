import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProgress } from '../context/ProgressContext'

const GAMES = [
  {
    id: 'falling',
    path: '/games/falling',
    emoji: '🌧️',
    title: 'Falling Words',
    desc: 'Words fall from the sky — type them before they hit the ground. Lives, combos, increasing speed.',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'zombie',
    path: '/games/zombie',
    emoji: '🧟',
    title: 'Zombie Survival',
    desc: 'A horde advances. Type words to defeat zombies. Survive as many waves as possible.',
    color: 'from-green-700 to-emerald-500',
  },
  {
    id: 'space',
    path: '/games/space',
    emoji: '🚀',
    title: 'Space Shooter',
    desc: 'Enemy ships invade. Type words to fire missiles and protect your spacecraft.',
    color: 'from-indigo-700 to-purple-500',
  },
  {
    id: 'race',
    path: '/games/race',
    emoji: '🏎️',
    title: 'Race vs AI',
    desc: 'Your typing speed is your engine. Race AI opponents across multiple tracks.',
    color: 'from-orange-600 to-red-500',
  },
  {
    id: 'combo',
    path: '/games/combo',
    emoji: '🔥',
    title: 'Endless Combo',
    desc: 'Pure streak mode. Keep the combo alive as long as possible. Random events add pressure.',
    color: 'from-pink-600 to-rose-500',
  },
]

export default function GamesHub() {
  const navigate = useNavigate()
  const { gameScores } = useProgress()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">🎮 Games</h1>
        <span className="text-gray-500 text-sm ml-2">— Amharic typing arcade</span>
      </div>

      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <p className="text-gray-400 text-sm mb-8 text-center">
          All games use Amharic words. Build speed, accuracy, and reflexes while having fun.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GAMES.map((g) => {
            const best = gameScores?.[g.id]
            return (
              <button
                key={g.id}
                onClick={() => navigate(g.path)}
                className={`text-left rounded-2xl p-6 bg-gradient-to-br ${g.color} hover:scale-[1.02] transition-transform shadow-xl`}
              >
                <div className="text-4xl mb-3">{g.emoji}</div>
                <div className="text-xl font-bold mb-1">{g.title}</div>
                <p className="text-sm text-white/80 mb-4">{g.desc}</p>
                {best && (
                  <div className="text-xs text-white/60 bg-black/20 rounded-lg px-3 py-1 inline-block">
                    Best: {best.score?.toLocaleString?.()} pts
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
