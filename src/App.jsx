import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ProgressProvider } from './context/ProgressContext'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ProgressProvider>
          <AppRouter />
        </ProgressProvider>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
