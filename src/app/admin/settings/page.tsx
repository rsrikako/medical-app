'use client'

import React, { useEffect, useState } from 'react'
import { getStoreSettings, saveStoreSettings } from '@/lib/supabase/services'
import { StoreSettings } from '@/types'
import { Save, Check, Building2, Phone, MessageSquare } from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    businessName: process.env.NEXT_PUBLIC_STORE_NAME || '',
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
    logoUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getStoreSettings()
        if (data) setSettings(data)
      } catch (err) {
        console.error('Failed to load store settings:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await saveStoreSettings(settings)
      setSuccess('Store settings updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert('Failed to save store settings')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-outline">Loading store settings...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Storefront & Order Settings</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Configure application brand name and target WhatsApp receiving phone number
        </p>
      </div>

      {success && (
        <div className="bg-teal-50 text-teal-800 border border-teal-200 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-teal-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="clinical-card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Business / Store Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                required
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="clinical-input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Target WhatsApp Number (Country Code Included)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                required
                placeholder="e.g. 919876543210"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="clinical-input pl-10 font-mono"
              />
            </div>
            <p className="text-[11px] text-outline mt-1">
              This is the phone number where prefilled WhatsApp order messages will be opened (`https://wa.me/&lt;number&gt;`). Format: digits only without + prefix (e.g. 919876543210).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Contact Phone String
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="clinical-input pl-10 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-surface-container">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving Settings...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
