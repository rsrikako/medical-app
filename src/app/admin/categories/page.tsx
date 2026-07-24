'use client'

import React, { useEffect, useState } from 'react'
import { getCategories, saveCategory, deleteCategory } from '@/lib/supabase/services'
import { Category } from '@/types'
import { Plus, Edit, Trash2, Layers, Check, AlertCircle, Save } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    displayOrder: 1,
    status: 'active' as 'active' | 'inactive',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const cats = await getCategories()
      setCategories(cats)
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenNew = () => {
    setEditingCategory(null)
    setFormData({
      id: '',
      name: '',
      displayOrder: categories.length + 1,
      status: 'active',
    })
    setIsFormOpen(true)
    setError('')
  }

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat)
    setFormData({
      id: cat.id,
      name: cat.name,
      displayOrder: cat.displayOrder,
      status: cat.status,
    })
    setIsFormOpen(true)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Category Name is required')
      return
    }

    try {
      await saveCategory({
        id: formData.id || undefined,
        name: formData.name.trim(),
        displayOrder: Number(formData.displayOrder) || 1,
        status: formData.status,
      })
      setSuccess(`Category "${formData.name}" saved successfully`)
      setTimeout(() => setSuccess(''), 3000)
      setIsFormOpen(false)
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to save category')
    }
  }

  const handleToggleStatus = async (cat: Category) => {
    const nextStatus = cat.status === 'active' ? 'inactive' : 'active'
    try {
      await saveCategory({ ...cat, status: nextStatus })
      loadData()
    } catch (err) {
      alert('Failed to toggle status')
    }
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return
    try {
      await deleteCategory(cat.id)
      loadData()
    } catch (err) {
      alert('Failed to delete category')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Category Management</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Configure product category labels and display order for storefront filtering
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {success && (
        <div className="bg-teal-50 text-teal-800 border border-teal-200 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-teal-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Category Modal / Drawer */}
      {isFormOpen && (
        <div className="clinical-card p-6 border-2 border-primary/20 bg-surface-container-low">
          <h2 className="text-base font-bold text-on-surface mb-4">
            {editingCategory ? `Edit Category "${editingCategory.name}"` : 'Create New Category'}
          </h2>

          {error && (
            <div className="mb-4 bg-error-container text-on-error-container p-3 rounded-lg text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-error" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Category Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tablets, Capsules"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="clinical-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                className="clinical-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="clinical-input"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex justify-end space-x-2 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-surface-container text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover"
              >
                <Save className="w-4 h-4" />
                <span>Save Category</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="clinical-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-surface-container text-[11px] font-bold text-outline uppercase tracking-wider">
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container text-xs">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-outline">
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                  No categories created yet. Click "Add Category" to get started.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-on-surface">
                    {c.displayOrder}
                  </td>
                  <td className="py-3 px-4 font-bold text-on-surface">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-secondary" />
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-outline">
                    {c.slug}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(c)}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                        c.status === 'active'
                          ? 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-teal-600' : 'bg-gray-400'}`}></span>
                      <span className="capitalize">{c.status}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="inline-flex p-1.5 text-outline hover:text-primary hover:bg-surface-container rounded-md transition-colors"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="inline-flex p-1.5 text-outline hover:text-error hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Category"
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
  )
}
