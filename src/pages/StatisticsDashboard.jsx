import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Star, TrendingUp, Activity, Sparkles, ArrowLeft, BookOpen, Gamepad2, Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { COURSE_DATA } from '../data/courseData'
import { useProgress } from '../context/ProgressContext'
import { formatTime } from '../utils/helpers'
import { GAME_MODES, TIME_ATTACK_OPTIONS, WORD_SPRINT_OPTIONS } from '../utils/constants'

const buildSummary = (s = []) => {
  if (!s.length) return { avgWPM: 0, topSpeed: 0, overallAccuracy: 0 }
  return {
    avgWPM: Math.round(s.reduce((a, r) => a + (r.wpm || 0), 0) / s.length),
    topSpeed: Math.max(...s.map(r => r.wpm || 0)),
    overallAccuracy: Math.round(s.reduce((a, r) => a + (r.accuracy || 0), 0) / s.length),
  }
}
const buildSessionSeries = (s = [], n = 20) =>
  s.slice(-n).map((r, i) => ({ name: r.date ? new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : `#${i+1}`, wpm: r.wpm || 0 }))
const buildWeeklySeries = (s = []) => {
  if (!s.length) return []
  const w = {}
  s.forEach(r => {
    if (!r.date) return
    const d = new Date(r.date), day = (d.getDay() + 6) % 7
    const k = new Date(d - day * 86400000).toISOString().slice(0, 10)
    if (!w[k]) w[k] = { sum: 0, n: 0 }
    w[k].sum += r.wpm || 0; w[k].n++
  })
  return Object.entries(w).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => ({ name: k.slice(5), wpm: Math.round(v.sum / v.n) }))
}
const buildDailySeries = (s = []) => {
  const map = {}
  for (let i = 29; i >= 0; i--) { const k = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10); map[k] = { sum: 0, n: 0 } }
  s.forEach(r => { if (!r.date) return; const k = new Date(r.date).toISOString().slice(0, 10); if (!map[k]) return; map[k].sum += r.wpm || 0; map[k].n++ })
  return Object.entries(map).map(([k, v]) => ({ name: k.slice(5), wpm: v.n ? Math.round(v.sum / v.n) : 0 }))
}
const buildLevelProgress = (done = []) =>
  Object.entries(COURSE_DATA).map(([level, lessons]) => ({ level, completed: lessons.filter(l => done.includes(l.id)).length, total: lessons.length }))

// ── Sub-components ─────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-card flex items-center gap-4">
    <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">{icon}</div>
    <div>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
)

const ViewToggle = ({ value, onChange }) => (
  <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5">
    {[['sessions','Sessions'],['weekly','Weekly'],['30days','30 Days']].map(([v, l]) => (
      <button key={v} onClick={() => onChange(v)}
        className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${value === v ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-card' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
        {l}
      </button>
    ))}
  </div>
)

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
    <BookOpen className="w-8 h-8 opacity-30" />
    <p className="text-sm">{message}</p>
  </div>
)

const levelMeta = {
  beginner:     { label: 'Beginner',     bar: 'bg-brand-400' },
  elementary:   { label: 'Elementary',   bar: 'bg-emerald-400' },
  intermediate: { label: 'Intermediate', bar: 'bg-amber-400' },
  advanced:     { label: 'Advanced',     bar: 'bg-orange-400' },
  expert:       { label: 'Expert',       bar: 'bg-red-400' },
}
const levelBadge = {
  beginner:     'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  elementary:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  advanced:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  expert:       'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

export const StatisticsDashboard = () => {
  const { completedLessons, sessions, arcadeScores, gameScores } = useProgress()
  const navigate = useNavigate()
  const [view, setView] = useState('sessions')
  const all = sessions || []
  const summary = useMemo(() => buildSummary(all), [all])
  const progress = useMemo(() => buildLevelProgress(completedLessons), [completedLessons])
  const totalLessons = Object.values(COURSE_DATA).flat().length
  const recent = useMemo(() => [...all].reverse().slice(0, 10), [all])
  const chartData = useMemo(() => {
    if (view === 'sessions') return buildSessionSeries(all, 20)
    if (view === 'weekly')   return buildWeeklySeries(all)
    if (view === '30days')   return buildDailySeries(all)
    return []
  }, [view, all])
  const hasData = all.length > 0

  const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-card ${className}`}>{children}</div>
  )

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 dark:bg-slate-950">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-200 transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Statistics</h1>
        <ViewToggle value={view} onChange={setView} />
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard icon={<TrendingUp className="text-brand-500 w-5 h-5" />} label="Avg WPM"    value={summary.avgWPM || '—'} sub={hasData ? `${all.length} sessions` : 'no data yet'} />
          <StatCard icon={<Star className="text-amber-500 w-5 h-5" />}       label="Best Speed" value={summary.topSpeed || '—'} sub="WPM personal best" />
          <StatCard icon={<Sparkles className="text-emerald-500 w-5 h-5" />} label="Avg Accuracy" value={hasData ? `${summary.overallAccuracy}%` : '—'} />
          <StatCard icon={<Activity className="text-violet-500 w-5 h-5" />}  label="Lessons Done" value={completedLessons.length} sub={`of ${totalLessons}`} />
        </div>

        {/* Chart + Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          <Card className="lg:col-span-2 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              {view === 'sessions' && 'WPM — Last 20 Sessions'}
              {view === 'weekly'   && 'WPM — Weekly Average'}
              {view === '30days'   && 'WPM — Last 30 Days'}
            </h3>
            {hasData && chartData.some(d => d.wpm > 0) ? (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-700" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={28} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 13 }} formatter={v => [`${v} WPM`, 'Speed']} />
                    <Line type="monotone" dataKey="wpm" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState message="Complete some lessons to see your chart." />}
          </Card>

          <Card className="p-5 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Recent Activity</h3>
            {recent.length > 0 ? (
              <div className="space-y-2 overflow-y-auto flex-1">
                {recent.map((r, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{r.lessonName || r.lessonId}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{r.date ? new Date(r.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                    </div>
                    <div className="ml-3 text-right flex-shrink-0">
                      <p className="text-xs font-bold text-brand-600 dark:text-brand-400">{r.wpm} WPM</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{r.accuracy}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState message="No sessions yet." />}
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-5">Level Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {progress.map(({ level, completed, total }) => {
              const pct = total ? Math.round((completed / total) * 100) : 0
              const meta = levelMeta[level] || { label: level, bar: 'bg-brand-400' }
              return (
                <div key={level}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{meta.label}</span>
                    <span className="text-slate-400 tabular-nums">{completed}/{total}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${meta.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Top Lesson Scores */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Top Lesson Scores</h3>
          {completedLessons.length > 0 ? (() => {
            const rows = completedLessons.map(id => {
              const lesson = Object.values(COURSE_DATA).flat().find(l => l.id === id)
              const best = all.filter(s => s.lessonId === id).sort((a, b) => (b.wpm || 0) - (a.wpm || 0))[0]
              return lesson && best ? { name: lesson.name, level: lesson.level, wpm: best.wpm || 0, accuracy: best.accuracy || 0 } : null
            }).filter(Boolean).sort((a, b) => b.wpm - a.wpm).slice(0, 10)
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                      <th className="text-left pb-2 font-medium">Lesson</th>
                      <th className="text-left pb-2 font-medium">Level</th>
                      <th className="text-right pb-2 font-medium">WPM</th>
                      <th className="text-right pb-2 font-medium">Acc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {rows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{r.name}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${levelBadge[r.level] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{r.level}</span>
                        </td>
                        <td className="py-2 text-right font-bold text-brand-600 dark:text-brand-400 tabular-nums">{r.wpm}</td>
                        <td className="py-2 text-right text-slate-500 dark:text-slate-400 tabular-nums">{r.accuracy}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })() : <EmptyState message="Complete lessons to see scores." />}
        </Card>

        {/* Games & Arcade */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-violet-500" /> Games &amp; Arcade — Personal Bests
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Typing Games</p>
          {(() => {
            const GAME_META = [
              { id: 'falling', emoji: '🌧️', name: 'Falling Words',  stat: s => `${s.score?.toLocaleString()} pts` },
              { id: 'zombie',  emoji: '🧟', name: 'Zombie',          stat: s => `Wave ${s.wave}` },
              { id: 'space',   emoji: '🚀', name: 'Space Shooter',   stat: s => `Lv ${s.level}` },
              { id: 'race',    emoji: '🏎️', name: 'Race vs AI',      stat: s => `${s.wpm} WPM` },
              { id: 'combo',   emoji: '🔥', name: 'Combo',           stat: s => `×${s.combo}` },
            ]
            const hasAny = GAME_META.some(g => gameScores?.[g.id])
            if (!hasAny) return <p className="text-sm text-slate-400 mb-4">No game sessions yet.</p>
            return (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
                {GAME_META.map(g => {
                  const best = gameScores?.[g.id]
                  return (
                    <div key={g.id} className={`rounded-xl p-3 border text-center transition-colors ${best ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600' : 'border-dashed border-slate-200 dark:border-slate-700 opacity-40'}`}>
                      <div className="text-xl mb-1">{g.emoji}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">{g.name}</div>
                      {best
                        ? <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{g.stat(best)}</div>
                        : <div className="text-[10px] text-slate-400">—</div>
                      }
                    </div>
                  )
                })}
              </div>
            )
          })()}

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Arcade Mode</p>
          {(() => {
            const ta = arcadeScores?.[GAME_MODES.TIME_ATTACK] || {}
            const ws = arcadeScores?.[GAME_MODES.WORD_SPRINT] || {}
            const hasArcade = Object.keys(ta).length || Object.keys(ws).length
            if (!hasArcade) return <p className="text-sm text-slate-400">No arcade sessions yet.</p>
            return (
              <div className="flex flex-wrap gap-2">
                {TIME_ATTACK_OPTIONS.filter(o => ta[String(o.seconds)]).map(o => {
                  const s = ta[String(o.seconds)]
                  return (
                    <div key={o.seconds} className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-center min-w-[88px]">
                      <p className="text-[10px] text-slate-400">⏱️ {o.label}</p>
                      <p className="font-bold text-brand-600 dark:text-brand-400 text-sm tabular-nums">{s.wpm} WPM</p>
                      <p className="text-[10px] text-slate-400">{s.accuracy}%</p>
                    </div>
                  )
                })}
                {WORD_SPRINT_OPTIONS.filter(o => ws[String(o.count)]).map(o => {
                  const s = ws[String(o.count)]
                  return (
                    <div key={o.count} className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-center min-w-[88px]">
                      <p className="text-[10px] text-slate-400">🏃 {o.label}</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatTime(s.time)}</p>
                      <p className="text-[10px] text-slate-400">{s.wpm} WPM</p>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </Card>

        <div className="h-4" />
      </div>
    </div>
  )
}

export default StatisticsDashboard
