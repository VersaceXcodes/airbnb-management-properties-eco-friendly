import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useAppStore } from './store/main'
import UV_Auth from './components/views/UV_Auth'
import './App.css'

function HomePage() {
  const { authentication_state, logout } = useAppStore()
  const { is_authenticated } = authentication_state.authentication_status

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div>
      <h1>Airbnb Management</h1>
      <h2>Eco-Friendly Properties</h2>
      
      {is_authenticated ? (
        <div className="card">
          <p>Welcome! You are signed in.</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div className="card">
          <p>Welcome to your eco-friendly property management platform</p>
          <Link to="/login">
            <button>Sign In</button>
          </Link>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<UV_Auth />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App