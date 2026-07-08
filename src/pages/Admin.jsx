import { useState, useEffect } from 'react'
import {
  getStats, getAllUsers, getAuditLogs, getElections,
  createElection, toggleElection, addCandidate, setEligibility
} from '../lib/api'
import Navbar from '../components/ui/Navbar'
import Spinner from '../components/ui/Spinner'
import Alert from '../components/ui/Alert'
import {
  LayoutDashboard, Users, Vote, ScrollText, Plus, ToggleLeft,
  ToggleRight, UserCheck, UserX, ChevronDown, ChevronUp
} from 'lucide-react'

const TABS = [
  { id: 'overview',   label: 'Overview',     icon: LayoutDashboard },
  { id: 'elections',  label: 'Elections',    icon: Vote },
  { id: 'voters',     label: 'Voters',       icon: Users },
  { id: 'audit',      label: 'Audit Log',    icon: ScrollText },
]

export default function Admin() {
  const [tab, setTab]             = useState('overview')
  const [stats, setStats]         = useState(null)
  const [users, setUsers]         = useState([])
  const [elections, setElections] = useState([])
  const [logs, setLogs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [msg, setMsg]             = useState({ type: '', text: '' })

  // Election form
  const [eForm, setEForm] = useState({ title: '', description: '', start_time: '', end_time: '', is_active: false })
  const [showEForm, setShowEForm] = useState(false)

  // Candidate form
  const [cForm, setCForm] = useState({ election_id: '', full_name: '', position: '', department: '', manifesto: '' })
  const [showCForm, setShowCForm] = useState(false)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, u, e, l] = await Promise.all([getStats(), getAllUsers(), getElections(), getAuditLogs()])
      setStats(s.data); setUsers(u.data); setElections(e.data); setLogs(l.data)
    } catch { setMsg({ type: 'error', text: 'Failed to load admin data.' }) }
    finally { setLoading(false) }
  }

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type:'', text:'' }), 3500) }

  const handleCreateElection = async (e) => {
    e.preventDefault()
    try {
      await createElection(eForm)
      flash('success', 'Election created successfully.')
      setShowEForm(false)
      setEForm({ title: '', description: '', start_time: '', end_time: '', is_active: false })
      loadAll()
    } catch (err) { flash('error', err.response?.data?.error || 'Failed to create election.') }
  }

  const handleToggle = async (id) => {
    await toggleElection(id)
    loadAll()
  }

  const handleAddCandidate = async (e) => {
    e.preventDefault()
    try {
      await addCandidate({ ...cForm, election_id: Number(cForm.election_id) })
      flash('success', 'Candidate added successfully.')
      setShowCForm(false)
      setCForm({ election_id: '', full_name: '', position: '', department: '', manifesto: '' })
      loadAll()
    } catch (err) { flash('error', err.response?.data?.error || 'Failed to add candidate.') }
  }

  const handleEligibility = async (uid, current) => {
    await setEligibility(uid, !current)
    loadAll()
  }

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage elections, voters, and review audit logs.</p>
        </div>

        {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text} /></div>}

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1 mb-6 w-fit shadow-sm flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview ───────────────────────── */}
        {tab === 'overview' && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Registered Voters', value: stats.total_voters,     color: 'text-primary-600' },
                { label: 'Votes Cast',         value: stats.total_voted,      color: 'text-emerald-600' },
                { label: 'Elections',          value: stats.total_elections,  color: 'text-amber-600'   },
                { label: 'Candidates',         value: stats.total_candidates, color: 'text-purple-600'  },
              ].map(s => (
                <div key={s.label} className="card text-center">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-700">Voter Turnout</p>
                <p className="text-2xl font-bold text-primary-600">{stats.turnout_percent}%</p>
              </div>
              <div className="bg-slate-100 rounded-full h-3">
                <div
                  className="bg-primary-500 h-3 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(stats.turnout_percent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{stats.total_voted} of {stats.total_voters} eligible voters have voted</p>
            </div>
          </div>
        )}

        {/* ── Elections ──────────────────────── */}
        {tab === 'elections' && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setShowEForm(v => !v)} className="btn-primary flex items-center gap-2">
                <Plus className="h-4 w-4" /> New Election
              </button>
              <button onClick={() => setShowCForm(v => !v)} className="btn-secondary flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Candidate
              </button>
            </div>

            {/* Create Election form */}
            {showEForm && (
              <div className="card border-primary-100 bg-primary-50">
                <h3 className="font-semibold text-slate-800 mb-4">Create New Election</h3>
                <form onSubmit={handleCreateElection} className="space-y-3">
                  <div>
                    <label className="label">Election Title *</label>
                    <input className="input" placeholder="e.g. SUG Elections 2025/2026" required value={eForm.title} onChange={e => setEForm({...eForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <input className="input" placeholder="Brief description" value={eForm.description} onChange={e => setEForm({...eForm, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Start Time *</label>
                      <input type="datetime-local" className="input" required value={eForm.start_time} onChange={e => setEForm({...eForm, start_time: e.target.value})} />
                    </div>
                    <div>
                      <label className="label">End Time *</label>
                      <input type="datetime-local" className="input" required value={eForm.end_time} onChange={e => setEForm({...eForm, end_time: e.target.value})} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-primary-500" checked={eForm.is_active} onChange={e => setEForm({...eForm, is_active: e.target.checked})} />
                    <span className="text-sm text-slate-700">Activate immediately</span>
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary">Create Election</button>
                    <button type="button" onClick={() => setShowEForm(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Candidate form */}
            {showCForm && (
              <div className="card border-emerald-100 bg-emerald-50">
                <h3 className="font-semibold text-slate-800 mb-4">Add Candidate</h3>
                <form onSubmit={handleAddCandidate} className="space-y-3">
                  <div>
                    <label className="label">Election *</label>
                    <select className="input" required value={cForm.election_id} onChange={e => setCForm({...cForm, election_id: e.target.value})}>
                      <option value="">Select election</option>
                      {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Full Name *</label>
                      <input className="input" placeholder="Candidate's full name" required value={cForm.full_name} onChange={e => setCForm({...cForm, full_name: e.target.value})} />
                    </div>
                    <div>
                      <label className="label">Position *</label>
                      <input className="input" placeholder="e.g. President" required value={cForm.position} onChange={e => setCForm({...cForm, position: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Department</label>
                    <input className="input" placeholder="Candidate's department" value={cForm.department} onChange={e => setCForm({...cForm, department: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Manifesto</label>
                    <textarea className="input" rows={3} placeholder="Brief manifesto or bio…" value={cForm.manifesto} onChange={e => setCForm({...cForm, manifesto: e.target.value})} />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-green">Add Candidate</button>
                    <button type="button" onClick={() => setShowCForm(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Elections table */}
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Title', 'Start', 'End', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {elections.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{e.title}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(e.start_time).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(e.end_time).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={e.is_active ? 'badge-green' : 'badge-gray'}>
                          {e.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(e.id)} className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${e.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                          {e.is_active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                          {e.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {elections.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">No elections created yet.</p>}
            </div>
          </div>
        )}

        {/* ── Voters ─────────────────────────── */}
        {tab === 'voters' && (
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-sm font-semibold text-slate-700">{users.length} registered voters</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Matric No.', 'Name', 'Department', 'Voted', 'Eligible', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{u.matric_number}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{u.full_name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{u.department}</td>
                      <td className="px-4 py-3">
                        <span className={u.has_voted ? 'badge-green' : 'badge-gray'}>{u.has_voted ? 'Yes' : 'No'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={u.is_eligible ? 'badge-green' : 'badge-red'}>{u.is_eligible ? 'Yes' : 'No'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleEligibility(u.id, u.is_eligible)}
                            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${u.is_eligible ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                          >
                            {u.is_eligible ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                            {u.is_eligible ? 'Revoke' : 'Grant'}
                          </button>
                        )}
                        {u.role === 'admin' && <span className="badge-blue">Admin</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Audit Log ──────────────────────── */}
        {tab === 'audit' && (
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">System Audit Trail (last 200 entries)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Time', 'Matric No.', 'Action', 'Details', 'IP Address'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-xs text-slate-400 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{l.matric_number}</td>
                      <td className="px-4 py-2.5">
                        <span className="badge-blue">{l.action}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500 max-w-xs truncate">{l.details}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{l.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">No audit entries yet.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
