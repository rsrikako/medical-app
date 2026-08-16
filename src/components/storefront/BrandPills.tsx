'use client'

import React from 'react'
import { Layers } from 'lucide-react'

interface BrandPillsProps {
  brands: string[]
  selectedBrand: string | null
  onSelectBrand: (brand: string | null) => void
}

export const BrandPills: React.FC<BrandPillsProps> = ({ brands, selectedBrand, onSelectBrand }) => {
  const activeBrands = brands.filter(Boolean)

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectBrand(null)}
        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
          selectedBrand === null
            ? 'bg-primary text-white shadow-sm'
            : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>All Brands</span>
      </button>

      {activeBrands.map((b) => {
        const isSelected = selectedBrand === b
        return (
          <button
            key={b}
            onClick={() => onSelectBrand(b)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span>{b}</span>
          </button>
        )
      })}
    </div>
  )
}
