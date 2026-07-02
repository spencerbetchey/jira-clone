import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function GuestRoute({ children }) {
  const { token } = useAuth()

  if (token) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default GuestRoute