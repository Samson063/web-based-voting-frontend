import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Home      from './pages/Home'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Elections from './pages/Elections'
import Results   from './pages/Results'
import Verify    from './pages/Verify'
import Admin     from './pages/Admin'
import Security  from './pages/Security'
import Biometric from './pages/Biometric'
import Spinner   from './components/ui/Spinner'

// Guard: only logged-in users can access
// Voters must also have passed a fingerprint / face check this session.
// Pages that are part of the verification flow itself opt out.
function PrivateRoute({ children, allowUnverified = false }) {
  const { user, loading, biometricVerified } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (!allowUnverified && user.role !== 'admin' && !biometricVerified) {
    return <Navigate to="/biometric" replace />
  }
  return children
}

// Guard: only admins
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/elections" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<Home />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />
      <Route path="/results"   element={<Results />} />
      <Route path="/verify"    element={<Verify />} />
      <Route path="/elections" element={<PrivateRoute><Elections /></PrivateRoute>} />
      <Route path="/security"  element={<PrivateRoute allowUnverified><Security /></PrivateRoute>} />
      <Route path="/biometric" element={<PrivateRoute allowUnverified><Biometric /></PrivateRoute>} />
      <Route path="/admin"     element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
