import axios from 'axios'

// ── Production backend URL ────────────────────────────────
// All API calls go to the deployed Render backend
const BASE_URL = import.meta.env.VITE_API_URL || 'https://web-based-voting-backend.onrender.com'

const api = axios.create({ baseURL: `${BASE_URL}/api` })

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If 401 comes back, clear storage and go to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // A failed login/register attempt, or a failed biometric attempt, legitimately
    // returns 401/400. Let the page show the error instead of bouncing to /login
    // and wiping the form before the catch block ever runs.
    const isAuthAttempt = /\/auth\/(login|register|passkey)/.test(err.config?.url || '')

    if (err.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    if (err.response?.status === 403 && err.response?.data?.code === 'biometric_required') {
      if (window.location.pathname !== '/biometric') window.location.href = '/biometric'
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data)
export const login    = (matric_number, password) =>
  api.post('/auth/login', { matric_number, password })
export const getMe    = () => api.get('/voter/me')

// ── Biometric unlock (fingerprint / Face ID) ──────────────
// Enrollment (needs an active session)
export const beginPasskeyRegistration  = ()     => api.post('/voter/passkey/register/begin')
export const finishPasskeyRegistration = (body) => api.post('/voter/passkey/register/finish', body)
export const beginBiometricVerify  = ()     => api.post('/voter/passkey/verify/begin')
export const finishBiometricVerify = (body) => api.post('/voter/passkey/verify/finish', body)
export const listPasskeys              = ()     => api.get('/voter/passkey')
export const deletePasskey             = (id)   => api.delete(`/voter/passkey/${id}`)

// Sign-in. Omit matric_number to let the browser offer every saved passkey.
export const beginPasskeyLogin  = (matric_number) =>
  api.post('/auth/passkey/login/begin', matric_number ? { matric_number } : {})
export const finishPasskeyLogin = (body) => api.post('/auth/passkey/login/finish', body)

// ── Elections & Voting ────────────────────────────────────
export const getElections  = ()   => api.get('/elections')
export const getCandidates = (id) => api.get(`/elections/${id}/candidates`)
export const getResults    = (id) => api.get(`/elections/${id}/results`)
export const castVote      = (election_id, candidate_id) =>
  api.post('/voter/vote', { election_id, candidate_id })
export const verifyReceipt = (receipt) => api.get(`/verify/${receipt}`)

// ── Admin ─────────────────────────────────────────────────
export const getStats       = ()         => api.get('/admin/stats')
export const getAllUsers     = ()         => api.get('/admin/users')
export const getAuditLogs   = ()         => api.get('/admin/audit-logs')
export const createElection = (data)     => api.post('/admin/elections', data)
export const toggleElection = (id)       => api.patch(`/admin/elections/${id}/toggle`)
export const deleteElection = (id)       => api.delete(`/admin/elections/${id}`)
export const getRoster      = ()         => api.get('/admin/roster')
export const uploadRoster   = (students) => api.post('/admin/roster', { students })
export const clearRoster    = ()         => api.delete('/admin/roster')
export const addCandidate   = (data)     => api.post('/admin/candidates', data)
export const setEligibility = (uid, val) => api.patch(`/admin/users/${uid}/eligibility`, { is_eligible: val })

export default api
