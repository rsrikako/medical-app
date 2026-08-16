'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts, getCategories, saveProduct, deleteProduct } from '@/lib/supabase/services'
import { Product, Category } from '@/types'
import { 
  Plus, Search, Filter, Edit, Trash2, Power, 
  Pill, FileSpreadsheet, Check, AlertCircle 
} from 'lucide-react'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')

  const [actionSuccess, setActionSuccess] = useState<string>('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()])
      setProducts(prods)
      setCategories(cats)
    } catch (err) {
      console.error('Failed to load products table:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Extract unique brands for filtering
  const brandsList = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false
    if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchName = p.name.toLowerCase().includes(q)
      const matchSku = p.sku.toLowerCase().includes(q)
      const matchBrand = p.brand.toLowerCase().includes(q)
      return matchName || matchSku || matchBrand
    }
    return true
  })

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active'
    try {
      await saveProduct({ ...product, status: nextStatus })
      setActionSuccess(`Product ${product.sku} status updated to ${nextStatus}`)
      setTimeout(() => setActionSuccess(''), 3000)
      loadData()
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete product "${product.name}" (${product.sku})?`)) return
    try {
      await deleteProduct(product.id)
      setActionSuccess(`Product ${product.sku} deleted successfully`)
      setTimeout(() => setActionSuccess(''), 3000)
      loadData()
    } catch (err) {
      alert('Failed to delete product')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Title & Add Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Product Catalog Inventory</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            View, search, edit, or toggle availability of products in your catalog
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/import"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container text-primary font-semibold text-xs rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bulk Import</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Action Success Toast */}
      {actionSuccess && (
        <div className="bg-teal-50 text-teal-800 border border-teal-200 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-teal-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Search & Filters Card */}
      <div className="clinical-card p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Filter by SKU or Product Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="clinical-input pl-10"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="clinical-input"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="clinical-input"
            >
              <option value="all">All Brands</option>
              {brandsList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="clinical-input"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="clinical-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container text-[11px] font-bold text-outline uppercase tracking-wider">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Pack</th>
                <th className="py-3 px-4">MRP</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-outline">
                    Loading catalog items...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                    {/* SKU */}
                    <td className="py-3 px-4 font-mono font-bold text-on-surface">
                      {p.sku}
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-4 font-semibold text-on-surface max-w-xs truncate">
                      <div className="flex items-center space-x-2">
                        {p.imageUrl ? (
                          <div className="w-7 h-7 relative rounded border border-surface-container overflow-hidden shrink-0">
                            <Image src={p.imageUrl} alt={p.name} fill className="object-contain" />
                          </div>
                        ) : (
                          <Pill className="w-5 h-5 text-outline shrink-0" />
                        )}
                        <span className="truncate">{p.name}</span>
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4 font-medium text-primary">
                      {p.brand}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-on-surface-variant">
                      {p.categoryName || 'N/A'}
                    </td>

                    {/* Pack Count */}
                    <td className="py-3 px-4 font-mono text-outline">
                      {p.packCount}
                    </td>

                    {/* MRP */}
                    <td className="py-3 px-4 font-mono font-semibold text-on-surface">
                      {p.mrp !== undefined && p.mrp !== null ? `₹${Number(p.mrp).toFixed(2)}` : '—'}
                    </td>

                    {/* Status Toggle Badge */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                          p.status === 'active'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-teal-600' : 'bg-gray-400'}`}></span>
                        <span className="capitalize">{p.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="inline-flex p-1.5 text-outline hover:text-primary hover:bg-surface-container rounded-md transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(p)}
                        className="inline-flex p-1.5 text-outline hover:text-error hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
