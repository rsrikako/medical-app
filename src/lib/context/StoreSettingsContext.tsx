"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getStoreSettings } from '@/lib/supabase/services'
import { StoreSettings } from '@/types'

type ContextValue = {
  settings: StoreSettings | null
  loading: boolean
}

const defaultSettings: StoreSettings = {
  businessName: process.env.NEXT_PUBLIC_STORE_NAME || '',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  logoUrl: '',
}

const StoreSettingsContext = createContext<ContextValue>({ settings: defaultSettings, loading: true })

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getStoreSettings()
      .then((s) => {
        if (!mounted) return
        if (s) setSettings(s)
      })
      .catch((err) => console.error('Failed to load store settings', err))
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <StoreSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </StoreSettingsContext.Provider>
  )
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext)
}

export default StoreSettingsContext
