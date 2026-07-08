import { useState } from 'react'
import Navbar from '../components/ui/Navbar'
import Alert from '../components/ui/Alert'
import Spinner from '../components/ui/Spinner'
import { verifyReceipt } from '../lib/api'
import { ShieldCheck, Search } from 'lucide-react'

export default function Verify() {
  const [receipt, setReceipt] = useState('')
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!receipt.trim()) return
    setError(''); setResult(null); setLoading(true)
    try {
      const res = await verifyReceipt(receipt.trim())
      setResult(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Receipt not found. This vote may not have been recorded.')
      } else {
        setError('Verification failed. Please try again.')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-2xl mb-4">
            <ShieldCheck className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Verify Your Vote</h1>
          <p className="text-slate-500 text-sm mt-2">
            Enter your vote receipt code to confirm it was recorded in the system. This ensures full transparency.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="label">Vote Receipt Code</label>
              <input
                className="input font-mono text-sm"
                placeholder="Paste your 64-character receipt here…"
                value={receipt}
                onChange={e => setReceipt(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading || !receipt.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Spinner size="sm" /> : <Search className="h-4 w-4" />}
              Verify Receipt
            </button>
          </form>

          <div className="mt-4 space-y-3">
            <Alert type="error" message={error} />

            {result?.valid && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-800">Vote Confirmed ✓</p>
                    <p className="text-sm text-emerald-700 mt-1">{result.message}</p>
                    <p className="text-xs text-emerald-600 mt-2">
                      Cast at: {new Date(result.cast_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Your receipt proves your vote was counted without revealing who you voted for — ensuring both transparency and ballot secrecy.
        </p>
      </div>
    </div>
  )
}
