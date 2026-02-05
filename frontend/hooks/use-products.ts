"use client"

import { useState, useCallback, useEffect } from "react"
import type { Product } from "@/lib/types"
import api from "@/lib/api"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/');

      // Map Django snake_case to frontend camelCase
      // Django model: cost_price, sale_price, min_stock, stock
      // Frontend type: buyPrice, sellPrice, minStock, currentStock
      const mappedProducts: Product[] = response.data.results.map((p: any) => ({
        id: p.id,
        barcode: p.short_code, // Or handle multiple barcodes logic
        name: p.name,
        category: p.category,
        unit: p.sell_unit,
        buyPrice: Number(p.cost_price),
        sellPrice: Number(p.sale_price),
        minStock: Number(p.min_stock),
        currentStock: Number(p.stock),
        supplier: "Unknown", // Backend might not send supplier name directly in product list
        createdAt: p.created_at,
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await api.delete(`/products/${id}/`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  }, []);

  const addProduct = useCallback(async (productData: any) => {
    try {
      const payload = {
        name: productData.name,
        category: productData.category,
        sale_price: productData.sellPrice,
        cost_price: productData.buyPrice,
        min_stock: productData.minStock,
        stock: productData.currentStock,
        sell_unit: productData.unit,
        base_unit: productData.unit, // Default to same for now
        unit_ratio: 1,
        branch: 1 // Default branch ID, or fetch from user context later
      };
      const response = await api.post('/products/', payload);
      setProducts(prev => [response.data].concat(prev));
      return response.data;
    } catch (error) {
      console.error("Failed to add product:", error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (product: Product) => {
    try {
      // Map frontend camelCase back to snake_case for Django
      const payload = {
        name: product.name,
        category: product.category,
        sale_price: product.sellPrice,
        cost_price: product.buyPrice,
        min_stock: product.minStock,
        stock: product.currentStock,
        sell_unit: product.unit
      };

      await api.patch(`/products/${product.id}/`, payload);

      // Update local state optimistic or fetch fresh
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    } catch (error) {
      console.error("Failed to update product:", error);
      // Revert or show error
    }
  }, [])

  const getProductByBarcode = useCallback((barcode: string) => products.find((p) => p.barcode === barcode), [products])

  // Stats State
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    avgMargin: 0
  })

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/products/stats/')
      setStats(response.data)
    } catch (e) {
      console.error("Failed to fetch stats", e)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    products,
    loading,
    stats, // Return stats
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByBarcode,
    refreshProducts: () => { fetchProducts(); fetchStats(); }
  }
}
