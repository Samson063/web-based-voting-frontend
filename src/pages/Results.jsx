import { useState, useEffect } from 'react'
import { getElections, getResults } from '../lib/api'
import Navbar from '../components/ui/Navbar'
import Spinner from '../components/ui/Spinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Trophy, BarChart2 } from 'lucide-react'

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function Results() {
  const [elections, setElections] = useState([])
  const [selected, setSelected]   = useState(null)
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [fetching, setFetching]   = useState(false)

  useEffect(() => {
    getElections().then(r => { setElections(r.data); setLoading(false) })
  }, [])

  const load = async (id) => {
    setSelected(id); setFetching(true)
    const r = await getResults(id)
    setResult(r.data)
    setFetching(false)
  }

  // Group candidates by position, sorted by votes desc
  const byPosition = (cands) =>
    cands.reduce((acc, c) => {
      acc[c.position] = acc[c.position] || []
      acc[c.position].push(c)
      return acc
    }, {})

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <BarChart2 className="h-6 w-6 text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Election Results</h1>
            <p className="text-slate-500 text-sm">Live results are updated in real-time.</p>
          </div>
        </div>

        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
          <>
            {/* Election selector */}
            <div className="flex gap-2 flex-wrap mb-6">
              {elections.map(e => (
                <button
                  key={e.id}
                  onClick={() => load(e.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selected === e.id
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-primary-300'
                  }`}
                >
                  {e.title}
                </button>
              ))}
            </div>

            {fetching && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

            {result && !fetching && (
              <div className="space-y-6">
                {/* Summary card */}
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-slate-800 text-lg">{result.election.title}</h2>
                      <p className="text-slate-500 text-sm">{result.election.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary-600">{result.total_votes}</p>
                      <p className="text-xs text-slate-500 font-medium">Total Votes</p>
                    </div>
                  </div>
                </div>

                {/* Results by position */}
                {Object.entries(byPosition(result.candidates)).map(([position, cands]) => {
                  const sorted  = [...cands].sort((a, b) => b.vote_count - a.vote_count)
                  const winner  = sorted[0]
                  const posTotal = sorted.reduce((s, c) => s + c.vote_count, 0)
                  const chartData = sorted.map(c => ({ name: c.full_name.split(' ')[0], votes: c.vote_count }))

                  return (
                    <div key={position} className="card">
                      <div className="flex items-center gap-2 mb-4">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <h3 className="font-semibold text-slate-700">{position}</h3>
                      </div>

                      {/* Bar chart */}
                      <div className="h-44 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Candidate rows */}
                      <div className="space-y-3">
                        {sorted.map((cand, i) => {
                          const pct = posTotal > 0 ? ((cand.vote_count / posTotal) * 100).toFixed(1) : 0
                          const isWinner = i === 0 && cand.vote_count > 0
                          return (
                            <div key={cand.id} className={`flex items-center gap-3 p-3 rounded-xl ${isWinner ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isWinner ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm text-slate-800 truncate">{cand.full_name}</p>
                                  {isWinner && <span className="badge-green shrink-0">Leading</span>}
                                </div>
                                <div className="mt-1.5 bg-slate-200 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                                  />
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-sm text-slate-800">{cand.vote_count}</p>
                                <p className="text-xs text-slate-400">{pct}%</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!selected && (
              <div className="card text-center py-12">
                <BarChart2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Select an election above to view its results.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
