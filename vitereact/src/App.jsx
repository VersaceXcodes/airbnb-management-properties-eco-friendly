import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>Airbnb Management</h1>
        <h2>Eco-Friendly Properties</h2>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Properties managed: {count}
          </button>
          <p>
            Welcome to your eco-friendly property management platform
          </p>
        </div>
      </div>
    </>
  )
}

export default App