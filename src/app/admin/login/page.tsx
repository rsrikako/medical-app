'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { Building2, Lock, Mail, KeyRound, AlertCircle, ArrowRight } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('admin@srisubrahmanyaagencies.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Sri Subrahmanya Agencies Admin Portal</h1>
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
                  placeholder="admin@srisubrahmanyaagencies.com"
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
                  placeholder="••••••••"
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

          {/* Quick Demo Credentials Info Box */}
          <div className="mt-8 pt-6 border-t border-surface-container text-xs text-on-surface-variant">
            <span className="font-bold text-primary block mb-1">Demo Admin Credentials:</span>
            <div className="bg-surface-container-low p-2.5 rounded font-mono text-[11px] space-y-0.5 border border-surface-container">
              <div>Email: admin@srisubrahmanyaagencies.com</div>
              <div>Password: admin123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
