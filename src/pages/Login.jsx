import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { Vote, Eye, EyeOff, ShieldCheck, Lock, AlertCircle, CheckCircle } from 'lucide-react'

export default function Login() {
  const [form, setForm]       = useState({ matric_number: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser }         = useAuth()
  const navigate              = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.matric_number.trim()) { setError('Matric number is required'); return }
    if (!form.password)             { setError('Password is required');       return }
    setLoading(true)
    try {
      const res = await login(form.matric_number.trim(), form.password)
      loginUser(res.data.token, res.data.user)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/elections')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full animate-float" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full animate-float-slow" />
        <svg className="absolute inset-0 w-full h-full opacity-5"><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>

        <div className="relative text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
            <Vote className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>UniVote</h1>
          <p className="text-primary-200 text-lg mb-10">Secure Student Election Portal</p>

          {/* Feature highlights */}
          <div className="space-y-4 text-left max-w-sm">
            {[
              { icon: ShieldCheck, text: 'JWT-secured authentication with role-based access' },
              { icon: Lock,        text: 'One student, one vote — enforced at database level' },
              { icon: CheckCircle, text: 'Real-time results with full audit transparency'     },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3">
                <Icon className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-primary-100 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-500 rounded-2xl mb-3 shadow-lg">
              <Vote className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>UniVote</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Welcome back</h2>
            <p className="text-slate-500 text-sm mb-6">Sign in with your student credentials</p>

            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 mb-4 text-sm animate-fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Matric number */}
              <div>
                <label className="label">Matric Number</label>
                <div className="relative">
                  <input
                    className="input pl-10"
                    placeholder="e.g. CSC/2021/001"
                    value={form.matric_number}
                    onChange={e => setForm({ ...form, matric_number: e.target.value })}
                    autoComplete="username"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pl-10 pr-10"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Sign In Securely
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">Register here</Link>
            </p>
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            Your credentials are protected with 256-bit encryption
          </div>
        </div>
      </div>
    </div>
  )
}
