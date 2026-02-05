# 🧪 Comprehensive Testing Guide - Stroy Material CRM

## Pre-Test Checklist

### 1. Start Backend
```bash
cd /Users/ogabek/Documents/projects/stroymarketcrm/backend
../venv/bin/python manage.py runserver
```
**Expected**: Server runs on `http://localhost:8000`

### 2. Start Frontend
```bash
cd /Users/ogabek/Documents/projects/stroymarketcrm/frontend
npm run dev
```
**Expected**: App runs on `http://localhost:3000`

### 3. Login
- URL: `http://localhost:3000`
- Username: `admin`
- Password: `admin123`

---

## Test Suite 1: Barcode Scanner (10 min)

### Test 1.1: Scanner Detection
1. Go to POS page
2. Type quickly: `U1-C450` + Enter
3. **✅ Expected**: Product "Sement M-450" added to cart
4. **✅ Expected**: Voice says "Mahsulot topildi"
5. **✅ Expected**: Success beep sound

### Test 1.2: Invalid Barcode
1. Type: `INVALID123` + Enter
2. **✅ Expected**: Toast "Mahsulot topilmadi"
3. **✅ Expected**: Voice says "Mahsulot topilmadi"
4. **✅ Expected**: Error beep (low frequency)

### Test 1.3: Different Barcode Types
Try these barcodes:
- `U1-C450` (internal) → Sement M-450
- `590010010001` (factory) → Same product
- `PKG01001` (package) → Same product

**✅ Expected**: All 3 barcodes add same product

### Test 1.4: Scanner Status
1. Watch top-right of POS header
2. While typing barcode
3. **✅ Expected**: "Scanning..." indicator appears
4. **✅ Expected**: Scan count increases
5. **✅ Expected**: Last scan shows barcode

---

## Test Suite 2: Keyboard Shortcuts (5 min)

### Test 2.1: F9 - Quick Checkout
1. Add 2-3 products to cart
2. Press **F9**
3. **✅ Expected**: Navigates to payment step
4. Select payment method
5. Press **F9** again
6. **✅ Expected**: Completes sale

### Test 2.2: F8 - Debt Sale
1. Add products to cart
2. Press **F8**
3. **✅ Expected**: Payment method = "Qarz"
4. **✅ Expected**: Toast "Qarz rejimi - Mijoz tanlash kerak"
5. Select customer
6. Press F9 to complete

### Test 2.3: Esc - Cancel
1. Add products to cart
2. Press **Esc**
3. **✅ Expected**: Cart clears
4. **✅ Expected**: Returns to step 1
5. **✅ Expected**: All fields reset

### Test 2.4: ? - Help
1. Press **?** key
2. **✅ Expected**: Shortcuts overlay appears
3. **✅ Expected**: Shows all 4 shortcuts
4. Press Esc or click outside
5. **✅ Expected**: Overlay closes

---

## Test Suite 3: Products & Barcodes (5 min)

### Test 3.1: View Barcodes
1. Go to Products page
2. Find any product
3. Click barcode icon (📱)
4. **✅ Expected**: Dialog shows 3 barcodes
5. **✅ Expected**: Different types colored differently

### Test 3.2: Copy Barcode
1. In barcode viewer dialog
2. Click copy button
3. **✅ Expected**: "Nusxalandi" toast
4. Paste in notepad
5. **✅ Expected**: Barcode copied correctly

### Test 3.3: Barcode Types
Check each product has:
- **Blue badge**: Factory (590...)
- **Green badge**: Package (PKG...)
- **Purple badge**: Internal (U1-...)

---

## Test Suite 4: Customers & Debt (5 min)

### Test 4.1: Customer Types
1. Go to Customers page
2. Find "Shovot Qurilish MCHJ"
3. **✅ Expected**: 🏢 icon + "firma" badge (blue)
4. Find "Karimov Usta"
5. **✅ Expected**: 💼 icon + "usta" badge (purple)
6. Find "Rahimov Brigadir"
7. **✅ Expected**: 🎩 icon + "brigadir" badge (green)

### Test 4.2: Debt Limits
1. Check "Shovot Qurilish" row
2. **✅ Expected**: Shows debt amount
3. **✅ Expected**: Shows percentage (e.g., "30% / 50,000,000")
4. Check customers with 0 limit
5. **✅ Expected**: No percentage shown

---

## Test Suite 5: Reports (5 min)

### Test 5.1: Daily Sales
1. Go to Reports page
2. Check top cards
3. **✅ Expected**: Shows today's sales
4. **✅ Expected**: Shows sale count
5. **✅ Expected**: Shows average check

### Test 5.2: Tabs Navigation
1. Click "Xodimlar" tab
2. **✅ Expected**: Shows employee stats
3. Click "Mahsulotlar" tab
4. **✅ Expected**: Shows top products
5. Click "Filiallar" tab (if admin)
6. **✅ Expected**: Shows branch comparison

### Test 5.3: Export Excel
1. Click "Eksport" button
2. **✅ Expected**: Downloads Excel file
3. Open file
4. **✅ Expected**: 3 sheets (Umumiy, Xodimlar, Mahsulotlar)

---

## Test Suite 6: Calculator API (5 min)

### Test 6.1: Material Calculation
Use Postman or curl:
```bash
curl -X POST http://localhost:8000/api/products/calculator/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "measurement_type": "area",
    "value": 100,
    "wastage_percent": 10
  }'
```

**✅ Expected Response:**
```json
{
  "base_quantity": 110,
  "sell_units": 2.2,
  "explanation": "100 area + 10% wastage = 110 kg ≈ 2.2 qop",
  "has_stock": true,
  "total_price": 33000
}
```

---

## Test Suite 7: Voice Feedback (3 min)

### Test 7.1: Enable Voice
1. POS page → Top right
2. Click "Ovoz" button
3. **✅ Expected**: Button turns blue (active)

### Test 7.2: Voice on Success
1. Scan valid barcode
2. **✅ Expected**: Hears "Mahsulot topildi" (Uzbek)
3. **✅ Expected**: High beep sound

### Test 7.3: Voice on Error
1. Scan invalid barcode
2. **✅ Expected**: Hears "Mahsulot topilmadi"
3. **✅ Expected**: Low beep sound

### Test 7.4: Disable Voice
1. Click "Ovoz" button again
2. **✅ Expected**: Button turns grey
3. Scan barcode
4. **✅ Expected**: No voice, only beep

---

## Test Suite 8: Multi-Unit System (5 min)

### Test 8.1: Check Product Units
1. Products page
2. Find "Sement M-450"
3. **✅ Expected**: Stock shows in kg
4. Check product details
5. **✅ Expected**: base_unit = kg, sell_unit = qop, ratio = 50

### Test 8.2: Unit Conversion in Sale
1. POS → Add "Sement M-450" x 2 qop
2. Check cart
3. **✅ Expected**: Shows 2 qop
4. Complete sale
5. **✅ Expected**: Stock decreases by 100 kg (2 × 50)

---

## Test Suite 9: Complete Workflow (10 min)

### Scenario: Usta buys materials with debt

1. **Login** as admin
2. **POS** page
3. **Scan**: `U1-C450` (Sement) → Add 5 qop
4. **Scan**: `U1-GRD` (Gisht) → Add 1000 dona
5. **Check** cart total
6. **Press F8** (debt mode)
7. **Select** customer "Karimov Usta"
8. **Check** debt limit warning (if any)
9. **Press F9** to complete
10. **Verify**:
    - Sale saved
    - Stock decreased
    - Customer debt increased
    - Receipt generated

---

## Performance Tests

### Test P1: Scanner Speed
1. Scan 20 products rapidly
2. **✅ Expected**: All scans detected
3. **✅ Expected**: No lags or freezes
4. **✅ Expected**: Voice for each scan

### Test P2: Large Product List
1. Products page with 12+ products
2. **✅ Expected**: Loads under 1 second
3. Search for product
4. **✅ Expected**: Instant filtering

---

## Bug Report Template

If you find issues, note:

```
❌ ISSUE:
- Page: [e.g., POS, Products, Customers]
- Action: [What you did]
- Expected: [What should happen]
- Actual: [What happened]
- Browser Console: [Any errors?]
```

---

## Success Criteria

✅ All 9 test suites pass  
✅ No console errors  
✅ Voice feedback works  
✅ Keyboard shortcuts responsive  
✅ Barcodes scan correctly  
✅ Reports display data  
✅ Excel export works  

**If all pass → System is 90% ready for production!**

---

**Test Duration**: ~50 minutes total  
**Recommended**: Test with real barcode scanner  
**Browser**: Chrome/Edge (latest)
