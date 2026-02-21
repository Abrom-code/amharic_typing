import { formatTime } from '../../utils/helpers'

export const MetricsBar = ({ wpm, accuracy, time }) => {
  return (
    <div className="flex gap-8 p-4 bg-gray-100 rounded-lg">
      <div className="flex gap-2 items-center">
        <span className="font-semibold text-gray-600">WPM:</span>
        <span className="text-2xl font-bold text-gray-900">{wpm}</span>
      </div>
      <div className="flex gap-2 items-center">
        <span className="font-semibold text-gray-600">Accuracy:</span>
        <span className="text-2xl font-bold text-gray-900">{accuracy}%</span>
      </div>
      <div className="flex gap-2 items-center">
        <span className="font-semibold text-gray-600">Time:</span>
        <span className="text-2xl font-bold text-gray-900">{formatTime(time)}</span>
      </div>
    </div>
  )
}
