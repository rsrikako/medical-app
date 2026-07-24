'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCategories, getProducts, saveProduct, uploadProductImage } from '@/lib/supabase/services'
import { Category, Product } from '@/types'
import { ArrowLeft, Save, Upload, Pill, AlertCircle, Check } from 'lucide-react'

export default function AdminNewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [existingProducts, setExistingProducts] = useState<Product[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    categoryId: '',
    brand: '',
    strength: '',
    form: 'Tablet',
    packCount: '',
    description: '',
    imageUrl: '',
    status: 'active' as 'active' | 'inactive',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    async function init() {
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()])
        setCategories(cats)
        setExistingProducts(prods)
        if (cats.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: cats[0].id }))
        }
      } catch (err) {
        console.error('Failed to init product form:', err)
      }
    }
    init()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanSku = formData.sku.trim()
    if (!cleanSku) {
      setError('SKU code is required')
      return
    }

    // Duplicate SKU check
    const isDuplicate = existingProducts.some(
      (p) => p.sku.toLowerCase() === cleanSku.toLowerCase()
    )
    if (isDuplicate) {
      setError(`Product SKU "${cleanSku}" already exists in catalog. Each variant must have a unique SKU.`)
      return
    }

    if (!formData.name.trim()) {
      setError('Product Name is required')
      return
    }
    if (!formData.brand.trim()) {
      setError('Brand Name is required')
      return
    }
    if (!formData.packCount.trim()) {
      setError('Pack / Tablet Count is required (e.g. 10 Tablets)')
      return
    }

    setSubmitting(true)

    try {
      let finalImageUrl = formData.imageUrl
      if (imageFile) {
        finalImageUrl = await uploadProductImage(imageFile)
      }

      const selectedCat = categories.find((c) => c.id === formData.categoryId)

      await saveProduct({
        sku: cleanSku,
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        categoryName: selectedCat ? selectedCat.name : '',
        brand: formData.brand.trim(),
        strength: formData.strength.trim(),
        form: formData.form.trim(),
        packCount: formData.packCount.trim(),
        description: formData.description.trim(),
        imageUrl: finalImageUrl,
        status: formData.status,
      })

      router.push('/admin/products')
    } catch (err: any) {
      setError(err.message || 'Failed to create product.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Create New Product Variant</h1>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-3.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-error/20">
          <AlertCircle className="w-4 h-4 shrink-0 text-error" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="clinical-card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* SKU */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                SKU Code <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PCM500-10"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="clinical-input font-mono uppercase"
              />
              <span className="text-[11px] text-outline block mt-1">Unique variant identifier</span>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Product Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Paracetamol 500mg — Brand A — 10 Tablets"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="clinical-input"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Brand / Manufacturer <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ABC Pharma"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="clinical-input"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Category <span className="text-error">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="clinical-input"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pack Count */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Pack / Tablet Count <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 10 Tablets, 20 Capsules, 100ml"
                value={formData.packCount}
                onChange={(e) => setFormData({ ...formData, packCount: e.target.value })}
                className="clinical-input"
              />
            </div>

            {/* Strength */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Strength <span className="text-outline font-normal text-[10px]">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 500mg, 250mg, 10mg"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                className="clinical-input font-mono"
              />
            </div>

            {/* Dosage Form */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Dosage Form <span className="text-outline font-normal text-[10px]">(Optional)</span>
              </label>
              <select
                value={formData.form}
                onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                className="clinical-input"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Ointment">Ointment</option>
                <option value="Medical Supply">Medical Supply</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Active Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="clinical-input"
              >
                <option value="active">Active (Visible in Storefront)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
              Product Description <span className="text-outline font-normal text-[10px]">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Enter technical details, therapeutic indications, or packaging specs..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="clinical-input"
            ></textarea>
          </div>

          {/* Image Upload Section */}
          <div className="border-t border-surface-container pt-4">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
              Product Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-surface-container-low border border-surface-container rounded-lg flex items-center justify-center relative overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <Pill className="w-8 h-8 text-outline" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-container file:text-primary hover:file:bg-surface-container-high cursor-pointer"
                />
                <p className="text-[11px] text-outline mt-1">Upload JPEG/PNG product image to Firebase Storage</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 border-t border-surface-container pt-6">
            <Link
              href="/admin/products"
              className="px-4 py-2 bg-surface-container text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
