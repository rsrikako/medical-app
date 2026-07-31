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

  cart.forEach((item, idx) => {
    message += `${idx + 1}. ${item.name}\n`
    message += `   Brand: ${item.brand}\n`
    message += `   Pack: ${item.packCount}\n`
    if (item.strength) {
      message += `   Strength: ${item.strength}\n`
    }
    if (item.mrp !== undefined && item.mrp !== null) {
      const lineMrp = item.mrp * item.quantity
      totalMrp += lineMrp
      message += `   MRP: ₹${item.mrp.toFixed(2)} (Subtotal: ₹${lineMrp.toFixed(2)})\n`
    }
    message += `   SKU: ${item.sku}\n`
    message += `   Quantity: ${item.quantity}\n\n`
  })

  if (totalMrp > 0) {
    message += `TOTAL ORDER MRP VALUE: ₹${totalMrp.toFixed(2)}\n\n`
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
