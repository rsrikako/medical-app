'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants/defaults'
import { useCart } from '@/lib/context/CartContext'
import { Plus, Minus, ShoppingBag, Check, Pill, PackageCheck } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState<number>(1)
  const [added, setAdded] = useState<boolean>(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="clinical-card group flex flex-col justify-between overflow-hidden relative">
      {/* Availability Status Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
          In Stock
        </span>
      </div>

      <Link href={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="w-full h-48 bg-surface-container-low relative overflow-hidden flex items-center justify-center p-4">
          <Image
            src={product.imageUrl || DEFAULT_PRODUCT_IMAGE}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover p-2 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Details Section */}
        <div className="p-4 flex-1">
          {/* Brand & Pack info */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
            <span className="font-semibold text-primary">{product.brand}</span>
            {/* packCount moved below into the SKU area to free space here */}
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-on-surface text-base line-clamp-2 mb-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* SKU below title (moved here per request) */}
          {product.sku && (
            <div className="mb-2">
              <span className="bg-surface-container text-on-surface-variant font-mono px-2 py-0.5 rounded text-[11px]">SKU: {product.sku}</span>
            </div>
          )}

          {/* Strength, Price & SKU row - responsive, aligned across breakpoints */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-outline mb-3 font-mono bg-surface-container-low p-2 rounded">
            <div className="flex w-full items-start sm:items-center sm:gap-4">
              <div className="flex-shrink-0">
                {product.strength && (
                  <span className="text-on-surface font-medium block">{product.strength}</span>
                )}
              </div>

              <div className="flex flex-1 items-center justify-start">
                {product.salePrice !== undefined && product.salePrice !== null ? (
                  <div className="flex flex-col">
                    <span className="text-emerald-800 font-semibold text-base sm:text-lg leading-tight whitespace-nowrap">₹{Number(product.salePrice).toFixed(2)}</span>
                    <span className="text-outline text-xs mt-1">SKU: {product.sku}</span>
                    {product.mrp !== undefined && product.mrp !== null && (
                      <span className="text-on-surface-variant line-through text-[11px] mt-1 whitespace-nowrap">MRP ₹{Number(product.mrp).toFixed(2)}</span>
                    )}
                  </div>
                ) : product.mrp !== undefined && product.mrp !== null ? (
                  <span className="text-on-surface-variant font-semibold whitespace-nowrap">MRP ₹{Number(product.mrp).toFixed(2)}</span>
                ) : null}
              </div>
            </div>

            <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
              <span className="text-outline text-xs">Pack: {product.packCount}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Cart Controls Section */}
      <div className="p-4 pt-0 mt-auto">
        <div className="flex items-center gap-2">
          {/* Quantity Controls */}
          <div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-low overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-surface-container text-on-surface transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center bg-transparent text-xs font-mono font-bold text-on-surface focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-surface-container text-on-surface transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all shadow-sm ${
              added
                ? 'bg-secondary text-white'
                : 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
