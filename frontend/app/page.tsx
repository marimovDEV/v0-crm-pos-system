"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const router = useRouter()
  const { user, login, isAuthenticated } = useAuth()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  // Agar foydalanuvchi allaqachon login qilgan bo'lsa, dashboard ga yo'naltiramiz
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])


  const handleLogin = async () => {
    if (pin.length < 4) {
      setError("PIN kamida 4 raqamdan iborat bo'lishi kerak")
      return
    }

    // Call login with PIN directly
    // useAuth login function handles API call
    const success = await login({ pin })

    if (success) {
      window.location.href = "/dashboard"
    } else {
      setError("PIN noto'g'ri odatiy: 1234 (admin) yoki 5678 (kassir)")
      setPin("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length >= 4) {
      handleLogin()
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Stroy Material POS</CardTitle>
          <CardDescription className="text-center">Tizimga kirish uchun PIN ni kiriting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* PIN Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">PIN kod:</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""))
                setError("")
              }}
              onKeyDown={handleKeyDown}
              placeholder="0000"
              className="w-full px-4 py-3 text-center text-3xl tracking-widest border-2 border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              autoFocus
            />
          </div>


          {/* Error */}
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

          {/* Login Tugmasi */}
          <Button
            onClick={handleLogin}
            disabled={pin.length < 4}
            className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg transition-all"
          >
            Kirib o'tish
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
