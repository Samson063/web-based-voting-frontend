import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import {
  Vote, LogOut, LayoutDashboard, BarChart2,
  ShieldCheck, Menu, X
} from 'lucide-react'

const navLinks = (role) => [
  { to: '/elections', label: 'Elections', icon: Vote,            show: true          },
  { to: '/results',   label: 'Results',   icon: BarChart2,       show: true          },
  { to: '/verify',    label: 'Verify',    icon: ShieldCheck,     show: true          },
  { to: '/admin',     label: 'Admin',     icon: LayoutDashboard, show: role==='admin'},
]

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate             = useNavigate()
  const location             = useLocation()
  const [open, setOpen]      = useState(false)

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
    setOpen(false)
  }

  const links = navLinks(user?.role).filter(l => l.show)

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-primary-600 text-lg shrink-0"
          style={{ fontFamily: 'Sora, sans-serif' }}
          onClick={() => setOpen(false)}
        >
          <Vote className="h-5 w-5" />
          BouestiVote
        </Link>

        {/* Desktop nav */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <span className="text-xs text-slate-500 font-medium hidden lg:block">
              {user.full_name?.split(' ')[0]}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ml-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:block">Logout</span>
            </button>
          </div>
        )}

        {/* Desktop nav — not logged in */}
        {!user && (
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login"    className="btn-secondary text-sm py-1.5 px-4">Login</Link>
            <Link to="/register" className="btn-primary  text-sm py-1.5 px-4">Register</Link>
          </div>
        )}

        {/* Mobile: hamburger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">

            {user ? (
              <>
                {/* User info */}
                <div className="px-3 py-2 mb-2 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{user.full_name}</p>
                  <p className="text-xs text-slate-500">{user.matric_number}</p>
                </div>

                {links.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      location.pathname === to
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </Link>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-1"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pb-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-secondary text-sm text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary text-sm text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
