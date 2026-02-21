export const Header = ({ overallScore = 0 }) => {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-8 py-4 shadow-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🇪🇹 Amharic Typing Trainer</h1>
        <div className="text-lg font-medium">
          Overall Score: {overallScore}%
        </div>
      </div>
    </header>
  )
}
