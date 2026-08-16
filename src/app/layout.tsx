import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import { CartProvider } from '@/lib/context/CartContext'
import VersionChecker from '@/components/VersionChecker'
import { StoreSettingsProvider } from '@/lib/context/StoreSettingsContext'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || ''

export const metadata: Metadata = {
  title: `${storeName ? `${storeName} | ` : ''}Medical Wholesale Catalog & WhatsApp Ordering`,
  description: storeName
    ? `Browse wholesale medical products, tablets, capsules, and supplies from ${storeName} in Anakapalli. Build your bulk order and submit instantly via WhatsApp.`
    : 'Browse wholesale medical products, tablets, capsules, and supplies. Build your bulk order and submit instantly via WhatsApp.',
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
          <CartProvider>
            <StoreSettingsProvider>
              <VersionChecker />
              {children}
            </StoreSettingsProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
