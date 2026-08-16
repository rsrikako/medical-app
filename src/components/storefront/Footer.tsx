'use client'

import React from 'react'
import Link from 'next/link'
import { useStoreSettings } from '@/lib/context/StoreSettingsContext'
import { Building2, ShieldCheck, PhoneCall, ArrowRight } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-surface-container mt-16 text-on-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold text-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-on-surface">{(useStoreSettings().settings?.businessName) || process.env.NEXT_PUBLIC_STORE_NAME || ''}</span>
            </div>
            <p className="text-sm text-on-surface-variant max-w-md leading-relaxed mb-4">
              Streamlined B2B medical wholesale catalog and direct WhatsApp ordering platform. Supplying pharmacies, clinics, and hospitals with verified pharmaceutical products.
            </p>
            <div className="flex items-center space-x-4 text-xs font-medium text-secondary">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> No Prices Shown
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> WhatsApp Checkout
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Product Catalog</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-primary transition-colors">View Cart</Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-primary transition-colors">WhatsApp Checkout</Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-primary transition-colors font-medium text-primary">Admin Sign In</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Admin Access</h4>
            <p className="text-xs text-on-surface-variant mb-3">
              Store administrators can log in to manage inventory, categories, and bulk Excel imports.
            </p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-3 py-2 bg-surface-container text-primary rounded-md text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              <span>Go to Admin Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant gap-4">
          <p>© {new Date().getFullYear()} {(useStoreSettings().settings?.businessName) || process.env.NEXT_PUBLIC_STORE_NAME || ''}{(useStoreSettings().settings?.businessName || process.env.NEXT_PUBLIC_STORE_NAME) ? ', Anakapalli' : ''}. All rights reserved.</p>
          <p className="font-mono text-[11px] text-outline">WhatsApp Direct Order System v1.0</p>
        </div>
      </div>
    </footer>
  )
}
