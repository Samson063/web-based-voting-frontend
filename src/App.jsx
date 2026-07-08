import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Home      from './pages/Home'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Elections from './pages/Elections'
import Results   from './pages/Results'
import Verify    from './pages/Verify'
import Admin     from './pages/Admin'
import Spinner   from './components/ui/Spinner'

// Guard: only logged-in users can access
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
  return user ? children : <Navigate to="/login" replace />
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
