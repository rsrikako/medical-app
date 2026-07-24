import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import { CartProvider } from '@/lib/context/CartContext'

export const metadata: Metadata = {
  title: 'PharmDirect B2B | Medical Wholesale Catalog & WhatsApp Ordering',
  description: 'Browse wholesale medical products, tablets, capsules, and supplies. Build your bulk order and submit instantly via WhatsApp.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-background text-on-surface flex flex-col antialiased">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
