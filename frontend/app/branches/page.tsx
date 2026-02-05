"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Building2, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { RoleGate } from "@/components/role-gate"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Branch {
    id: number
    name: string
    address: string
    phone: string
}

export default function BranchesPage() {
    const { user } = useAuth()
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newBranch, setNewBranch] = useState({ name: "", address: "", phone: "" })

    const fetchBranches = async () => {
        try {
            const res = await api.get("/branches/")
            setBranches(res.data.results || res.data)
        } catch (error) {
            console.error("Failed to fetch branches", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBranches()
    }, [])

    const handleAddBranch = async () => {
        try {
            await api.post("/branches/", newBranch)
            setIsAddOpen(false)
            fetchBranches() // Refresh list
            setNewBranch({ name: "", address: "", phone: "" })
        } catch (error) {
            alert("Xatolik yuz berdi")
        }
    }

    const handleDelete = async (id: number) => {
        if (confirm("Filialni o'chirishni xohlaysizmi?")) {
            try {
                await api.delete(`/branches/${id}/`)
                setBranches(prev => prev.filter(b => b.id !== id))
            } catch (e) {
                console.error("Delete failed", e)
            }
        }
    }

    return (
        <RoleGate user={user} allowedRoles={["super-admin"]}>
            <main className="flex-1 overflow-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Filiallar</h1>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Yangi Filial
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Yangi Filial Qo'shish</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Nomi</Label>
                                    <Input value={newBranch.name} onChange={e => setNewBranch({ ...newBranch, name: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Manzil</Label>
                                    <Input value={newBranch.address} onChange={e => setNewBranch({ ...newBranch, address: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Telefon</Label>
                                    <Input value={newBranch.phone} onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddBranch}>Saqlash</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {branches.map((branch) => (
                        <Card key={branch.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Filial ID: {branch.id}</CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{branch.name}</div>
                                <p className="text-xs text-muted-foreground mt-1">{branch.address}</p>
                                <p className="text-xs text-muted-foreground">{branch.phone}</p>
                                <Button
                                    variant="ghost"
                                    className="mt-4 text-red-600 h-8 px-2 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(branch.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> O'chirish
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </RoleGate>
    )
}
