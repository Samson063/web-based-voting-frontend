import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Read the "bio" claim from the JWT payload. This is only used to decide which
// screen to show — the server independently enforces it on every vote.
function tokenIsBiometric(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.bio === true
  } catch { return false }
}

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser  = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const loginUser = (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const logoutUser = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const biometricVerified = token ? tokenIsBiometric(token) : false

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser, biometricVerified }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
