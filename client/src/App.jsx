import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Projects from './pages/Projects/Projects'
import Tickets from './pages/Tickets/Tickets'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/tickets" element={<Tickets />} />
    </Routes>
  )
}

export default App