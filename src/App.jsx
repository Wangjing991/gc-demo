import ReactMemoryTest from './components/ReactMemoryTest'
import WorldMarketMap from './components/WorldMarketMap'
import './App.css'

function App() {
  return (
    <div className="app">
      <WorldMarketMap />
      <ReactMemoryTest />
    </div>
  )
}

export default App
