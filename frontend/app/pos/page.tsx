"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Minus, ShoppingCart, X, Barcode } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from "@/hooks/use-products"
import { usePOS } from "@/hooks/use-pos"
import { useCustomers } from "@/hooks/use-customers"

const CATEGORIES = ["Barchasi", "Sement", "Agregat", "Plitkalar", "Izolyatsiya", "Metall"]

export default function POSPage() {
  const { user } = useAuth()
  const { customers } = useCustomers()
  const {
    products,
    loading,
    refreshProducts, // Added: destructured refreshProducts
  } = useProducts()

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState("Barchasi")
  const [searchQuery, setSearchQuery] = useState("")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)

  // FIX: Branch Selection
  const [branches, setBranches] = useState<any[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")

  // FIX: Receipt Printing via Iframe
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  // Fetch Branches
  React.useEffect(() => {
    import("@/lib/api").then((module) => {
      const api = module.default;
      api.get("/branches/").then((res) => {
        setBranches(res.data.results || res.data)
        if (res.data.results?.[0]?.id) {
          setSelectedBranchId(res.data.results[0].id)
        } else if (Array.isArray(res.data) && res.data[0]?.id) {
          setSelectedBranchId(res.data[0].id)
        }
      }).catch(err => console.error("Failed to fetch branches", err))
    })
  }, [])

  // Barcode skaneri - Enter tugmasida mahsulotni qo'shish
  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      const product = products.find((p) => p.barcode === barcodeInput.trim())
      if (product) {
        addToCart(product, 1)
        setBarcodeInput("")
      }
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "Barchasi" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const totals = calculateTotal(products)

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    try {
      // NOTE: We pass selectedBranchId if we update usePOS, but for now purely for refreshing
      const sale = await completeSale(products, user?.id || "default", selectedCustomerId || undefined, 0, selectedBranchId)
      if (sale) {
        setLastSale(sale)
        setShowSuccess(true)
        setSelectedCustomerId("")

        // FIX: Verify Stock Persistence
        refreshProducts()
      }
    } catch (e) {
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.")
    }
  }

  // FIX: Receipt Printing with Iframe
  const handlePrintReceipt = () => {
    if (!lastSale || !iframeRef.current) return

    const receiptHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Chek ${lastSale.receipt_id}</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 0; margin: 0; width: 80mm; font-size: 12px; }
                    .receipt-container { padding: 10px; }
                    .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
                    .header h2 { margin: 0 0 5px 0; font-size: 16px; font-weight: bold; text-transform: uppercase; }
                    .info { margin-bottom: 10px; font-size: 11px; }
                    .info p { margin: 2px 0; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    .items-table th { text-align: left; border-bottom: 1px dashed #000; font-size: 11px; padding: 4px 0; }
                    .items-table td { padding: 4px 0; vertical-align: top; }
                    .col-qty { text-align: right; width: 40px; }
                    .col-price { text-align: right; width: 60px; }
                    .total-section { border-top: 1px dashed #000; padding-top: 8px; margin-top: 5px; }
                    .row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px; }
                    .footer { margin-top: 20px; text-align: center; font-size: 11px; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header">
                        <h2>STROY MARKET</h2>
                        <p>Qurilish Mollari Do'koni</p>
                    </div>
                    
                    <div class="info">
                        <p>Chek ID: ${lastSale.receipt_id}</p>
                        <p>Sana: ${new Date(lastSale.created_at).toLocaleString('uz-UZ')}</p>
                        <p>Kassir: ${user?.name || 'Kassir'}</p>
                        ${lastSale.customer_name ? `<p>Mijoz: ${lastSale.customer_name}</p>` : ''}
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Mahsulot</th>
                                <th class="col-qty">Soni</th>
                                <th class="col-price">Jami</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lastSale.items.map((item: any) => `
                                <tr>
                                    <td>${item.product_name}</td>
                                    <td class="col-qty">${item.quantity}</td>
                                    <td class="col-price">${Number(item.total).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        ${lastSale.discount_amount > 0 ? `
                        <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">
                            <span>Subtotal:</span>
                            <span>${(Number(lastSale.total_amount) + Number(lastSale.discount_amount)).toLocaleString()}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:11px; color:red; margin-bottom:2px;">
                            <span>Chegirma:</span>
                            <span>-${Number(lastSale.discount_amount).toLocaleString()}</span>
                        </div>
                        ` : ''}
                        
                        <div class="row">
                            <span>JAMI:</span>
                            <span>${Number(lastSale.total_amount).toLocaleString()} so'm</span>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Xaridingiz uchun rahmat!</p>
                        <p>Tel: +998 90 123 45 67</p>
                    </div>
                </div>
            </body>
            </html>
        `

    const doc = iframeRef.current.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(receiptHtml)
      doc.close()

      // Wait for content to load then print
      setTimeout(() => {
        iframeRef.current?.contentWindow?.focus()
        iframeRef.current?.contentWindow?.print()
      }, 500)
    }
  }

  if (loading) {
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
    <main className="flex h-full bg-background relative">
      <iframe ref={iframeRef} className="hidden absolute w-0 h-0 print:block" title="receipt" />

      {/* Mahsulotlar - Chap qism */}
      <div className="flex-1 overflow-auto border-r">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Savdo Nuqtasi (POS)</h1>
            <p className="text-slate-200 text-sm">Xush kelibsiz, {user?.name}!</p>
          </div>

          {/* FIX: Branch Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filial:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-white/20 border border-white/30 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id} className="text-black">{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6">
          {/* Barcode Input */}
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex gap-2 items-center">
                <Barcode className="w-5 h-5 text-amber-600" />
                <input
                  type="text"
                  placeholder="Barcodni skan qiling yoki mahsulot ID'ni kiriting..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcodeInput}
                  className="flex-1 px-3 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
                  autoFocus
                />
              </div>
            </CardContent>
          </Card>

          {/* Search va Kategoriya */}
          <Card className="mb-6">
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Mahsulot nomini izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    size="sm"
                    className={selectedCategory === cat ? "bg-slate-600 text-white" : ""}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const cartItem = cartItems.find((item) => item.productId === product.id)
              const cartQuantity = cartItem ? cartItem.quantity : 0
              const displayStock = product.currentStock - cartQuantity
              const isOutOfStock = displayStock <= 0

              return (
                <Card
                  key={product.id}
                  className={`hover:shadow-lg transition-all cursor-pointer ${isOutOfStock ? "opacity-50 grayscale pointer-events-none" : ""
                    }`}
                  onClick={() => !isOutOfStock && addToCart(product, 1)}
                >
                  <div className="p-3">
                    <h3 className="font-semibold text-xs mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-600">{product.sellPrice.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">so'm / {product.unit}</p>
                      </div>
                      <Badge variant={displayStock > 5 ? "default" : "destructive"} className="text-xs">
                        {displayStock} {product.unit}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Savat va To'lov - O'ng qism */}
      <div className="w-80 bg-card border-l flex flex-col">
        {/* Header */}
        <div className="bg-slate-700 text-white p-4 border-b">
          <h2 className="font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Savat ({cartItems.length})
          </h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto divide-y">
          {cartItems.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">Savat bo'sh</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const product = products.find((p) => p.id === item.productId)
              if (!product) return null

              return (
                <div key={item.productId} className="p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sellPrice.toLocaleString()} so'm / {product.unit}</p>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className="text-red-500 hover:text-red-700 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 border rounded bg-background">
                      <button onClick={() => addToCart(product, -item.quantity)} className="p-1 hover:bg-muted">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-sm font-bold min-w-8 text-center">{item.quantity}</span>
                      <button onClick={() => addToCart(product, 1)} className="p-1 hover:bg-muted">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-sm">{(product.sellPrice * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Chegirma va To'lov */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-3">
            {/* Chegirma */}
            <div className="space-y-2">
              <label className="text-xs font-semibold">Chegirma:</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Summa"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  placeholder="%"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="h-8 text-sm w-16"
                />
              </div>
            </div>

            {/* Customer Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold">Mijoz tanlash (ixtiyoriy):</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Mijoz tanlanmagan</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>

            {/* To'lov turi */}
            <div className="space-y-2">
              <label className="text-xs font-semibold">To'lov turi:</label>
              <div className="flex gap-2">
                {(["cash", "card", "transfer", "debt"] as const).map((method) => (
                  <Button
                    key={method}
                    size="sm"
                    variant={paymentMethod === method ? "default" : "outline"}
                    onClick={() => setPaymentMethod(method)}
                    className="flex-1 text-xs h-8 px-1"
                  >
                    {method === "cash" ? "Naqd" : method === "card" ? "Karta" : method === "transfer" ? "O'tkazma" : "Qarz"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Jami */}
            <div className="bg-slate-50 p-3 rounded-lg space-y-1 border-2 border-slate-200">
              <div className="flex justify-between text-xs">
                <span>Subtotal:</span>
                <span className="font-semibold">{totals.subtotal.toLocaleString()}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-red-600">
                  <span>Chegirma:</span>
                  <span className="font-semibold">-{totals.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
                <span>Jami:</span>
                <span className="text-amber-600">{totals.total.toLocaleString()} so'm</span>
              </div>
            </div>

            {/* Success Message & Print */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-2 rounded text-center space-y-2">
                <p>Chek muvaffaqiyatli yakunlandi!</p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={handlePrintReceipt} className="h-8 bg-white border-green-300 hover:bg-green-100 text-green-800">
                    🖨️ Chek chiqarish
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowSuccess(false)} className="h-8 bg-white border-green-300 hover:bg-green-100 text-green-800">
                    Yangi savdo
                  </Button>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-lg transition-all"
              disabled={cartItems.length === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              To'lashni Tugatish ({totals.total.toLocaleString()} so'm)
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
