"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { AlertCircle, Package, Users, DollarSign, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from "@/hooks/use-products"
import { useDebts } from "@/hooks/use-debts"
import { RoleGate } from "@/components/role-gate"

export default function DashboardPage() {
  const { user } = useAuth()
  const { products, loading: productsLoading } = useProducts()
  const { debts, totalDebt, overdueDebt } = useDebts()

  // Hisob-kitoblar
  const stats = useMemo(() => {
    const totalInventoryValue = products.reduce((sum, p) => sum + p.sellPrice * p.currentStock, 0)
    const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length
    const totalProducts = products.length

    return {
      totalInventoryValue,
      lowStockCount,
      totalProducts,
      totalDebts: totalDebt,
      overdueDebts: overdueDebt,
      activeCustomers: debts.filter((d) => d.status === "active").length,
    }
  }, [products, debts, totalDebt, overdueDebt])

  // Kategoriya bo'yicha mahsulotlar
  const categoryData = useMemo(() => {
    const categories = new Map<string, number>()
    products.forEach((p) => {
      categories.set(p.category, (categories.get(p.category) || 0) + p.currentStock)
    })
    return Array.from(categories.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [products])

  // So'ngi 6 kunning savdo trendi (mock data)
  const salesTrend = useMemo(() => {
    const days = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Sha"]
    return days.map((day, i) => ({
      day,
      sales: Math.floor(Math.random() * 50000) + 20000,
      orders: Math.floor(Math.random() * 30) + 10,
    }))
  }, [])

  // Top 5 kam qoldiq mahsulotlar
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => p.currentStock <= p.minStock)
      .sort((a, b) => a.currentStock - b.currentStock)
      .slice(0, 5)
  }, [products])

  // Top 5 qimmatli mahsulotlar
  const topValueProducts = useMemo(() => {
    return products.sort((a, b) => b.sellPrice * b.currentStock - a.sellPrice * a.currentStock).slice(0, 5)
  }, [products])

  const COLORS = ["#475569", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#06b6d4"]

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-300 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-slate-600">Yuklanyapti...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGate user={user} allowedRoles={["admin", "super-admin"]}>
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 sticky top-0 z-10">
          <h1 className="text-2xl font-bold mb-1">Bosh Panel</h1>
          <p className="text-slate-200 text-sm">Xush kelibsiz, {user?.name}! Bugungi kunning statistikasi</p>
        </div>

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Inventory Value */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Zaxira Qiymati</CardTitle>
                <Package className="w-5 h-5 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInventoryValue.toLocaleString()}</div>
                <p className="text-xs text-slate-600 mt-1">{stats.totalProducts} ta mahsulot</p>
              </CardContent>
            </Card>

            {/* Total Debts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami Qarz</CardTitle>
                <DollarSign className="w-5 h-5 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.totalDebts.toLocaleString()}</div>
                <p className="text-xs text-red-600 mt-1">{stats.overdueDebts.toLocaleString()} muddati o'tgan</p>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kam Qoldiq</CardTitle>
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Darhol qo'shish kerak</p>
              </CardContent>
            </Card>

            {/* Active Customers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faol Qarzdorlar</CardTitle>
                <Users className="w-5 h-5 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">Qarz to'lovini kutayotgan</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Savdo Trendi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      stroke="#475569"
                      strokeWidth={2}
                      name="Savdo (so'm)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Cheklar"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Kategoriya Taqsimoti</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Data Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Kam Qoldiq Mahsulotlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Kam qoldiq mahsulot yo'q</p>
                ) : (
                  <div className="space-y-3">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive" className="text-xs">
                            {product.currentStock}/{product.minStock}
                          </Badge>
                          <p className="text-xs font-semibold mt-1">{product.supplier}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Value Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Eng Qimmatli Mahsulotlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topValueProducts.slice(0, 5).map((product) => {
                    const value = product.sellPrice * product.currentStock
                    return (
                      <div key={product.id} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.currentStock} ta</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{value.toLocaleString()}</p>
                          <p className="text-xs text-slate-600">{product.sellPrice.toLocaleString()}/ta</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </RoleGate>
  )
}
