import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../lib/api'
import { Vote, Eye, EyeOff, ShieldCheck, Lock, AlertCircle, CheckCircle, User, Mail, BookOpen } from 'lucide-react'

const DEPARTMENTS = [
  'Computer Science','Electrical Engineering','Civil Engineering',
  'Mechanical Engineering','Business Administration','Accounting',
  'Mass Communication','Law','Medicine','Nursing','Economics',
  'Political Science','Sociology','Education','Other',
]

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6        },
    { label: 'Contains a number',     pass: /\d/.test(password)          },
    { label: 'Contains a letter',     pass: /[a-zA-Z]/.test(password)    },
  ]
  const score = checks.filter(c => c.pass).length
  const bar   = ['bg-red-400', 'bg-amber-400', 'bg-emerald-500'][score - 1] || 'bg-slate-200'
  const label = ['', 'Weak', 'Fair', 'Strong'][score]

  if (!password) return null
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${bar}`} style={{ width: `${(score/3)*100}%` }} />
        </div>
        <span className={`text-xs font-medium ${score===3?'text-emerald-600':score===2?'text-amber-600':'text-red-500'}`}>{label}</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map(c => (
          <span key={c.label} className={`flex items-center gap-1 text-xs ${c.pass ? 'text-emerald-600' : 'text-slate-400'}`}>
            <CheckCircle className={`h-3 w-3 ${c.pass ? 'opacity-100' : 'opacity-30'}`} /> {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Register() {
  const [form, setForm]       = useState({ matric_number:'', full_name:'', email:'', department:'', password:'', confirm:'' })
  const [showPw, setShowPw]   = useState(false)
  const [showCf, setShowCf]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()
  const set = f => e => setForm({ ...form, [f]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match');             return }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register({ matric_number: form.matric_number, full_name: form.full_name, email: form.email, department: form.department, password: form.password })
      setSuccess('Account created successfully! Redirecting to login…')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full animate-float" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full animate-float-slow" />
        <svg className="absolute inset-0 w-full h-full opacity-5"><defs><pattern id="g2" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#g2)"/></svg>

        <div className="relative text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
            <Vote className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>Join UniVote</h1>
          <p className="text-primary-200 mb-10">Create your secure voter account</p>

          <div className="space-y-3 text-left max-w-xs">
            {[
              'Register once with your matric number',
              'Admin verifies your eligibility',
              'Vote securely from any device',
              'Get a receipt to verify your vote',
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span className="w-6 h-6 bg-primary-500 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0">{i+1}</span>
                <p className="text-primary-100 text-sm">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-500 rounded-2xl mb-2 shadow-lg">
              <Vote className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>UniVote</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Create Account</h2>
            <p className="text-slate-500 text-sm mb-6">Fill in your student details to register</p>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 mb-4 text-sm animate-fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-4 py-3 mb-4 text-sm animate-fade-in">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Matric Number *</label>
                  <div className="relative">
                    <input className="input pl-9" placeholder="CSC/2021/001" value={form.matric_number} onChange={set('matric_number')} required />
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="label">Full Name *</label>
                  <div className="relative">
                    <input className="input pl-9" placeholder="As on student ID" value={form.full_name} onChange={set('full_name')} required />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label">Email Address *</label>
                <div className="relative">
                  <input type="email" className="input pl-9" placeholder="you@student.edu.ng" value={form.email} onChange={set('email')} required />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="label">Department *</label>
                <select className="input" value={form.department} onChange={set('department')} required>
                  <option value="">Select your department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <input type={showPw?'text':'password'} className="input pl-9 pr-9" placeholder="Min. 6 chars" value={form.password} onChange={set('password')} required />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <div className="relative">
                    <input type={showCf?'text':'password'} className={`input pl-9 pr-9 ${form.confirm && form.password !== form.confirm ? 'border-red-300 focus:ring-red-400' : form.confirm && form.password === form.confirm ? 'border-emerald-300 focus:ring-emerald-400' : ''}`} placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <button type="button" onClick={()=>setShowCf(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showCf ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                  {form.confirm && form.password !== form.confirm && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                  {form.confirm && form.password === form.confirm && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle className="h-3 w-3"/>Passwords match</p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
                {loading ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Creating account…</>
                ) : (
                  <><ShieldCheck className="h-4 w-4" />Create Secure Account</>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in here</Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            Your data is protected with bcrypt hashing & TLS encryption
          </div>
        </div>
      </div>
    </div>
  )
}
