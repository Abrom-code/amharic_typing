import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useApp } from '../../context/AppContext'

export const AppLayout = ({ children, onLessonSelect, currentLessonId }) => {
  const { showAchievement, achievementText } = useApp()

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onLessonSelect={onLessonSelect} currentLessonId={currentLessonId} />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {showAchievement && (
        <div className="fixed top-24 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in z-50">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎉</span>
            <p className="font-semibold">{achievementText}</p>
          </div>
        </div>
      )}
    </div>
  )
}
