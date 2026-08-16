'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { getStoreSettings } from '@/lib/supabase/services'
import { StoreSettings } from '@/types'
import { useEffect } from 'react'
import { Building2, Lock, Mail, KeyRound, AlertCircle, ArrowRight } from 'lucide-react'
import { useStoreSettings } from '@/lib/context/StoreSettingsContext'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { settings } = useStoreSettings()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Invalid administrator login credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-white mx-auto flex items-center justify-center mb-3 shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">{(settings?.businessName || process.env.NEXT_PUBLIC_STORE_NAME) ? `${settings?.businessName ?? process.env.NEXT_PUBLIC_STORE_NAME} Admin Portal` : 'Admin Portal'}</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Authenticated Catalog & Category Management
          </p>
        </div>

        {/* Login Form Card */}
        <div className="clinical-card p-8">
          {error && (
            <div className="mb-6 bg-error-container text-on-error-container p-3.5 rounded-lg text-xs flex items-center gap-2 border border-error/20 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-error" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="clinical-input pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="clinical-input pl-10"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary-hover transition-colors shadow-md disabled:opacity-50 mt-6"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
