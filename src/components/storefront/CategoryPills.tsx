'use client'

import React from 'react'
import { Category } from '@/types'
import { Pill, Layers } from 'lucide-react'

interface CategoryPillsProps {
  categories: Category[]
  selectedCategoryId: string | null
  onSelectCategory: (id: string | null) => void
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const activeCategories = categories.filter((c) => c.status === 'active')

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
          selectedCategoryId === null
            ? 'bg-primary text-white shadow-sm'
            : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>All Products</span>
      </button>

      {activeCategories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <Pill className="w-3.5 h-3.5 text-secondary" />
            <span>{cat.name}</span>
          </button>
        )
      })}
    </div>
  )
}
