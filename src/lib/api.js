import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

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
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data)
export const login    = (matric_number, password) =>
  api.post('/auth/login', { matric_number, password })
export const getMe    = () => api.get('/voter/me')

// ── Elections & Voting ───────────────────────────────────
export const getElections  = ()   => api.get('/elections')
export const getCandidates = (id) => api.get(`/elections/${id}/candidates`)
export const getResults    = (id) => api.get(`/elections/${id}/results`)
export const castVote      = (election_id, candidate_id) =>
  api.post('/voter/vote', { election_id, candidate_id })
export const verifyReceipt = (receipt) => api.get(`/verify/${receipt}`)

// ── Admin ────────────────────────────────────────────────
export const getStats       = ()         => api.get('/admin/stats')
export const getAllUsers     = ()         => api.get('/admin/users')
export const getAuditLogs   = ()         => api.get('/admin/audit-logs')
export const createElection = (data)     => api.post('/admin/elections', data)
export const toggleElection = (id)       => api.patch(`/admin/elections/${id}/toggle`)
export const addCandidate   = (data)     => api.post('/admin/candidates', data)
export const setEligibility = (uid, val) => api.patch(`/admin/users/${uid}/eligibility`, { is_eligible: val })
