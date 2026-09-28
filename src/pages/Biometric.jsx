import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import {
  listPasskeys,
  beginBiometricVerify, finishBiometricVerify,
  beginPasskeyRegistration, finishPasskeyRegistration,
} from '../lib/api'
import {
  isBiometricAvailable, getCredential, createCredential,
  friendlyError, guessDeviceLabel,
} from '../lib/webauthn'
import { Fingerprint, ShieldCheck, AlertCircle, LogOut } from 'lucide-react'

// Mandatory second step after password login.
//  - Device already enrolled  -> scan to verify this session
//  - No device enrolled yet   -> scan to enrol, which also verifies the session
export default function Biometric() {
  const { user, loginUser, logoutUser, biometricVerified } = useAuth()
  const navigate = useNavigate()

  const [state, setState]   = useState('loading') // loading | verify | enroll | unsupported
  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (biometricVerified || user?.role === 'admin') {
      navigate(user?.role === 'admin' ? '/admin' : '/elections', { replace: true })
      return
    }
    ;(async () => {
      if (!(await isBiometricAvailable())) { setState('unsupported'); return }
      try {
        const res = await listPasskeys()
        setState((res.data || []).length > 0 ? 'verify' : 'enroll')
      } catch { setState('verify') }
    })()
  }, [biometricVerified, user, navigate])

  const run = async (fn) => {
    setError(''); setBusy(true)
    try { await fn() }
    catch (err) { setError(err.response?.data?.error || friendlyError(err)) }
    finally { setBusy(false) }
  }

  const verify = () => run(async () => {
    const { data: challenge } = await beginBiometricVerify()
    const credential = await getCredential(challenge.options)
    const res = await finishBiometricVerify({ session_id: challenge.session_id, credential })
    loginUser(res.data.token, res.data.user)
    navigate('/elections', { replace: true })
  })

  const enroll = () => run(async () => {
    const { data: challenge } = await beginPasskeyRegistration()
    const credential = await createCredential(challenge.options)
    const res = await finishPasskeyRegistration({
      session_id: challenge.session_id,
      device_label: guessDeviceLabel(),
      credential,
    })
    loginUser(res.data.token, user)
    navigate('/elections', { replace: true })
  })

  const copy = {
    verify: {
      title: 'Confirm it\u2019s you',
      body: 'Use your fingerprint or face to continue. This protects your vote.',
      cta: 'Verify with fingerprint or face',
      action: verify,
    },
    enroll: {
      title: 'Set up fingerprint or face',
      body: 'Voting requires biometric verification. Set it up once on this device \u2014 your scan never leaves your phone or laptop.',
      cta: 'Set up on this device',
      action: enroll,
    },
  }[state]

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
          {state === 'unsupported'
            ? <ShieldCheck className="h-7 w-7 text-slate-400" />
            : <Fingerprint className="h-7 w-7 text-primary-600" />}
        </div>

        {state === 'loading' && <p className="text-sm text-slate-400">Checking your device…</p>}

        {state === 'unsupported' && (
          <>
            <h1 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              Biometric unlock not available
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Voting requires a fingerprint or face scan, and this browser or device has no
              sensor available. Open the site on a phone or laptop with Face ID, Touch ID,
              Windows Hello or an Android fingerprint sensor.
            </p>
          </>
        )}

        {copy && (
          <>
            <h1 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              {copy.title}
            </h1>
            <p className="text-sm text-slate-500 mb-6">{copy.body}</p>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 mb-4 text-sm text-left">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button onClick={copy.action} disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {busy ? 'Waiting for your device…' : (<><Fingerprint className="h-4 w-4" />{copy.cta}</>)}
            </button>
          </>
        )}

        <button
          onClick={() => { logoutUser(); navigate('/login') }}
          className="mt-5 text-xs text-slate-400 hover:text-slate-600 inline-flex items-center gap-1"
        >
          <LogOut className="h-3 w-3" /> Sign out
        </button>
      </div>
    </div>
  )
}
