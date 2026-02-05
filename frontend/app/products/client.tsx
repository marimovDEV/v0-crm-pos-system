"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Search } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { useAuth } from "@/hooks/use-auth"
import { RoleGate } from "@/components/role-gate"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const categories = ["Barchasi", "Sement", "Agregat", "Plitkalar", "Izolyatsiya", "Metall"]

function StockStatusBadge({ stock, minStock }: { stock: number; minStock: number }) {
  if (stock <= minStock) {
    return <Badge variant="destructive">Zaxira Kam</Badge>
  }
  if (stock <= minStock * 1.5) {
    return (
      <Badge variant="outline" className="border-amber-500 text-amber-700">
        O'rtacha
      </Badge>
    )
  }
  return <Badge variant="secondary">Zaxirada</Badge>
}

function ProfitMargin({ sellPrice, buyPrice }: { sellPrice: number; buyPrice: number }) {
  const margin = (((sellPrice - buyPrice) / sellPrice) * 100).toFixed(0)
  return <span className="text-sm font-medium text-green-600">{margin}%</span>
}

export function ProductsClient() {
  const { user } = useAuth()
  const { products, updateProduct, deleteProduct, addProduct, stats, loading } = useProducts()
  // Add Product Modal State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Sement",
    sellPrice: 0,
    buyPrice: 0,
    currentStock: 0,
    minStock: 10,
    unit: "dona"
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Barchasi")
  // Add Product Submit Handler
  const handleAddProduct = async () => {
    try {
      await addProduct(newProduct)
      setIsAddOpen(false)
      setNewProduct({
        name: "",
        category: "Sement",
        sellPrice: 0,
        buyPrice: 0,
        currentStock: 0,
        minStock: 10,
        unit: "dona"
      })
      // Optional: Add success toast
    } catch (e) {
      alert("Xatolik yuz berdi!")
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.barcode.includes(searchQuery)
    const matchesCategory = selectedCategory === "Barchasi" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = async (id: string) => {
    if (confirm("Mahsulotni o'chirishni xohlaysizmi?")) {
      await deleteProduct(id)
    }
  }

  return (
    <RoleGate user={user} allowedRoles={["admin", "omborchi", "super-admin"]}>
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Mahsulotlar va Inventar</h1>
            <p className="text-slate-200 text-sm">Mahsulot kataloginizi va zaxira darajasini boshqaring</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold">
                + Yangi Mahsulot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi Mahsulot Qo'shish</DialogTitle>
                <DialogDescription>Mahsulot ma'lumotlarini kiriting</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nomi</Label>
                  <Input id="name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Toifa</Label>
                  <select
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    {categories.filter(c => c !== "Barchasi").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sellPrice" className="text-right">Sotish Narxi</Label>
                  <Input id="sellPrice" type="number" value={newProduct.sellPrice} onChange={e => setNewProduct({ ...newProduct, sellPrice: Number(e.target.value) })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="buyPrice" className="text-right">Olish Narxi</Label>
                  <Input id="buyPrice" type="number" value={newProduct.buyPrice} onChange={e => setNewProduct({ ...newProduct, buyPrice: Number(e.target.value) })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">Birlik</Label>
                  <select
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newProduct.unit}
                    onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                  >
                    <option value="dona">Dona</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="m">Metr (m)</option>
                    <option value="m2">Kvadrat metr (m2)</option>
                    <option value="m3">Kub metr (m3)</option>
                    <option value="qop">Qop</option>
                    <option value="rulon">Rulon</option>
                    <option value="bank">Bank</option>
                    <option value="korobka">Korobka</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Boshlang'ich Zaxira</Label>
                  <Input id="stock" type="number" value={newProduct.currentStock} onChange={e => setNewProduct({ ...newProduct, currentStock: Number(e.target.value) })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minstock" className="text-right">Min Zaxira</Label>
                  <Input id="minstock" type="number" value={newProduct.minStock} onChange={e => setNewProduct({ ...newProduct, minStock: Number(e.target.value) })} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddProduct} type="submit">Saqlash</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Jami Mahsulotlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Jami Zaxira Qiymati</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.totalValue / 1000000).toFixed(1)}M</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Kam Zaxira Tovarlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.lowStockCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">O'rtacha Foyda Marjasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgMargin}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="Mahsulot nomi yoki barcode bilan izlash..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? "bg-slate-600 text-white" : ""}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Mahsulotlar Ro'yxati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Mahsulot</th>
                      <th className="text-left py-3 px-4 font-semibold">Toifa</th>
                      <th className="text-right py-3 px-4 font-semibold">Sotish Narxi</th>
                      <th className="text-right py-3 px-4 font-semibold">Xaraj</th>
                      <th className="text-right py-3 px-4 font-semibold">Marjasi</th>
                      <th className="text-right py-3 px-4 font-semibold">Qoldiq</th>
                      <th className="text-center py-3 px-4 font-semibold">Xolati</th>
                      <th className="text-left py-3 px-4 font-semibold">Ta'minotchi</th>
                      <th className="text-center py-3 px-4 font-semibold">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-muted-foreground">
                          Mahsulot topilmadi
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.barcode}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{product.category}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">{product.sellPrice.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            {product.buyPrice.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <ProfitMargin sellPrice={product.sellPrice} buyPrice={product.buyPrice} />
                          </td>
                          <td className="py-3 px-4 text-right font-medium">{product.currentStock}</td>
                          <td className="py-3 px-4 text-center">
                            <StockStatusBadge stock={product.currentStock} minStock={product.minStock} />
                          </td>
                          <td className="py-3 px-4 text-sm">{product.supplier}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit2 size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </RoleGate>
  )
}
