'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/storefront/Navbar'
import { Footer } from '@/components/storefront/Footer'
import { useCart } from '@/lib/context/CartContext'
import { getStoreSettings } from '@/lib/supabase/services'
import { generateWhatsAppMessage, buildWhatsAppLink } from '@/lib/whatsapp/generator'
import { CheckoutDetails, StoreSettings } from '@/types'
import { 
  ArrowLeft, Send, ShieldCheck, Building2, User, Phone, 
  MapPin, FileText, Lock, MessageSquare 
} from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, totalLineItems, totalUnitsCount } = useCart()

  const [settings, setSettings] = useState<StoreSettings>({
    businessName: process.env.NEXT_PUBLIC_STORE_NAME || '',
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  })

  const [formData, setFormData] = useState<CheckoutDetails>({
    customerName: '',
    contactPerson: '',
    phone: '',
    deliveryAddress: '',
    gstNumber: '',
    notes: '',
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    getStoreSettings().then((stg) => {
      if (stg) setSettings(stg)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Business/Customer name is required'
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitWhatsApp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    if (cart.length === 0) return

    const messageText = generateWhatsAppMessage(formData, cart)
    const whatsappUrl = buildWhatsAppLink(settings.whatsappNumber, messageText)

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank')
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar businessName={settings.businessName} />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-16 text-center">
          <div className="clinical-card p-8">
            <h2 className="text-lg font-bold text-on-surface mb-2">No Items in Cart</h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Please add products to your cart before proceeding to WhatsApp checkout.
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2">
            <div className="clinical-card p-6 sm:p-8">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-surface-container">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-on-surface">WhatsApp Order Handoff</h1>
                  <p className="text-xs text-on-surface-variant">
                    Enter basic contact info to build your prefilled WhatsApp order message
                  </p>
                </div>
              </div>

              {/* Privacy Notice Banner */}
              <div className="bg-surface-container-low p-3.5 rounded-lg mb-6 text-xs text-on-surface-variant flex items-start gap-2.5 border border-surface-container">
                <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong className="text-on-surface font-semibold">Zero Server Storage:</strong> Your contact details and cart items are stored strictly in your browser memory and will not be saved to any database.
                </p>
              </div>

              <form onSubmit={handleSubmitWhatsApp} className="space-y-4">
                {/* Customer / Business Name */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Business / Pharmacy Name <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="text"
                      name="customerName"
                      placeholder="e.g. ABC Medical Store"
                      value={formData.customerName}
                      onChange={handleChange}
                      className="clinical-input pl-10"
                    />
                  </div>
                  {errors.customerName && (
                    <p className="text-xs text-error mt-1 font-medium">{errors.customerName}</p>
                  )}
                </div>

                {/* Contact Person & Phone row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                      Contact Person Name <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        type="text"
                        name="contactPerson"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        className="clinical-input pl-10"
                      />
                    </div>
                    {errors.contactPerson && (
                      <p className="text-xs text-error mt-1 font-medium">{errors.contactPerson}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                      WhatsApp Phone Number <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input
                        type="text"
                        name="phone"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        className="clinical-input pl-10 font-mono text-xs"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-error mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* GST Number (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    GST Number <span className="text-outline text-[10px] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="text"
                      name="gstNumber"
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="clinical-input pl-10 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Delivery Address (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Delivery Address <span className="text-outline text-[10px] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-outline" />
                    <textarea
                      name="deliveryAddress"
                      rows={2}
                      placeholder="e.g. Plot 45, Commercial Complex, Sector 12..."
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      className="clinical-input pl-10 py-2"
                    ></textarea>
                  </div>
                </div>

                {/* Additional Notes (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Additional Instructions / Notes <span className="text-outline text-[10px] font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="e.g. Urgent dispatch requested / Please check expiry dates..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="clinical-input"
                  ></textarea>
                </div>

                {/* WhatsApp Submit CTA */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-whatsapp hover:bg-whatsapp-hover text-white font-bold text-base rounded-xl transition-all shadow-lg active:scale-[0.99]"
                  >
                    <Send className="w-5 h-5 fill-current" />
                    <span>Send Order on WhatsApp</span>
                  </button>
                  <p className="text-center text-[11px] text-outline mt-2">
                    Clicking will open WhatsApp/WhatsApp Web with your order prefilled
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="clinical-card p-6 sticky top-24">
              <h3 className="text-sm font-bold text-on-surface mb-3 pb-2 border-b border-surface-container">
                Order Items ({totalLineItems})
              </h3>

              <div className="max-h-64 overflow-y-auto space-y-2 mb-4 pr-1">
                {cart.map((item) => (
                  <div key={item.productId} className="text-xs bg-surface-container-low p-2.5 rounded-lg">
                    <div className="font-bold text-on-surface line-clamp-1">{item.name}</div>
                    <div className="flex justify-between text-outline mt-1 font-mono text-[11px]">
                      <span>
                        SKU: {item.sku}
                        {((item.salePrice !== undefined && item.salePrice !== null) || (item.mrp !== undefined && item.mrp !== null)) && (
                          <>
                            {' '}
                            •{' '}
                            <span className="flex items-center gap-2 flex-nowrap">
                              {item.salePrice !== undefined && item.salePrice !== null ? (
                                <span className="whitespace-nowrap">Sale: ₹{item.salePrice.toFixed(2)}</span>
                              ) : (
                                <span className="whitespace-nowrap">MRP: ₹{item.mrp!.toFixed(2)}</span>
                              )}
                              {item.salePrice !== undefined && item.salePrice !== null && item.mrp !== undefined && item.mrp !== null && (
                                <span className="text-on-surface-variant line-through text-[11px] ml-2 whitespace-nowrap inline-block">MRP ₹{Number(item.mrp).toFixed(2)}</span>
                              )}
                            </span>
                          </>
                        )}
                      </span>
                      <span className="font-bold text-primary">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-surface-container pt-3 space-y-1.5 text-xs text-on-surface-variant">
                <div className="flex justify-between font-medium">
                  <span>Total Line Items:</span>
                  <span className="font-mono font-bold text-on-surface">{totalLineItems}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Units:</span>
                  <span className="font-mono font-bold text-primary">{totalUnitsCount}</span>
                </div>
                {cart.some((i) => (i.salePrice !== undefined && i.salePrice !== null) || (i.mrp !== undefined && i.mrp !== null)) && (
                  <div className="flex justify-between font-medium pt-1 border-t border-surface-container/60">
                    <span>Total Order Value:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      ₹{cart.reduce((sum, item) => sum + ((item.salePrice ?? item.mrp) || 0) * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
