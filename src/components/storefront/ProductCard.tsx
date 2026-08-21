'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants/defaults'
import { useCart } from '@/lib/context/CartContext'
import { Plus, Minus, ShoppingBag, Check } from 'lucide-react'

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
    <div className="glass-card group flex flex-col justify-between overflow-hidden relative">
      {/* Availability Status Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          In Stock
        </span>
      </div>

      <Link href={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="w-full h-48 bg-gradient-to-b from-white/90 to-slate-50/60 relative overflow-hidden flex items-center justify-center p-4 border-b border-slate-100">
          <Image
            src={product.imageUrl || DEFAULT_PRODUCT_IMAGE}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        {/* Details Section */}
        <div className="p-4 flex-1">
          {/* Brand */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-primary tracking-wider text-[11px] uppercase">{product.brand}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-2 mb-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* SKU */}
          {product.sku && (
            <div className="mb-3">
              <span className="bg-slate-100/80 text-slate-600 font-mono px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200/50">
                SKU: {product.sku}
              </span>
            </div>
          )}

          {/* Strength, Price & Pack row */}
          <div className="text-xs text-slate-600 mb-2 font-mono bg-white/60 backdrop-blur-sm p-2.5 rounded-lg border border-slate-100">
            <div className="flex items-start justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                {product.strength && (
                  <span className="text-slate-900 font-bold block">{product.strength}</span>
                )}

                <div>
                  {product.salePrice !== undefined && product.salePrice !== null ? (
                    <span className="text-emerald-700 font-extrabold text-base sm:text-lg leading-tight whitespace-nowrap">
                      ₹{Number(product.salePrice).toFixed(2)}
                    </span>
                  ) : product.mrp !== undefined && product.mrp !== null ? (
                    <span className="text-slate-900 font-extrabold whitespace-nowrap text-sm sm:text-base">
                      MRP ₹{Number(product.mrp).toFixed(2)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex-shrink-0">
                <span className="text-slate-500 text-[11px] font-sans font-medium">Pack: {product.packCount}</span>
              </div>
            </div>

            {product.salePrice !== undefined && product.salePrice !== null && product.mrp !== undefined && product.mrp !== null && (
              <div className="mt-1">
                <span className="text-slate-400 line-through text-[10px]">MRP ₹{Number(product.mrp).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Cart Controls Section */}
      <div className="p-4 pt-0 mt-auto">
        <div className="flex items-center gap-2">
          {/* Quantity Controls */}
          <div className="flex items-center border border-slate-200 rounded-lg bg-white/80 overflow-hidden shadow-inner">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-slate-100 text-slate-700 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-10 text-center bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-slate-100 text-slate-700 transition-colors"
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
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-primary via-primary-container to-blue-900 text-white hover:brightness-110 active:scale-[0.98] border border-amber-300/30 shadow-primary/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 text-amber-300" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-amber-300" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

