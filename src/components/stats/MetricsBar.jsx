import { formatTime } from '../../utils/helpers'
import { Zap, Target, Clock } from 'lucide-react'

const Stat = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-2.5">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
      <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none tabular-nums">{value}</p>
    </div>
  </div>
)

export const MetricsBar = ({ wpm, accuracy, time }) => (
  <div className="flex flex-wrap gap-4 md:gap-6 px-4 md:px-5 py-3 md:py-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-card">
    <Stat
      icon={<Zap className="w-4 h-4 text-brand-500" />}
      label="WPM"
      value={wpm}
      color="bg-brand-50 dark:bg-brand-900/30"
    />
    <Stat
      icon={<Target className="w-4 h-4 text-emerald-500" />}
      label="Accuracy"
      value={`${accuracy}%`}
      color="bg-emerald-50 dark:bg-emerald-900/30"
    />
    <Stat
      icon={<Clock className="w-4 h-4 text-amber-500" />}
      label="Time"
      value={formatTime(time)}
      color="bg-amber-50 dark:bg-amber-900/30"
    />
  </div>
)
