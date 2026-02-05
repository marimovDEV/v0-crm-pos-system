"use client"

import { useMemo, useState, useEffect } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, Calendar } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from "@/hooks/use-products"
import { RoleGate } from "@/components/role-gate"

export default function ReportsPage() {
  const { user } = useAuth()
  const { products } = useProducts()

  const stats = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + p.sellPrice * p.currentStock, 0)
    const totalBuyValue = products.reduce((sum, p) => sum + p.buyPrice * p.currentStock, 0)
    const potentialProfit = totalValue - totalBuyValue

    const categoryRevenue = new Map<string, number>()
    products.forEach((p) => {
      const revenue = p.sellPrice * p.currentStock
      categoryRevenue.set(p.category, (categoryRevenue.get(p.category) || 0) + revenue)
    })

    const chartData = Array.from(categoryRevenue.entries()).map(([category, revenue]) => ({
      category,
      revenue,
      orders: Math.floor(revenue / 5000) + 1,
    }))

    return {
      totalValue,
      totalBuyValue,
      potentialProfit,
      profitMargin: totalValue > 0 ? ((potentialProfit / totalValue) * 100).toFixed(1) : "0",
      categoryData: Array.from(categoryRevenue.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      chartData,
    }
  }, [products])

  // Real Sales Data
  const [salesData, setSalesData] = useState<any[]>([])

  useMemo(() => {
    const fetchSales = async () => {
      try {
        const response = await api.get('/sales/');
        setSalesData(response.data.results || response.data);
      } catch (error) {
        console.error("Failed to fetch sales for reports:", error);
      }
    };
    fetchSales();
  }, []);

  const salesTrend = useMemo(() => {
    // Group sales by date for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const statsByDate = new Map<string, { revenue: number, orders: number }>();
    last7Days.forEach(date => statsByDate.set(date, { revenue: 0, orders: 0 }));

    salesData.forEach((sale: any) => {
      const date = sale.created_at?.split('T')[0] || sale.date; // Handle both formats if needed
      if (statsByDate.has(date)) {
        const current = statsByDate.get(date);
        if (current) {
          statsByDate.set(date, {
            revenue: current.revenue + Number(sale.total_amount),
            orders: current.orders + 1
          });
        }
      }
    });

    return last7Days.map(date => ({
      day: date, // Format as needed, e.g. 'MM-DD'
      revenue: statsByDate.get(date)?.revenue || 0,
      orders: statsByDate.get(date)?.orders || 0,
    }));
  }, [salesData]);

  // Top mahsulotlar (Real data from product stock value)
  const topProducts = useMemo(
    () =>
      products
        .sort((a, b) => b.sellPrice * b.currentStock - a.sellPrice * a.currentStock)
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          name: p.name,
          revenue: p.sellPrice * p.currentStock,
          units: p.currentStock,
        })),
    [products],
  )

  const COLORS = ["#475569", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#06b6d4"]

  return (
    <RoleGate user={user} allowedRoles={["admin", "super-admin"]}>
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 sticky top-0 z-10">
          <h1 className="text-2xl font-bold mb-1">Hisobotlar va Tahlillar</h1>
          <p className="text-slate-200 text-sm">Jami biznes tahlili va ma'lumotlari</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div></div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Calendar size={18} />
                Oxirgi 6 oy
              </Button>
              <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
                <Download size={18} />
                Eksport
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Jami Zaxira Qiymati</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()}</div>
                <p className="text-xs text-slate-600 mt-1">so'm</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Oldingi Xarajat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBuyValue.toLocaleString()}</div>
                <p className="text-xs text-slate-600 mt-1">so'm</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Potentsial Foyda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.potentialProfit.toLocaleString()}</div>
                <p className="text-xs text-green-600 mt-1">{stats.profitMargin}% margin</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Jami Mahsulotlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-slate-600 mt-1">aktiv kataloq</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart */}
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
                      dataKey="revenue"
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

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Kategoriya Taqsimoti</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart - Category Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Kategoriya Bo'yicha Daromad</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#475569" name="Daromad (so'm)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Eng Yaxshi Mahsulotlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.units} ta mahsulot</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{product.revenue.toLocaleString()} so'm</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </RoleGate>
  )
}
