'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/storefront/Navbar'
import { Footer } from '@/components/storefront/Footer'
import { useCart } from '@/lib/context/CartContext'
import { getStoreSettings } from '@/lib/supabase/services'
import { StoreSettings } from '@/types'
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants/defaults'
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, 
  Package, ShieldCheck, Pill 
} from 'lucide-react'

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, totalLineItems, totalUnitsCount } = useCart()
  const [settings, setSettings] = useState<StoreSettings>({
    businessName: process.env.NEXT_PUBLIC_STORE_NAME || '',
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  })

  useEffect(() => {
    getStoreSettings().then((stg) => {
      if (stg) setSettings(stg)
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Browsing Catalog</span>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Order Cart</h1>
            <p className="text-xs text-on-surface-variant">
              Review your wholesale items before entering order contact information
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-error hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="clinical-card p-12 text-center max-w-md mx-auto my-8">
            <ShoppingBag className="w-16 h-16 text-outline mx-auto mb-4 stroke-[1.5]" />
            <h2 className="text-lg font-bold text-on-surface mb-2">Your Cart is Empty</h2>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              You have not added any medical wholesale items to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="clinical-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Item Image & Details */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-16 h-16 bg-surface-container-low rounded-lg relative overflow-hidden shrink-0 border border-surface-container flex items-center justify-center p-1">
                      <Image src={item.imageUrl || DEFAULT_PRODUCT_IMAGE} alt={item.name} fill className="object-contain" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                        {item.brand}
                      </span>
                      <h3 className="font-bold text-on-surface text-sm line-clamp-1">{item.name}</h3>
                      <div className="flex items-center gap-2 text-xs font-mono text-outline mt-0.5">
                        <span>SKU: {item.sku}</span>
                        <span>•</span>
                        <span>{item.packCount}</span>
                        {(
                          (item.salePrice !== undefined && item.salePrice !== null) ||
                          (item.mrp !== undefined && item.mrp !== null)
                        ) && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-2 flex-nowrap">
                              {item.salePrice !== undefined && item.salePrice !== null ? (
                                <span className="text-emerald-800 font-bold whitespace-nowrap">₹{Number(item.salePrice).toFixed(2)}</span>
                              ) : (
                                <span className="text-emerald-700 font-bold whitespace-nowrap">MRP: ₹{Number(item.mrp).toFixed(2)}</span>
                              )}
                              {item.salePrice !== undefined && item.salePrice !== null && item.mrp !== undefined && item.mrp !== null && (
                                <span className="text-on-surface-variant line-through text-[11px] ml-2 whitespace-nowrap inline-block">MRP ₹{Number(item.mrp).toFixed(2)}</span>
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-surface-container">
                    <div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-low overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 hover:bg-surface-container text-on-surface transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        className="w-12 text-center bg-transparent text-xs font-mono font-bold text-on-surface focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 hover:bg-surface-container text-on-surface transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-outline hover:text-error transition-colors rounded-lg hover:bg-red-50"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & Proceed to Checkout */}
            <div className="lg:col-span-1">
              <div className="clinical-card p-6 sticky top-24">
                <h2 className="text-base font-bold text-on-surface mb-4 pb-3 border-b border-surface-container">
                  Wholesale Summary
                </h2>

                <div className="space-y-3 text-xs mb-6">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Distinct Line Items:</span>
                    <span className="font-mono font-bold text-on-surface">{totalLineItems} Lines</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Total Order Quantity:</span>
                    <span className="font-mono font-bold text-primary">{totalUnitsCount} Units</span>
                  </div>
                  {cart.some((i) => (i.salePrice !== undefined && i.salePrice !== null) || (i.mrp !== undefined && i.mrp !== null)) && (
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Total Order Value:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ₹{cart.reduce((sum, item) => sum + ((item.salePrice ?? item.mrp) || 0) * item.quantity, 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-on-surface-variant border-t border-surface-container pt-3">
                    <span>Pricing Information:</span>
                    <span className="font-semibold text-secondary">Finalized via WhatsApp</span>
                  </div>
                </div>

                <div className="bg-surface-container-low p-3 rounded-lg text-xs text-on-surface-variant mb-6 border border-surface-container flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>Your cart is stored locally in your browser memory and will be sent directly to WhatsApp upon checkout.</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-hover transition-colors shadow-md"
                >
                  <span>Proceed to Contact Form</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
