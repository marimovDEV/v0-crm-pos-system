"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from "@/hooks/use-products"
import { Plus, AlertTriangle, PackageOpen, TrendingDown } from "lucide-react"
import { RoleGate } from "@/components/role-gate"

export default function InventoryPage() {
  const { user } = useAuth()
  const { products, updateProduct } = useProducts()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedQuantity, setEditedQuantity] = useState("")

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Kam qoldiq mahsulotlar
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock)

  const handleUpdateStock = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      updateProduct({ ...product, currentStock: Math.max(0, newQuantity) })
      setEditingId(null)
    }
  }

  const handleAddStock = (productId: string, amount: number) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      updateProduct({ ...product, currentStock: product.currentStock + amount })
    }
  }

  return (
    <RoleGate user={user} allowedRoles={["admin", "omborchi", "super-admin"]}>
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 sticky top-0 z-10">
          <h1 className="text-2xl font-bold mb-2">Ombor Boshqaruvi</h1>
          <p className="text-slate-200 text-sm">Mahsulot inventarizatsiyasi va qoldiqni nazorat qiling</p>
        </div>

        <div className="p-6">
          {/* Low Stock Warning */}
          {lowStockProducts.length > 0 && (
            <Card className="mb-6 bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Kam qoldiq mahsulotlar!</h3>
                    <p className="text-sm text-red-700">
                      {lowStockProducts.length} ta mahsulot o'z minimalning ostida:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lowStockProducts.map((p) => (
                        <span key={p.id} className="bg-white px-2 py-1 rounded text-xs font-semibold text-red-700">
                          {p.name} ({p.currentStock}/{p.minStock})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Mahsulot nomini izlash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Mahsulotlar Ro'yxati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-semibold">Mahsulot nomi</th>
                      <th className="text-left p-3 font-semibold">Kategoriya</th>
                      <th className="text-right p-3 font-semibold">Sotish narxi</th>
                      <th className="text-center p-3 font-semibold">Qoldiq</th>
                      <th className="text-center p-3 font-semibold">Minimal</th>
                      <th className="text-center p-3 font-semibold">Xolati</th>
                      <th className="text-center p-3 font-semibold">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-muted-foreground">
                          Mahsulot topilmadi
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50">
                          <td className="p-3 font-medium">{product.name}</td>
                          <td className="p-3 text-muted-foreground text-xs">{product.category}</td>
                          <td className="p-3 text-right font-semibold text-slate-600">
                            {product.sellPrice.toLocaleString()} so'm
                          </td>
                          <td className="p-3 text-center">
                            {editingId === product.id ? (
                              <input
                                type="number"
                                value={editedQuantity}
                                onChange={(e) => setEditedQuantity(e.target.value)}
                                className="w-16 px-2 py-1 border rounded text-center"
                                min="0"
                              />
                            ) : (
                              <span className="font-bold text-lg">{product.currentStock}</span>
                            )}
                          </td>
                          <td className="p-3 text-center text-muted-foreground">{product.minStock}</td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={product.currentStock > product.minStock ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {product.currentStock > product.minStock ? "OK" : "Past"}
                            </Badge>
                          </td>
                          <td className="p-3 text-center space-x-1">
                            {editingId === product.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleUpdateStock(product.id, Number(editedQuantity))}
                                  className="text-xs h-7"
                                >
                                  Saqlash
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingId(null)}
                                  className="text-xs h-7"
                                >
                                  Bekor
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingId(product.id)
                                    setEditedQuantity(product.currentStock.toString())
                                  }}
                                  className="text-xs h-7"
                                >
                                  O'zgartir
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleAddStock(product.id, 10)}
                                  className="text-xs h-7"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Jami mahsulotlar</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                  <PackageOpen className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Jami qoldiq narxi</p>
                    <p className="text-2xl font-bold">
                      {products.reduce((sum, p) => sum + p.sellPrice * p.currentStock, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-amber-100 rounded-lg" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Kam qoldiq</p>
                    <p className="text-2xl font-bold text-red-600">{lowStockProducts.length}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </RoleGate>
  )
}
