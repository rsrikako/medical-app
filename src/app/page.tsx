'use client'

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/storefront/Navbar'
import { Footer } from '@/components/storefront/Footer'
import { ProductCard } from '@/components/storefront/ProductCard'
import { BrandPills } from '@/components/storefront/BrandPills'
import { getProducts, getCategories, getStoreSettings } from '@/lib/supabase/services'
import { Product, Category, StoreSettings } from '@/types'
import { Search, PackageX, Pill, ShieldCheck, PhoneCall, Filter } from 'lucide-react'

export default function StorefrontHomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<StoreSettings>({
    businessName: 'Sri Subrahmanya Agencies',
    whatsappNumber: '919876543210',
    contactPhone: '+91 98765 43210',
  })
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats, stg] = await Promise.all([
          getProducts(),
          getCategories(),
          getStoreSettings(),
        ])
        setProducts(prods)
        setCategories(cats)
        if (stg) setSettings(stg)
      } catch (err) {
        console.error('Failed to load storefront data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter only active products
  const activeProducts = products.filter((p) => p.status === 'active')

  // Extract unique brands
  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))

  // Apply search & category filter
  const filteredProducts = activeProducts.filter((p) => {
    // Category check
    if (selectedCategoryId && p.categoryId !== selectedCategoryId) {
      return false
    }

    // Brand check
    if (selectedBrand && p.brand !== selectedBrand) {
      return false
    }

    // Search query check
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim()
      const matchName = p.name.toLowerCase().includes(q)
      const matchBrand = p.brand.toLowerCase().includes(q)
      const matchSku = p.sku.toLowerCase().includes(q)
      const matchStrength = p.strength ? p.strength.toLowerCase().includes(q) : false
      const matchCategory = (p.categoryName ?? 'N/A').toLowerCase().includes(q)
      return matchName || matchBrand || matchSku || matchStrength || matchCategory
    }

    return true
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        businessName={settings.businessName}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-primary to-primary-container text-white rounded-xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/20 text-white font-mono text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              B2B Medical Wholesale Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Direct Wholesale Ordering for Pharmacies & Healthcare Providers
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-4">
              Select products and quantities into your cart, complete contact details, and submit directly to our WhatsApp order team. No minimum pricing markup or hidden fees.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-blue-100">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-teal-300" /> Guaranteed Authentic SKUs
              </span>
              <span className="flex items-center gap-1">
                <PhoneCall className="w-4 h-4 text-teal-300" /> Direct WhatsApp Handoff
              </span>
            </div>
          </div>
        </div>

        {/* Catalog Header and Brand Filters */}
        <div className="mb-6">
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-on-surface">Product Catalog</h2>
              <p className="text-xs text-on-surface-variant">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {/* Brands on second line; removed category filters as requested */}
          <div className="mt-3">
            <BrandPills brands={brands} selectedBrand={selectedBrand} onSelectBrand={setSelectedBrand} />
          </div>
        </div>

        {/* Product Grid / Loading / Empty States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="clinical-card h-80 animate-pulse p-4 flex flex-col justify-between">
                <div className="w-full h-40 bg-surface-container rounded-lg mb-4"></div>
                <div className="h-4 bg-surface-container rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-surface-container rounded w-1/2 mb-4"></div>
                <div className="h-9 bg-surface-container rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="clinical-card p-12 text-center max-w-md mx-auto my-12">
            <PackageX className="w-16 h-16 text-outline mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-base font-bold text-on-surface mb-2">No Products Found</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              {searchQuery
                ? `No products matched your search "${searchQuery}". Try searching with a different SKU or medicine name.`
                : 'No products are currently available in this category.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-surface-container text-primary rounded-lg text-xs font-bold hover:bg-surface-container-high transition-colors"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
