import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/ui/Navbar'
import { useAuth } from '../lib/AuthContext'
import {
  beginPasskeyRegistration, finishPasskeyRegistration,
  listPasskeys, deletePasskey,
} from '../lib/api'
import {
  isBiometricAvailable, createCredential, friendlyError, guessDeviceLabel,
} from '../lib/webauthn'
import {
  Fingerprint, ShieldCheck, Trash2, AlertCircle, CheckCircle, Smartphone,
} from 'lucide-react'

export default function Security() {
  const { user, loginUser } = useAuth()
  const [devices, setDevices]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [enrolling, setEnroll]  = useState(false)
  const [available, setAvail]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const load = useCallback(async () => {
    try {
      const res = await listPasskeys()
      setDevices(res.data || [])
    } catch {
      setError('Could not load your devices.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    isBiometricAvailable().then(setAvail)
    load()
  }, [load])

  const handleEnroll = async () => {
    setError(''); setSuccess(''); setEnroll(true)
    try {
      const { data: challenge } = await beginPasskeyRegistration()
      const credential = await createCredential(challenge.options)
      const res = await finishPasskeyRegistration({
        session_id:   challenge.session_id,
        device_label: guessDeviceLabel(),
        credential,
      })
      if (res.data?.token) loginUser(res.data.token, user)
      setSuccess('Biometric unlock is now enabled on this device.')
      load()
    } catch (err) {
      setError(err.response?.data?.error || friendlyError(err))
    } finally { setEnroll(false) }
  }

  const handleRemove = async (id) => {
    setError(''); setSuccess('')
    try {
      await deletePasskey(id)
      setDevices(d => d.filter(x => x.id !== id))
      setSuccess('Device removed.')
    } catch {
      setError('Could not remove that device.')
    }
  }

  const fmt = (iso) => new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>
            Sign-in security
          </h1>
        </div>
        <p className="text-slate-500 text-sm mb-8">
          Use your fingerprint or face instead of typing a password. Your scan stays
          on your device — this system only ever receives a public key.
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 mb-4 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-4 py-3 mb-4 text-sm">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Enroll */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Fingerprint className="h-5 w-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-800">Fingerprint or face unlock</h2>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                {available
                  ? 'Add this device so you can sign in with a single touch next time.'
                  : 'This browser or device has no biometric sensor available. Try Chrome or Safari on a phone or laptop with Touch ID, Face ID or Windows Hello.'}
              </p>
              <button
                onClick={handleEnroll}
                disabled={!available || enrolling}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {enrolling ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Waiting for your device…
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4" />
                    Set up on this device
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enrolled devices */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Your devices</h2>

          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : devices.length === 0 ? (
            <p className="text-sm text-slate-500">
              No devices yet. Once you set one up it will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {devices.map(d => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <Smartphone className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{d.device_label}</p>
                    <p className="text-xs text-slate-400">
                      Added {fmt(d.created_at)}
                      {d.last_used_at ? ` · last used ${fmt(d.last_used_at)}` : ' · never used'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(d.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    aria-label={`Remove ${d.device_label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-6">
          Your password still works. If you lose this device, sign in with your
          matric number and password, then remove the old device from this page.
        </p>
      </div>
    </div>
  )
}
