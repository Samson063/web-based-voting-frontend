import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Navbar from '../components/ui/Navbar'
import useInView from '../lib/useInView'
import {
  Vote, ShieldCheck, BarChart2, Lock, Zap, Users,
  CheckCircle, ArrowRight, Globe, Clock, Award,
  ChevronRight, TrendingUp, Eye, RefreshCw
} from 'lucide-react'
import { getElections } from '../lib/api'
import axios from 'axios'

const BACKEND = 'https://web-based-voting-backend.onrender.com'

/* ── animated counter ────────────────────────────────── */
function useCounter(target, duration = 1500, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let current = 0
    const step = Math.max(1, Math.ceil(target / (duration / 16)))
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setCount(current)
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, start])
  return count
}

/* ── stat card ───────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, colorClass, delay, started, live }) {
  const count = useCounter(value, 1500, started)
  return (
    <div
      className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all duration-300 relative overflow-hidden shadow-sm"
      style={{ animation: 'fadeInUp 0.6s ease both', animationDelay: delay }}
    >
      {live && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          Live
        </span>
      )}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorClass}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <p className="text-4xl font-bold text-slate-800 mb-1 tabular-nums">{count.toLocaleString()}</p>
      <p className="text-slate-500 text-sm font-medium text-center">{label}</p>
    </div>
  )
}

/* ── orbit icon ──────────────────────────────────────── */
function OrbitIcon({ icon: Icon, bg, angle, radius = 140 }) {
  const rad = (angle * Math.PI) / 180
  const x = Math.cos(rad) * radius
  const y = Math.sin(rad) * radius
  return (
    <div
      className={`absolute w-11 h-11 ${bg} rounded-xl flex items-center justify-center shadow-lg`}
      style={{ left: `calc(50% + ${x}px - 22px)`, top: `calc(50% + ${y}px - 22px)` }}
    >
      <Icon className="h-5 w-5 text-white" />
    </div>
  )
}

const features = [
  { icon: ShieldCheck, title: 'Secure Authentication',  desc: 'JWT-based login with role-based access ensures only eligible students can vote.',     color: ['bg-primary-100', 'bg-primary-500', 'text-primary-600'] },
  { icon: Lock,        title: 'One Student, One Vote',  desc: 'Database-level transaction locks enforce the single-vote rule with zero exceptions.',   color: ['bg-emerald-100', 'bg-emerald-500', 'text-emerald-600'] },
  { icon: BarChart2,   title: 'Real-Time Results',      desc: 'Live vote tallying with interactive charts — results are transparent and instant.',     color: ['bg-amber-100',   'bg-amber-500',   'text-amber-600'  ] },
  { icon: Zap,         title: 'High Performance',       desc: 'Go/Fiber backend handles hundreds of concurrent voters simultaneously.',                 color: ['bg-purple-100',  'bg-purple-500',  'text-purple-600' ] },
  { icon: Vote,        title: 'Full Audit Trail',       desc: 'Every action is logged with timestamps and IP addresses for complete accountability.',   color: ['bg-cyan-100',    'bg-cyan-500',    'text-cyan-600'   ] },
  { icon: Users,       title: 'Vote Verification',      desc: 'Each voter receives a unique receipt hash to verify their vote was correctly counted.',  color: ['bg-pink-100',    'bg-pink-500',    'text-pink-600'   ] },
]

const steps = [
  { num: '01', title: 'Register',       desc: 'Create your voter account using your matric number, department and a secure password.', icon: Users       },
  { num: '02', title: 'Get Verified',   desc: 'The election admin verifies your eligibility before the voting period opens.',           icon: ShieldCheck },
  { num: '03', title: 'Cast Your Vote', desc: 'Log in, browse candidates by position, and submit your encrypted ballot securely.',      icon: Vote        },
  { num: '04', title: 'Get Receipt',    desc: 'Receive a unique receipt hash you can use to confirm your vote was counted.',            icon: CheckCircle },
]

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats]             = useState({ voters: 0, elections: 0, candidates: 0, votes: 0 })
  const [elections, setElections]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const [statsRef,     statsVisible]     = useInView()
  const [electionsRef, electionsVisible] = useInView()
  const [stepsRef,     stepsVisible]     = useInView()
  const [featuresRef,  featuresVisible]  = useInView()
  const [ctaRef,       ctaVisible]       = useInView()

  // Fetch live stats from deployed backend
  const fetchStats = useCallback(async () => {
    try {
      const { data: s } = await axios.get(`${BACKEND}/api/stats`)
      setStats({
        voters:     s.total_voters     || 0,
        elections:  s.total_elections  || 0,
        candidates: s.total_candidates || 0,
        votes:      s.total_voted      || 0,
      })
      setLastUpdated(new Date())
    } catch { /* silent */ }
  }, [])

  const fetchElections = useCallback(async () => {
    try {
      const { data: elecs } = await getElections()
      setElections((elecs || []).slice(0, 3))
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchElections()
    // Poll stats every 10 seconds for real-time updates
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [fetchStats, fetchElections])

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />

      {/* ══ HERO ════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 overflow-hidden min-h-[92vh] flex items-center">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full animate-float" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full animate-float-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-indigo-500/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 lg:py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="animate-fade-in-down inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium text-white mb-6 border border-white/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                System Active — Voting Open
              </div>
              <h1 className="animate-fade-in-up text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
                Your Vote.<br />Your Voice.<br />
                <span className="gradient-text">Secured.</span>
              </h1>
              <p className="animate-fade-in-up delay-200 text-primary-100 text-lg max-w-lg mb-8 leading-relaxed">
                UniVote is a secure, transparent, web-based e-voting platform for university student elections — with real-time results and a full audit trail.
              </p>
              <div className="animate-fade-in-up delay-400 flex items-center gap-4 flex-wrap">
                {user ? (
                  <Link to="/elections" className="group flex items-center gap-2 bg-white text-primary-600 font-bold px-6 py-3.5 rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Go to Elections <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="group flex items-center gap-2 bg-white text-primary-600 font-bold px-6 py-3.5 rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                      Register to Vote <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/login" className="border-2 border-white/40 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/10 transition-all hover:-translate-y-0.5">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
              <div className="animate-fade-in-up delay-600 flex items-center gap-6 mt-8 flex-wrap">
                {[
                  { icon: ShieldCheck, text: 'End-to-end encrypted' },
                  { icon: Eye,         text: 'Transparent results'  },
                  { icon: TrendingUp,  text: 'Real-time tallying'   },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-primary-200 text-sm">
                    <Icon className="h-4 w-4 text-emerald-400" /> {text}
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center animate-fade-in-right delay-300">
              <div className="relative w-80 h-80">
                <div className="absolute inset-[-30px] rounded-full border border-white/10 orbit-ring" />
                <div className="absolute inset-[-60px] rounded-full border border-white/5 orbit-ring-reverse" />
                <div className="absolute inset-0 bg-white/10 rounded-full border border-white/20 flex items-center justify-center animate-float">
                  <div className="bg-white/20 rounded-full p-8 backdrop-blur">
                    <Vote className="h-20 w-20 text-white" />
                  </div>
                </div>
                <OrbitIcon icon={ShieldCheck} bg="bg-emerald-500" angle={-90}  radius={145} />
                <OrbitIcon icon={Lock}        bg="bg-amber-500"   angle={-18}  radius={145} />
                <OrbitIcon icon={BarChart2}   bg="bg-purple-500"  angle={54}   radius={145} />
                <OrbitIcon icon={Users}       bg="bg-pink-500"    angle={126}  radius={145} />
                <OrbitIcon icon={CheckCircle} bg="bg-cyan-500"    angle={198}  radius={145} />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 70L1440 70L1440 35C1200 70 960 0 720 35C480 70 240 0 0 35L0 70Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* ══ LIVE STATS ══════════════════════════════════ */}
      <section className="bg-white pt-12 pb-20" ref={statsRef}>
        <div className="max-w-5xl mx-auto px-4">
          <div className={`flex items-center justify-center gap-3 mb-6 transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-slate-600 text-sm font-semibold uppercase tracking-widest">Live System Statistics</p>
            {lastUpdated && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Registered Voters" value={stats.voters}     icon={Users}       colorClass="bg-emerald-500" delay="0.0s" started={statsVisible} live />
            <StatCard label="Active Elections"   value={stats.elections}  icon={Vote}        colorClass="bg-amber-500"   delay="0.1s" started={statsVisible} live />
            <StatCard label="Candidates"         value={stats.candidates} icon={Award}       colorClass="bg-purple-500"  delay="0.2s" started={statsVisible} live />
            <StatCard label="Votes Cast"         value={stats.votes}      icon={CheckCircle} colorClass="bg-cyan-500"    delay="0.3s" started={statsVisible} live />
          </div>
          <p className={`text-center text-slate-400 text-xs mt-4 transition-all duration-700 delay-500 ${statsVisible ? 'opacity-100' : 'opacity-0'}`}>
            ↻ Statistics refresh automatically every 10 seconds
          </p>
        </div>
      </section>

      {/* ══ ACTIVE ELECTIONS ════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 py-20" ref={electionsRef}>
        <div className={`flex items-center justify-between mb-8 transition-all duration-700 ${electionsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div>
            <p className="text-primary-500 text-sm font-semibold uppercase tracking-widest mb-1">Currently Running</p>
            <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Active Elections</h2>
          </div>
          <Link to="/elections" className="group flex items-center gap-1 text-primary-600 font-medium text-sm hover:underline">
            View all <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="card">
                <div className="shimmer h-4 rounded w-3/4 mb-3" />
                <div className="shimmer h-3 rounded w-full mb-2" />
                <div className="shimmer h-3 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : elections.length === 0 ? (
          <div className="card text-center py-12">
            <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No elections scheduled yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((e, i) => (
              <div key={e.id} className={`card card-glow hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group ${electionsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${['bg-primary-100 group-hover:bg-primary-500','bg-emerald-100 group-hover:bg-emerald-500','bg-amber-100 group-hover:bg-amber-500'][i%3]}`}>
                  <Vote className={`h-5 w-5 transition-colors duration-300 ${['text-primary-600 group-hover:text-white','text-emerald-600 group-hover:text-white','text-amber-600 group-hover:text-white'][i%3]}`} />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-800 leading-snug">{e.title}</h3>
                  <span className={`shrink-0 ${e.is_active ? 'badge-green' : 'badge-gray'}`}>{e.is_active ? 'Active' : 'Closed'}</span>
                </div>
                {e.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{e.description}</p>}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Ends {new Date(e.end_time).toLocaleDateString()}</span>
                  <Link to={user ? '/elections' : '/login'} className="group/link flex items-center gap-1 text-primary-600 font-medium">
                    {e.is_active ? 'Vote Now' : 'View'} <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════ */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-24" ref={stepsRef}>
        <div className="max-w-5xl mx-auto px-4">
          <div className={`text-center mb-14 transition-all duration-700 ${stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="text-primary-400 text-sm font-semibold uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>How It Works</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm">From registration to verified results in four simple steps</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className={`text-center group transition-all duration-700 ${stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${i*0.15}s` }}>
                <div className="relative mx-auto w-16 h-16 mb-5">
                  <div className="w-16 h-16 bg-primary-500/20 border-2 border-primary-500 rounded-2xl flex items-center justify-center group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300">
                    <step.icon className="h-7 w-7 text-primary-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full text-white text-xs font-bold flex items-center justify-center">{i+1}</span>
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className={`text-center mt-14 transition-all duration-700 delay-700 ${stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link to="/register" className="group inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:-translate-y-0.5">
              Get Started Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 py-24" ref={featuresRef}>
        <div className={`text-center mb-14 transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-primary-500 text-sm font-semibold uppercase tracking-widest mb-2">Why UniVote</p>
          <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Built for Trust & Security</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">Every feature eliminates a weakness of manual paper voting</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className={`card card-glow group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${i*0.1}s` }}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${f.color[0]} group-hover:scale-110`}>
                <f.icon className={`h-5 w-5 ${f.color[2]}`} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-primary-600 transition-colors">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TRANSPARENCY BANNER ═════════════════════════ */}
      <section className="bg-gradient-to-br from-emerald-500 to-teal-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full animate-float" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full animate-float-slow" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="animate-float inline-block mb-6">
            <ShieldCheck className="h-14 w-14 text-white/90 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>100% Transparent Election Results</h2>
          <p className="text-emerald-100 max-w-xl mx-auto mb-8 leading-relaxed">
            Results are computed automatically in real time. Every vote is logged with a unique receipt hash. Anyone can verify their vote was counted — without revealing who they voted for.
          </p>
          <Link to="/results" className="group inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-all shadow-lg hover:-translate-y-0.5">
            <BarChart2 className="h-4 w-4" /> View Live Results
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ══ TECH STACK ══════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-primary-500 text-sm font-semibold uppercase tracking-widest mb-2">Technology</p>
          <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Powered by Modern Tech</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'React 18',    role: 'Frontend UI', color: 'bg-cyan-50   border-cyan-200   text-cyan-700'   },
            { name: 'Tailwind CSS',role: 'Styling',     color: 'bg-sky-50    border-sky-200    text-sky-700'    },
            { name: 'Go + Fiber',  role: 'Backend API', color: 'bg-blue-50   border-blue-200   text-blue-700'   },
            { name: 'PostgreSQL',  role: 'Database',    color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
          ].map(t => (
            <div key={t.name} className={`border-2 rounded-xl p-5 text-center hover:scale-105 hover:shadow-md transition-all duration-300 ${t.color}`}>
              <p className="font-bold">{t.name}</p>
              <p className="text-xs mt-1 opacity-60">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════ */}
      {!user && (
        <section className="bg-gradient-to-br from-primary-600 to-indigo-700 py-24 relative overflow-hidden" ref={ctaRef}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full animate-float" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/5 rounded-full animate-float-slow" />
          </div>
          <div className={`relative max-w-3xl mx-auto px-4 text-center transition-all duration-700 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="animate-float inline-block mb-4">
              <Globe className="h-14 w-14 text-white/60 mx-auto" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Ready to Participate?</h2>
            <p className="text-primary-100 mb-10 max-w-md mx-auto leading-relaxed">
              Join students already registered on UniVote. Your voice matters — make it count.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/register" className="group flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:-translate-y-1">
                Create Account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all hover:-translate-y-1">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ FOOTER ══════════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-white font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
              <Vote className="h-5 w-5 text-primary-400" /> UniVote
            </div>
            <div className="flex items-center gap-6 text-sm">
              {[['Elections','/elections'],['Results','/results'],['Verify Vote','/verify']].map(([label,to]) => (
                <Link key={to} to={to} className="hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs text-slate-500">Final Year Project</p>
              <p className="text-xs text-slate-600 mt-0.5">Adebiyi · Afolabi · Ofodi · {new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-600">Design & Implementation of a Web-Based E-Voting System with Authentication and Transparency</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
