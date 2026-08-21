'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useStoreSettings } from '@/lib/context/StoreSettingsContext'
import Link from 'next/link'
import { useCart } from '@/lib/context/CartContext'
import { ShoppingBag, ShieldCheck, UserCheck, Search, Building2 } from 'lucide-react'

interface NavbarProps {
  businessName?: string
  searchQuery?: string
  setSearchQuery?: (q: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({
  businessName = '',
  searchQuery = '',
  setSearchQuery,
}) => {
  const { totalUnitsCount, totalLineItems } = useCart()
  const { settings } = useStoreSettings()
  const resolvedBusinessName = businessName || settings?.businessName || process.env.NEXT_PUBLIC_STORE_NAME || ''
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [localQuery, setLocalQuery] = useState<string>(searchQuery || '')

  // keep localQuery in sync when parent changes searchQuery
  useEffect(() => {
    setLocalQuery(searchQuery || '')
  }, [searchQuery])

  // debounce sending query upstream
  useEffect(() => {
    if (!setSearchQuery) return
    const id = setTimeout(() => setSearchQuery(localQuery), 300)
    return () => clearTimeout(id)
  }, [localQuery, setSearchQuery])

  return (
    <header className="sticky top-0 z-40 glass-header">
      {/* Top B2B Announcement Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-primary to-slate-950 text-white text-xs py-1.5 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-medium tracking-wide">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Verified Medical Wholesale Catalog • B2B Direct Ordering</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-slate-300 font-medium">No Minimum Order Quantity</span>
            <Link href="/admin" className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold text-white">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between min-h-16 gap-4 py-3 sm:py-0">
          {/* Logo / Company Name */}
          <Link href="/" className="flex items-center space-x-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary-container to-slate-900 flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300 border border-white/20">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight block leading-tight max-w-[18rem] truncate group-hover:text-primary transition-colors">
                {resolvedBusinessName}
              </span>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block bg-slate-100 px-1.5 py-0.5 rounded-sm w-fit mt-0.5 border border-slate-200">
                Wholesale Medical Supply
              </span>
            </div>
          </Link>

          {/* Search Bar (Mobile & Desktop) */}
          {setSearchQuery && (
            <div className="w-full order-last sm:order-none sm:flex-1 sm:max-w-xl mx-0 sm:mx-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  placeholder="Search by Product Name, Brand, SKU, or Strength..."
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      setSearchQuery && setSearchQuery(localQuery)
                      inputRef.current?.blur()
                    }
                  }}
                  className="clinical-input pl-10 pr-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center shrink-0">
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-slate-900 text-white p-2.5 sm:px-4 sm:py-2.5 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all border border-white/10 active:scale-95"
              aria-label={`Cart with ${totalLineItems} line item${totalLineItems === 1 ? '' : 's'}`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:ml-2 sm:inline font-bold sm:text-xs uppercase tracking-wider">Order Cart</span>
              {totalLineItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-extrabold min-w-5 h-5 flex items-center justify-center px-1 rounded-full shadow-md border border-white">
                  {totalUnitsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
