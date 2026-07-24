'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase/config'

interface AuthContextType {
  user: User | null
  loading: boolean
  isDemoAdmin: boolean
  login: (email: string, pass: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemoAdmin: false,
  login: async () => {},
  logout: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemoAdmin, setIsDemoAdmin] = useState(false)

  useEffect(() => {
    // Check local storage for demo admin flag first
    const demoFlag = typeof window !== 'undefined' ? localStorage.getItem('pharmdirect_demo_admin') === 'true' : false
    setIsDemoAdmin(demoFlag)

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    // If initial check completes fast, ensure loading flag resolves
    setLoading(false)

    return () => unsubscribe()
  }, [])

  const login = async (email: string, pass: string) => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, pass)
      setIsDemoAdmin(false)
      if (typeof window !== 'undefined') localStorage.removeItem('pharmdirect_demo_admin')
    } catch (err: any) {
      // Fallback for demo login if firebase auth fails (e.g., admin@pharmdirect.com / admin123)
      if (email.toLowerCase() === 'admin@pharmdirect.com' && pass === 'admin123') {
        setIsDemoAdmin(true)
        if (typeof window !== 'undefined') localStorage.setItem('pharmdirect_demo_admin', 'true')
      } else {
        setLoading(false)
        throw err
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      // ignore
    }
    setIsDemoAdmin(false)
    if (typeof window !== 'undefined') localStorage.removeItem('pharmdirect_demo_admin')
  }

  return (
    <AuthContext.Provider value={{ user, loading, isDemoAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
