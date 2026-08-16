 'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { useStoreSettings } from '@/lib/context/StoreSettingsContext'
import { 
  LayoutDashboard, Package, Layers, FileSpreadsheet, Settings, 
  LogOut, Building2, ExternalLink, UserCheck 
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isDemoAdmin, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === '/admin/login'
  const isAuthenticated = Boolean(user || isDemoAdmin)

  const { settings } = useStoreSettings()

  useEffect(() => {
    if (!loading && !isAuthenticated && !isLoginPage) {
      router.push('/admin/login')
    }
  }, [loading, isAuthenticated, isLoginPage, router])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-mono text-outline">Verifying Admin Permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const storeName = (typeof window === 'undefined') ? process.env.NEXT_PUBLIC_STORE_NAME || '' : undefined

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: Layers },
    { href: '/admin/import', label: 'Excel Import', icon: FileSpreadsheet },
    { href: '/admin/settings', label: 'Store Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-surface-container sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Admin Brand Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-on-surface block leading-tight">{(settings?.businessName || process.env.NEXT_PUBLIC_STORE_NAME) ? `${settings?.businessName ?? process.env.NEXT_PUBLIC_STORE_NAME} Admin` : 'Admin'}</span>
                <span className="text-[10px] font-mono text-secondary uppercase font-semibold block">Catalog Backoffice</span>
              </div>
            </div>

            {/* Admin Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1 text-xs font-semibold text-primary hover:underline px-2.5 py-1.5 rounded-md hover:bg-surface-container-low"
              >
                <span>View Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={async () => {
                  await logout()
                  router.push('/admin/login')
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-surface-container text-error rounded-lg text-xs font-semibold hover:bg-error-container transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden border-t border-surface-container px-4 py-2 flex items-center space-x-1 overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
