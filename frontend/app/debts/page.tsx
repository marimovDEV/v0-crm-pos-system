"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useDebts } from "@/hooks/use-debts"
import { AlertTriangle, Clock, DollarSign, TrendingUp } from "lucide-react"
import { RoleGate } from "@/components/role-gate"

export default function DebtsPage() {
  const { user } = useAuth()
  const { debts, totalDebt, overdueDebt, payDebt, addDebt } = useDebts()
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    amount: "",
    dueDate: "",
    notes: "",
  })
  const [payAmounts, setPayAmounts] = useState({}) // New state to hold pay amounts for each debt

  const filteredDebts = debts.filter((d) => d.customerName.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleAddDebt = () => {
    if (formData.customerName && formData.amount) {
      addDebt({
        id: "",
        customerId: formData.customerName, // This logic needs backend support later
        customerName: formData.customerName,
        amount: Number(formData.amount),
        dueDate: formData.dueDate || new Date().toISOString().split("T")[0],
        paidAmount: 0,
        status: "active",
        createdAt: new Date().toISOString(),
      })
      setFormData({ customerName: "", amount: "", dueDate: "", notes: "" })
      setShowForm(false)
    }
  }

  const handlePayment = (debtId: string, amount: string) => {
    const paidAmount = Number(amount)
    if (paidAmount > 0) {
      payDebt(debtId, paidAmount)
      setPayAmounts((prev) => ({ ...prev, [debtId]: "" })) // Reset pay amount after payment
    }
  }

  return (
    <RoleGate user={user} allowedRoles={["admin", "super-admin"]}>
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 sticky top-0 z-10">
          <h1 className="text-2xl font-bold mb-2">Qarzdorlik Boshqaruvi</h1>
          <p className="text-slate-200 text-sm">Mijozlar qarzdorligini kuzatish va to'lovlarni boshqarish</p>
        </div>

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Jami qarz</p>
                    <p className="text-2xl font-bold text-red-600">{totalDebt.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Muddati o'tgan</p>
                    <p className="text-2xl font-bold text-orange-600">{overdueDebt.toLocaleString()}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Faol qarzdorlar</p>
                    <p className="text-2xl font-bold">{debts.filter((d) => d.status !== "paid").length}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overdue Warning */}
          {debts.filter((d) => d.status === "overdue").length > 0 && (
            <Card className="mb-6 bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex gap-2 items-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-900">
                      {debts.filter((d) => d.status === "overdue").length} ta muddati o'tgan qarz bor!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Debt Button */}
          <div className="mb-6">
            <Button onClick={() => setShowForm(!showForm)} className="bg-slate-600 hover:bg-slate-700">
              Yangi Qarz Qo'shish
            </Button>
          </div>

          {/* Add Debt Form */}
          {showForm && (
            <Card className="mb-6">
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold">Mijoz nomi:</label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Mijozning nomi"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Qarz summa:</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">To'lash muddata:</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddDebt} className="bg-green-600 hover:bg-green-700">
                    Saqlash
                  </Button>
                  <Button onClick={() => setShowForm(false)} variant="outline">
                    Bekor
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Qarzdorlar Ro'yxati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Mijozni izlash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-semibold">Mijoz</th>
                      <th className="text-right p-3 font-semibold">Qarz</th>
                      <th className="text-right p-3 font-semibold">To'lab olgan</th>
                      <th className="text-right p-3 font-semibold">Qolgan</th>
                      <th className="text-center p-3 font-semibold">Xolati</th>
                      <th className="text-left p-3 font-semibold">Muddat</th>
                      <th className="text-center p-3 font-semibold">To'lov</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredDebts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-muted-foreground">
                          Qarz topilmadi
                        </td>
                      </tr>
                    ) : (
                      filteredDebts.map((debt) => {
                        const remaining = debt.amount - debt.paidAmount
                        const payAmount = payAmounts[debt.id] || ""

                        return (
                          <tr key={debt.id} className="hover:bg-slate-50">
                            <td className="p-3 font-medium">{debt.customerName}</td>
                            <td className="p-3 text-right">{debt.amount.toLocaleString()}</td>
                            <td className="p-3 text-right text-green-600 font-semibold">
                              {debt.paidAmount.toLocaleString()}
                            </td>
                            <td className="p-3 text-right text-red-600 font-bold">{remaining.toLocaleString()}</td>
                            <td className="p-3 text-center">
                              <Badge variant={debt.status === "paid" ? "default" : "destructive"} className="text-xs">
                                {debt.status === "paid"
                                  ? "To'lab olgan"
                                  : debt.status === "overdue"
                                    ? "Muddati o'tgan"
                                    : "Faol"}
                              </Badge>
                            </td>
                            <td className="p-3 text-xs">{debt.dueDate}</td>
                            <td className="p-3 text-center">
                              {remaining > 0 && (
                                <div className="flex gap-1 items-center justify-center">
                                  <Input
                                    type="number"
                                    value={payAmount}
                                    onChange={(e) => setPayAmounts({ ...payAmounts, [debt.id]: e.target.value })}
                                    placeholder="0"
                                    className="w-20 h-7 text-xs"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handlePayment(debt.id, payAmount)}
                                    className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                  >
                                    To'la
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })
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
