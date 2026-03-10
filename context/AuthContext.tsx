'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import type { AuthUser } from '@/types'

interface AuthContextValue {
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: AuthUser | null
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser)

  const logout = useCallback(async () => {
    const res  = await fetch('/api/auth/logout', { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    setUser(null)
    if (data.logoutUrl) {
      window.location.href = data.logoutUrl
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider')
  return ctx
}
