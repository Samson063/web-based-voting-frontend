import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

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

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
