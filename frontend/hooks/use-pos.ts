"use client"

import { useState, useCallback } from "react"
import type { CartItem, Sale, Product } from "@/lib/types"
import api from "@/lib/api"

export function usePOS() {
  const [cartItems, setCartItems] = useState<Map<string, CartItem>>(new Map())
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "debt">("cash")

  // Mahsulotni sahuga qo'shish
  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const newCart = new Map(prev)
      const existing = newCart.get(product.id)

      if (existing) {
        const newQty = existing.quantity + quantity
        if (newQty <= product.currentStock) {
          newCart.set(product.id, { ...existing, quantity: newQty })
        }
      } else {
        if (quantity <= product.currentStock) {
          newCart.set(product.id, { productId: product.id, quantity, discount: 0 })
        }
      }

      return newCart
    })
  }, [])

  // Sahutdan olib tashlash
  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => {
      const newCart = new Map(prev)
      newCart.delete(productId)
      return newCart
    })
  }, [])

  // Sahuning umumiy summasini hisoblash
  const calculateTotal = useCallback(
    (products: Product[]) => {
      let total = 0

      cartItems.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          total += product.sellPrice * item.quantity
        }
      })

      let finalTotal = total

      if (discountPercent > 0) {
        finalTotal = total - (total * discountPercent) / 100
      } else if (discountAmount > 0) {
        finalTotal = total - discountAmount
      }

      return {
        subtotal: total,
        discountAmount: discountPercent > 0 ? (total * discountPercent) / 100 : discountAmount,
        total: Math.max(0, finalTotal),
      }
    },
    [cartItems, discountAmount, discountPercent],
  )

  // Sahuni tozalash
  const clearCart = useCallback(() => {
    setCartItems(new Map())
    setDiscountAmount(0)
    setDiscountPercent(0)
  }, [])

  // Savdoni yakunlash
  const completeSale = useCallback(
    async (products: Product[], userId: string, customerId?: string, debtAmount?: number, branchId?: string) => {
      if (cartItems.size === 0) return null

      const cartArray = Array.from(cartItems.values())
      const totals = calculateTotal(products)

      const saleData = {
        customer: customerId || null,
        branch: branchId || null, // Added branch
        total_amount: totals.total,
        discount_amount: totals.discountAmount, // Added field
        payment_method: paymentMethod,
        items: cartArray.map(item => {
          const product = products.find(p => p.id === item.productId)
          const price = product?.sellPrice || 0
          return {
            product: item.productId,
            quantity: item.quantity,
            price: price,
            total: price * item.quantity // Required by serializer
          }
        }),
      }

      try {
        const response = await api.post('/sales/', saleData);

        // Sahu tozalash
        clearCart()

        return response.data;
      } catch (error) {
        console.error("Sale failed:", error)
        throw error;
      }
    },
    [cartItems, discountAmount, discountPercent, paymentMethod, calculateTotal, clearCart],
  )

  return {
    cartItems: Array.from(cartItems.values()),
    addToCart,
    removeFromCart,
    clearCart,
    calculateTotal,
    completeSale,
    setDiscountAmount,
    setDiscountPercent,
    discountAmount,
    discountPercent,
    paymentMethod,
    setPaymentMethod,
  }
}
