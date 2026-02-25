import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const { role } = useAuth()

  if (role === 'provider') {
    return <Navigate to="/contractor/dashboard" replace />
  }

  return <Navigate to="/homeowner/dashboard" replace />
}
