import { formatTime } from '../../utils/helpers'

export const MetricsBar = ({ wpm, accuracy, time }) => {
  return (
    <div className="flex gap-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex gap-2 items-center">
        <span className="font-semibold text-gray-600 dark:text-gray-400">WPM:</span>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{wpm}</span>
      </div>
      <div className="flex gap-2 items-center">
        <span className="font-semibold text-gray-600 dark:text-gray-400">Accuracy:</span>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{accuracy}%</span>
      </div>
      <div className="flex gap-2 items-center">
        <span className="font-semibold text-gray-600 dark:text-gray-400">Time:</span>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(time)}</span>
      </div>
    </div>
  )
}
