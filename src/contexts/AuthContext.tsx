'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api, User, GroupInfo } from '@/lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  group: GroupInfo | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  createGroup: (name: string) => Promise<void>
  joinGroup: (inviteCode: string) => Promise<void>
  leaveGroup: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [group, setGroup] = useState<GroupInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_group')
    setUser(null)
    setToken(null)
    setGroup(null)
  }, [])

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    const storedGroup = localStorage.getItem('auth_group')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        if (storedGroup) {
          setGroup(JSON.parse(storedGroup))
        }
      } catch {
        logout()
      }
    }
    setLoading(false)
  }, [logout])

  const saveAuth = (token: string, user: User) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const saveGroup = (groupInfo: GroupInfo) => {
    localStorage.setItem('auth_group', JSON.stringify(groupInfo))
    setGroup(groupInfo)
  }

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password })
    saveAuth(res.token, res.user)
    // Try to load group info
    try {
      const groupInfo = await api.groups.me()
      saveGroup(groupInfo)
    } catch {
      // User has no group yet
      setGroup(null)
      localStorage.removeItem('auth_group')
    }
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password })
    saveAuth(res.token, res.user)
    setGroup(null)
    localStorage.removeItem('auth_group')
  }

  const createGroup = async (name: string) => {
    const res = await api.groups.create({ name })
    // Update token with group_id embedded
    localStorage.setItem('auth_token', res.token)
    setToken(res.token)
    saveGroup(res.group)
  }

  const leaveGroup = async () => {
    const res = await api.groups.leave()
    localStorage.setItem('auth_token', res.token)
    setToken(res.token)
    localStorage.removeItem('auth_group')
    setGroup(null)
  }

  const joinGroup = async (inviteCode: string) => {
    const res = await api.groups.join({ invite_code: inviteCode })
    // Update token with group_id embedded
    localStorage.setItem('auth_token', res.token)
    setToken(res.token)
    saveGroup(res.group)
  }

  return (
    <AuthContext.Provider value={{ user, token, group, loading, login, register, logout, createGroup, joinGroup, leaveGroup }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
