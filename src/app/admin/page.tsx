'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProducts, getCategories } from '@/lib/supabase/services'
import { Product, Category } from '@/types'
import { 
  Package, PackageCheck, PackageX, Layers, PlusCircle, 
  FileSpreadsheet, Settings, ArrowRight, Building2, Eye 
} from 'lucide-react'

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()])
        setProducts(prods)
        setCategories(cats)
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const activeProductsCount = products.filter((p) => p.status === 'active').length
  const inactiveProductsCount = products.filter((p) => p.status === 'inactive').length
  const activeCategoriesCount = categories.filter((c) => c.status === 'active').length

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Catalog Management Dashboard</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          High level overview of your medical wholesale inventory and category structure
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="clinical-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-outline uppercase tracking-wider block">Total Products</span>
            <span className="text-3xl font-extrabold text-on-surface font-mono mt-1 block">
              {loading ? '...' : products.length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Active Products */}
        <div className="clinical-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">Active Products</span>
            <span className="text-3xl font-extrabold text-teal-800 font-mono mt-1 block">
              {loading ? '...' : activeProductsCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Inactive Products */}
        <div className="clinical-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-outline uppercase tracking-wider block">Inactive Products</span>
            <span className="text-3xl font-extrabold text-on-surface-variant font-mono mt-1 block">
              {loading ? '...' : inactiveProductsCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center">
            <PackageX className="w-6 h-6" />
          </div>
        </div>

        {/* Total Categories */}
        <div className="clinical-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Active Categories</span>
            <span className="text-3xl font-extrabold text-secondary font-mono mt-1 block">
              {loading ? '...' : activeCategoriesCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div>
        <h2 className="text-base font-bold text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/products/new"
            className="clinical-card p-6 hover:border-primary transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-on-surface text-base mb-1 group-hover:text-primary">Add Single Product</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Manually input SKU, title, brand, strength, pack size, image, and category.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
              <span>Create Product</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/import"
            className="clinical-card p-6 hover:border-primary transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-on-surface text-base mb-1 group-hover:text-teal-700">Bulk Excel Import</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Upload `.xlsx` spreadsheets to create or update existing catalog products in bulk.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal-700">
              <span>Import Excel Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="clinical-card p-6 hover:border-primary transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-secondary text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-on-surface text-base mb-1 group-hover:text-secondary">Manage Categories</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Organize products into tablets, capsules, syrups, injections, or supplies.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-secondary">
              <span>View Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
