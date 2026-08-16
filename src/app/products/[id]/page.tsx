'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/storefront/Navbar'
import { Footer } from '@/components/storefront/Footer'
import { getProductById, getStoreSettings } from '@/lib/supabase/services'
import { Product, StoreSettings } from '@/types'
import { useCart } from '@/lib/context/CartContext'
import { 
  ArrowLeft, Plus, Minus, ShoppingBag, Check, ShieldCheck, 
  Pill, Package, Building2, Hash, Layers 
} from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [settings, setSettings] = useState<StoreSettings>({
    businessName: 'Sri Subrahmanya Agencies',
    whatsappNumber: '919876543210',
    contactPhone: '+91 98765 43210',
  })
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [added, setAdded] = useState<boolean>(false)

  const { addItem } = useCart()

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return
      try {
        const [prod, stg] = await Promise.all([
          getProductById(productId),
          getStoreSettings(),
        ])
        setProduct(prod)
        if (stg) setSettings(stg)
      } catch (err) {
        console.error('Failed to load product details:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar businessName={settings.businessName} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 flex justify-center items-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-surface-container h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-surface-container rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-surface-container rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product || product.status !== 'active') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar businessName={settings.businessName} />
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 text-center">
          <div className="clinical-card p-8">
            <Pill className="w-16 h-16 text-outline mx-auto mb-4 stroke-[1.5]" />
            <h1 className="text-xl font-bold text-on-surface mb-2">Product Unavailable</h1>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              This product may have been deactivated or removed from our active wholesale catalog.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Catalog</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Products</span>
          </Link>
        </div>

        {/* Product Detail Card Container */}
        <div className="clinical-card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
            {/* Left Image View */}
            <div className="w-full h-80 sm:h-96 bg-surface-container-low rounded-xl relative flex items-center justify-center p-6 border border-surface-container">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-4"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-outline">
                  <Pill className="w-20 h-20 stroke-[1.5] mb-2 text-primary-container opacity-50" />
                  <span className="text-sm font-mono font-medium">No Image Available</span>
                </div>
              )}
            </div>

            {/* Right Product Information */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Brand & Stock Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider bg-surface-container px-2.5 py-1 rounded">
                    {product.brand}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                    Active Inventory
                  </span>
                </div>

                {/* Product Name */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-4">
                  {product.name}
                </h1>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 bg-surface-container-low p-4 rounded-xl border border-surface-container">
                  <div>
                    <span className="text-[11px] font-medium text-outline block uppercase tracking-wider">SKU Code</span>
                    <span className="text-xs font-mono font-bold text-on-surface">{product.sku}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-outline block uppercase tracking-wider">Pack Size</span>
                    <span className="text-xs font-semibold text-on-surface">{product.packCount}</span>
                  </div>
                  {product.mrp !== undefined && product.mrp !== null && (
                    <div>
                      <span className="text-[11px] font-medium text-outline block uppercase tracking-wider">MRP</span>
                      <span className="text-sm font-mono font-bold text-emerald-700">₹{Number(product.mrp).toFixed(2)}</span>
                    </div>
                  )}
                  {product.strength && (
                    <div>
                      <span className="text-[11px] font-medium text-outline block uppercase tracking-wider">Strength</span>
                      <span className="text-xs font-semibold text-on-surface">{product.strength}</span>
                    </div>
                  )}
                  {product.form && (
                    <div>
                      <span className="text-[11px] font-medium text-outline block uppercase tracking-wider">Form</span>
                      <span className="text-xs font-semibold text-on-surface">{product.form}</span>
                    </div>
                  )}
                  <div className="col-span-2 border-t border-surface-container pt-2 mt-1">
                    <span className="text-[11px] font-medium text-outline block uppercase tracking-wider">Category</span>
                    <span className="text-xs font-semibold text-primary">{product.categoryName || 'N/A'}</span>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Product Description</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Add to Cart Controls */}
              <div className="border-t border-surface-container pt-6 mt-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between border border-outline-variant rounded-xl bg-surface-container-low p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-surface-container text-on-surface rounded-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="px-4 text-center">
                      <span className="text-xs text-outline block uppercase text-[10px] font-semibold">Quantity</span>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center bg-transparent text-sm font-mono font-bold text-on-surface focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-surface-container text-on-surface rounded-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-md ${
                      added
                        ? 'bg-secondary text-white'
                        : 'bg-primary text-white hover:bg-primary-hover active:scale-[0.99]'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Add {quantity} {quantity === 1 ? 'Unit' : 'Units'} to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
