import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { Vote, LogOut, LayoutDashboard, BarChart2, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-primary-600" style={{ fontFamily: 'Sora, sans-serif' }}>
          <Vote className="h-5 w-5" />
          BouestiVote
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <Link to="/elections" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                <Vote className="h-4 w-4" /> Elections
              </Link>
              <Link to="/results" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                <BarChart2 className="h-4 w-4" /> Results
              </Link>
              <Link to="/verify" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                <ShieldCheck className="h-4 w-4" /> Verify
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                  <LayoutDashboard className="h-4 w-4" /> Admin
                </Link>
              )}
              <div className="h-6 w-px bg-slate-200 mx-1" />
              <span className="text-xs text-slate-500 font-medium hidden sm:block">{user.full_name?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ml-1">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4 ml-2">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
