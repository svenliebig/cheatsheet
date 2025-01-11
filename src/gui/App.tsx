// import { useLocation } from "react-router-dom";
import { Overlay } from './components/Overlay'

function App() {
  // const location = useLocation();
  return (
    <div className="min-h-screen bg-transparent">
      <Overlay />
      {/* {location.hash === "#/overlay" ? <Overlay /> : <Settings />} */}
    </div>
  )
}

export default App
