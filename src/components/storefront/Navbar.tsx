'use client'

import React, { useState } from 'react'
import { useStoreSettings } from '@/lib/context/StoreSettingsContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/context/CartContext'
import { ShoppingBag, ShieldCheck, UserCheck, Building2, Menu, X, Award, Home, LayoutGrid } from 'lucide-react'

interface NavbarProps {
  businessName?: string
  searchQuery?: string
  setSearchQuery?: (q: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({ businessName = '' }) => {
  const { totalUnitsCount, totalLineItems } = useCart()
  const { settings } = useStoreSettings()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const resolvedBusinessName = businessName || settings?.businessName || process.env.NEXT_PUBLIC_STORE_NAME || ''

  const navLinks = [
    { name: 'Products', href: '/', icon: LayoutGrid },
    { name: 'Brands', href: '/brands', icon: Award },
  ]

  return (
    <header className="sticky top-0 z-40 glass-header">
      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-3 sm:py-0">
          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center space-x-8">
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

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-primary'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
                    <span>{link.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Actions & Mobile Hamburger */}
          <div className="flex items-center space-x-3">
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

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-colors"
              aria-label="Toggle Mobile Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
                <span>{link.name}</span>
              </Link>
            )
          })}

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <UserCheck className="w-5 h-5 text-slate-500" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
