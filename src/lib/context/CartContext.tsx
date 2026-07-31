'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { CartItem, Product } from '@/types'

const CART_STORAGE_KEY = 'pharmdirect_cart_v1'

interface CartContextType {
  cart: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  totalLineItems: number
  totalUnitsCount: number
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  totalLineItems: 0,
  totalUnitsCount: 0,
})

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        setCart(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage when cart changes
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err)
    }
  }, [cart, isLoaded])

  const addItem = (product: Product, quantity = 1) => {
    if (quantity <= 0) return
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.productId === product.id)
      if (existingIndex > -1) {
        const updated = [...prevCart]
        updated[existingIndex].quantity += quantity
        return updated
      }
      return [
        ...prevCart,
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          strength: product.strength,
          packCount: product.packCount,
          mrp: product.mrp,
          quantity,
          imageUrl: product.imageUrl,
        },
      ]
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    )
  }

  const removeItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const totalLineItems = cart.length
  const totalUnitsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalLineItems,
        totalUnitsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
