'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/storefront/Navbar'
import { Footer } from '@/components/storefront/Footer'
import {
  getBrandsWithCounts,
  getStoreSettings,
  BrandSummary,
} from '@/lib/supabase/services'
import { StoreSettings } from '@/types'
import {
  Award,
  Search,
  ArrowRight,
  Pill,
} from 'lucide-react'

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandSummary[]>([])
  const [settings, setSettings] = useState<StoreSettings>({
    businessName: process.env.NEXT_PUBLIC_STORE_NAME || '',
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [bData, stg] = await Promise.all([
          getBrandsWithCounts(),
          getStoreSettings(),
        ])

        setBrands(bData)

        if (stg) setSettings(stg)
      } catch (err) {
        console.error('Failed to load brands page data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredBrands = useMemo(() => {
    const q = search.toLowerCase().trim()

    if (!q) return brands

    return brands.filter((b) =>
      b.name.toLowerCase().includes(q)
    )
  }, [brands, search])

  const totalProductsCount = useMemo(() => {
    return brands.reduce((acc, b) => acc + b.productCount, 0)
  }, [brands])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Total Products / Total Brands Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">

          {/* Total Products */}
          <Link
            href="/"
            className="glass-card p-3 sm:p-4 flex items-center justify-between border border-slate-200/80 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs shrink-0">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                  Total Products
                </p>

                <h3 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                  {loading
                    ? '...'
                    : totalProductsCount.toLocaleString()}
                </h3>
              </div>
            </div>
          </Link>

          {/* Total Brands */}
          <Link
            href="/brands"
            className="glass-card p-3 sm:p-4 flex items-center justify-between border border-slate-200/80 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 shadow-xs shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                  Total Brands
                </p>

                <h3 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                  {loading
                    ? '...'
                    : brands.length.toLocaleString()}
                </h3>
              </div>
            </div>
          </Link>
        </div>

        {/* Search Bar & Filter Header */}
        <div className="glass-card p-4 sm:p-5 mb-8 border border-slate-200/80 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Search */}
            <div className="w-full sm:w-96 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="search"
                placeholder="Search brand name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="clinical-input pl-10 pr-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-primary/20 w-full font-medium"
              />
            </div>

            {/* Results Count */}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
              Showing {filteredBrands.length} of {brands.length} Brands
            </p>
          </div>
        </div>

        {/* Brand Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="glass-card h-40 animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-8 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {filteredBrands.map((brand) => (
              <Link
                key={brand.name}
                href={`/?brand=${encodeURIComponent(brand.name)}`}
                className="glass-card group p-5 flex flex-col justify-between border border-slate-200/80 hover:border-primary/40 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary-container to-slate-900 flex items-center justify-center text-emerald-400 font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
                      {brand.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-900 text-base truncate group-hover:text-primary transition-colors">
                        {brand.name}
                      </h3>

                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Verified Supplier
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-600 bg-slate-100/80 p-2.5 rounded-lg border border-slate-200/50 mb-4">
                    <span>Products Available</span>

                    <span className="font-extrabold text-slate-900">
                      {brand.productCount} Items
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-primary group-hover:text-emerald-600 transition-colors pt-2 border-t border-slate-100">
                  <span>Browse Catalog</span>

                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}

          </div>
        ) : (
          <div className="glass-card p-12 text-center max-w-md mx-auto my-12">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />

            <h3 className="text-base font-bold text-slate-900 mb-2">
              No Brands Found
            </h3>

            <p className="text-sm text-slate-500 mb-6">
              No manufacturer matches "{search}". Try searching for another brand.
            </p>

            <button
              onClick={() => setSearch('')}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors"
            >
              Clear Brand Search
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}