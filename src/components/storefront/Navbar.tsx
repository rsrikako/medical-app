'use client'

import React, { useRef } from 'react'
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-container border-opacity-80">
      {/* Top B2B Announcement Bar */}
      <div className="bg-primary text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-medium">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary-container" />
            <span>Verified Medical Wholesale Catalog • B2B Direct Ordering</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-blue-100">No Minimum Order Quantity</span>
            <Link href="/admin" className="hover:underline flex items-center gap-1 font-semibold text-white">
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
          <Link href="/" className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-on-surface tracking-tight block leading-tight max-w-[18rem] truncate">
                {resolvedBusinessName}
              </span>
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider block">
                Wholesale Medical Supply
              </span>
            </div>
          </Link>

          {/* Search Bar (Mobile & Desktop) */}
          {setSearchQuery && (
            <div className="w-full order-last sm:order-none sm:flex-1 sm:max-w-xl mx-0 sm:mx-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  ref={inputRef}
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  placeholder="Search by Product Name, Brand, SKU, or Strength..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      inputRef.current?.blur()
                    }
                  }}
                  className="clinical-input pl-10 pr-4 py-2 text-sm bg-surface-container-low focus:bg-white rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center shrink-0">
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center rounded-lg bg-primary-container text-white p-2.5 sm:px-3.5 sm:py-2 shadow-sm hover:bg-primary transition-colors"
              aria-label={`Cart with ${totalLineItems} line item${totalLineItems === 1 ? '' : 's'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:ml-2 sm:inline font-semibold sm:text-sm">Order Cart</span>
              {totalLineItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-mono font-bold min-w-5 h-5 flex items-center justify-center px-1 rounded-full">
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
