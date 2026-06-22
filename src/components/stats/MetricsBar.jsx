import { formatTime } from '../../utils/helpers'

export const MetricsBar = ({ wpm, accuracy, time }) => {
  return (
    <div className="flex gap-4 md:gap-8 p-3 md:p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex-wrap">
      <div className="flex gap-1 md:gap-2 items-center">
        <span className="font-semibold text-gray-600 dark:text-gray-400 text-sm md:text-base">WPM:</span>
        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{wpm}</span>
      </div>
      <div className="flex gap-1 md:gap-2 items-center">
        <span className="font-semibold text-gray-600 dark:text-gray-400 text-sm md:text-base">Accuracy:</span>
        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{accuracy}%</span>
      </div>
      <div className="flex gap-1 md:gap-2 items-center">
        <span className="font-semibold text-gray-600 dark:text-gray-400 text-sm md:text-base">Time:</span>
        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{formatTime(time)}</span>
      </div>
    </div>
  )
}
