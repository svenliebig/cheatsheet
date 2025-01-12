import { Settings } from './components/Settings'
import { Overlay } from './components/Overlay'

function App() {
  const isSettings = window.location.hash === '#/settings'
  return (
    <div className="min-h-screen bg-transparent">
      {isSettings ? <Settings /> : <Overlay />}
    </div>
  )
}

export default App
