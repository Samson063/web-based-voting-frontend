import { useState, useEffect } from 'react'
import { getElections, getCandidates, castVote } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import Navbar from '../components/ui/Navbar'
import Alert from '../components/ui/Alert'
import Spinner from '../components/ui/Spinner'
import { Vote, ChevronDown, ChevronUp, CheckCircle, Clock, Users, Copy } from 'lucide-react'

export default function Elections() {
  const { user } = useAuth()
  const [elections, setElections]       = useState([])
  const [expanded, setExpanded]         = useState(null)
  const [candidates, setCandidates]     = useState({})
  const [selected, setSelected]         = useState({})
  const [receipt, setReceipt]           = useState('')
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [loading, setLoading]           = useState(true)
  const [voting, setVoting]             = useState(false)
  const [copied, setCopied]             = useState(false)

  useEffect(() => { fetchElections() }, [])

  const fetchElections = async () => {
    try {
      const res = await getElections()
      setElections(res.data)
    } catch { setError('Failed to load elections') }
    finally { setLoading(false) }
  }

  const toggleElection = async (id) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!candidates[id]) {
      const res = await getCandidates(id)
      setCandidates(prev => ({ ...prev, [id]: res.data }))
    }
  }

  // Group candidates by position
  const byPosition = (cands) => {
    return cands.reduce((acc, c) => {
      acc[c.position] = acc[c.position] || []
      acc[c.position].push(c)
      return acc
    }, {})
  }

  const handleVote = async (electionId) => {
    const votes = selected[electionId]
    if (!votes || Object.keys(votes).length === 0) {
      setError('Please select at least one candidate before submitting.'); return
    }
    setError(''); setSuccess(''); setVoting(true)
    try {
      // Cast votes one per position
      let lastReceipt = ''
      for (const candidateId of Object.values(votes)) {
        const res = await castVote(electionId, Number(candidateId))
        lastReceipt = res.data.vote_receipt
      }
      setReceipt(lastReceipt)
      setSuccess(' Your vote has been recorded! Save your receipt below.')
      // Refresh user data (has_voted = true)
      window.location.reload()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cast vote.')
    } finally { setVoting(false) }
  }

  const copyReceipt = () => {
    navigator.clipboard.writeText(receipt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
    </div>
  )


  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Elections</h1>
          <p className="text-slate-500 text-sm mt-1">Select an election below to view candidates and cast your vote.</p>
        </div>

        {/* Vote receipt banner */}
        {receipt && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-800">Vote Confirmed!</p>
                <p className="text-sm text-emerald-700 mt-1">Your vote receipt (save this to verify later):</p>
                <div className="flex items-center gap-2 mt-2 bg-white rounded-lg border border-emerald-200 px-3 py-2">
                  <code className="text-xs text-slate-700 break-all flex-1">{receipt}</code>
                  <button onClick={copyReceipt} className="shrink-0 text-emerald-600 hover:text-emerald-800">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {copied && <p className="text-xs text-emerald-600 mt-1">Copied!</p>}
              </div>
            </div>
          </div>
        )}

        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        {/* Already voted notice */}
        {user?.has_voted && (
          <div className="card mb-6 border-blue-100 bg-blue-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-blue-800 font-medium">You have already cast your vote in this election cycle. Thank you for participating!</p>
            </div>
          </div>
        )}

        {elections.length === 0 && (
          <div className="card text-center py-12">
            <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No elections available at this time.</p>
          </div>
        )}

        <div className="space-y-4">
          {elections.map(election => {
            const isOpen = expanded === election.id
            const cands  = candidates[election.id] || []
            const grouped = byPosition(cands)

            return (
              <div key={election.id} className="card p-0 overflow-hidden">
                {/* Election header */}
                <button
                  onClick={() => toggleElection(election.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                      <Vote className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{election.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{election.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={election.is_active ? 'badge-green' : 'badge-gray'}>
                      {election.is_active ? 'Active' : 'Closed'}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>

                {/* Expanded candidates */}
                {isOpen && (
                  <div className="border-t border-slate-100 p-5 space-y-6">
                    {cands.length === 0 && (
                      <div className="text-center py-6 text-slate-400">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No candidates registered yet.</p>
                      </div>
                    )}

                    {Object.entries(grouped).map(([position, posCands]) => (
                      <div key={position}>
                        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">{position}</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {posCands.map(cand => {
                            const isChosen = selected[election.id]?.[position] === String(cand.id)
                            return (
                              <label
                                key={cand.id}
                                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                  isChosen
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                                } ${(user?.has_voted || !election.is_active) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`${election.id}-${position}`}
                                  value={cand.id}
                                  disabled={user?.has_voted || !election.is_active}
                                  checked={isChosen}
                                  onChange={() => setSelected(prev => ({
                                    ...prev,
                                    [election.id]: { ...(prev[election.id] || {}), [position]: String(cand.id) }
                                  }))}
                                  className="mt-0.5 accent-primary-500"
                                />
                                <div>
                                  <p className="font-medium text-slate-800 text-sm">{cand.full_name}</p>
                                  {cand.department && <p className="text-xs text-slate-500">{cand.department}</p>}
                                  {cand.manifesto && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cand.manifesto}</p>}
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    {election.is_active && !user?.has_voted && cands.length > 0 && (
                      <button
                        onClick={() => handleVote(election.id)}
                        disabled={voting}
                        className="btn-primary flex items-center gap-2"
                      >
                        {voting ? <Spinner size="sm" /> : <Vote className="h-4 w-4" />}
                        Submit My Vote
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
