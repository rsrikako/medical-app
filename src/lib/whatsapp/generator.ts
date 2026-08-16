import { CartItem, CheckoutDetails } from '@/types'

export function generateWhatsAppMessage(
  details: CheckoutDetails,
  cart: CartItem[]
): string {
  let message = `Hello, I would like to place a wholesale order.\n\n`
  message += `Business Name: ${details.customerName.trim()}\n`
  message += `Contact Person: ${details.contactPerson.trim()}\n`
  message += `Phone: ${details.phone.trim()}\n`

  if (details.gstNumber && details.gstNumber.trim()) {
    message += `GST Number: ${details.gstNumber.trim()}\n`
  }

  message += `\nORDER DETAILS\n\n`

  let totalMrp = 0
  let totalPrice = 0

  cart.forEach((item, idx) => {
    message += `${idx + 1}. ${item.name}\n`
    message += `   Brand: ${item.brand}\n`
    message += `   Pack: ${item.packCount}\n`
    if (item.strength) {
      message += `   Strength: ${item.strength}\n`
    }
    // Prefer salePrice for customer-facing subtotal if available
    const unitPrice = item.salePrice !== undefined && item.salePrice !== null ? item.salePrice : item.mrp
    if (unitPrice !== undefined && unitPrice !== null) {
      const line = unitPrice * item.quantity
      totalPrice += line
      const label = item.salePrice !== undefined && item.salePrice !== null ? 'Sale Price' : 'MRP'
      message += `   ${label}: ₹${unitPrice.toFixed(2)} (Subtotal: ₹${line.toFixed(2)})\n`
    }
    message += `   SKU: ${item.sku}\n`
    message += `   Quantity: ${item.quantity}\n\n`
  })

  if (totalPrice > 0) {
    message += `TOTAL ORDER VALUE: ₹${totalPrice.toFixed(2)}\n\n`
  }

  if (details.deliveryAddress && details.deliveryAddress.trim()) {
    message += `Delivery Address: ${details.deliveryAddress.trim()}\n\n`
  }

  if (details.notes && details.notes.trim()) {
    message += `Notes: ${details.notes.trim()}\n`
  }

  return message
}

export function buildWhatsAppLink(whatsappNumber: string, message: string): string {
  // Clean phone number (strip non-digits)
  const cleanNumber = whatsappNumber.replace(/\D/g, '')
  const encodedText = encodeURIComponent(message)
  return `https://wa.me/${cleanNumber}?text=${encodedText}`
}
