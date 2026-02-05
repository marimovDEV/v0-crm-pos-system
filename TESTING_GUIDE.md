# Quick Testing Guide - Stroy Material CRM

## 🎯 What's New (Quick Wins Implementation)

### Products Page ✅
- **Barcode Viewer**: Click barcode icon on any product
- **Features**:
  - View all 3 barcodes (Factory, Package, Internal)
  - Copy barcode to clipboard with one click
  - Color-coded by type

### Customers Page ✅
- **Customer Types**: Visual icons and badges
  - 🏢 Firma (blue)
  - 🎩 Brigadir (green)
  - 💼 Usta (purple)
  - 👤 Regular
- **Debt Tracking**:
  - Debt amount displayed
  - Debt percentage (e.g., "75% / 50M limit")
  - Visual progress indication

### POS Page ✅  
- **Barcode Scanner**: Type barcode + Enter
- **Voice Feedback**: Uzbek language notifications
- **Keyboard Shortcuts**:
  - F8: Quick debt sale
  - F9: Complete checkout
  - Esc: Cancel/Reset
  - ?: Show help overlay

---

## 🧪 Quick Test Scenarios

### Test 1: Barcode Scanner (2 min)
1. Go to POS page
2. Type: `U1-C450` and press Enter quickly
3. ✅ Should hear voice "Mahsulot topildi"
4. ✅ Product "Sement M-450" added to cart
5. Try other barcodes:
   - `590010010001` (Factory barcode)
   - `PKG01001` (Package barcode)

### Test 2: View Product Barcodes (1 min)
1. Go to Products page
2. Click barcode icon on any product
3. ✅ Dialog shows 3 barcodes
4. Click copy button
5. ✅ "Nusxalandi" toast appears
6. Paste somewhere to verify

### Test 3: Customer Types (1 min)
1. Go to Customers page
2. Find "Shovot Qurilish MCHJ"
3. ✅ See blue building icon + "firma" badge
4. ✅ Debt shows "30% / 50,000,000"
5. Find "Karimov Usta"
6. ✅ See purple briefcase icon + "usta" badge

### Test 4: Keyboard Shortcuts (2 min)
1. Go to POS page
2. Add items to cart
3. Press F8
4. ✅ Switches to debt payment mode
5. ✅ Toast: "Qarz rejimi - Mijoz tanlash kerak"
6. Press ? key
7. ✅ Shortcuts overlay appears
8. Press Esc
9. ✅ Cart clears, resets to step 1

### Test 5: Voice Feedback (1 min)
1. POS page - ensure voice toggle is ON (blue background)
2. Scan invalid barcode: `INVALID123`
3. ✅ Hear "Mahsulot topilmadi"
4. ✅ Error beep sound (low frequency)
5. Scan valid barcode
6. ✅ Hear "Mahsulot topildi"  
7. ✅ Success beep (high frequency)

---

## 📊 Test With Sample Data

### Products (12 total)
| Short Code | Name | Barcodes |
|-----------|------|----------|
| U1-C450 | Sement M-450 | 3 codes |
| U1-C500 | Sement M-500 | 3 codes |
| U1-GRD | Pishgan gisht | 3 codes |
| U1-A12 | Armatura 12mm | 3 codes |

### Customers (4 total)
| Name | Type | Debt Limit |
|------|------|------------|
| Shovot Qurilish MCHJ | firma | 50M |
| Karimov Usta | usta | 5M |
| Rahimov Brigadir | brigadir | 15M |
| Alijon | regular | 0 (cash only) |

---

## 🐛 Known Limitations (Quick Wins)

1. **Cannot add/delete barcodes** from UI (backend ready, UI not built yet)
2. **Cannot edit customer type** after creation
3. **No multi-unit display** on product cards yet
4. **No debt limit progress bar** visual (only percentage text)

These are intentional - we focused on making features accessible, not perfect UI.

---

## ✅ Success Criteria

All tests pass = ✅ **75% Complete**

You should be able to:
- [x] Scan barcodes in POS
- [x] View all barcodes for products
- [x] See customer types visually
- [x] Track debt usage percentage
- [x] Use keyboard shortcuts
- [x] Get voice feedback

---

## 🚀 Next Steps (Future Work)

1. **Full Barcode Management UI** - Add/delete from products page
2. **Debt Limit Progress Bars** - Visual gauges instead of just %
3. **Customer Type Filtering** - Filter customers by type
4. **Multi-Unit Display** - Show "100 qop (5000 kg)" on cards
5. **Reports Module** - 7 reports with Excel export
6. **Receipt Printing** - 58mm/80mm templates

---

**Test Duration**: ~7 minutes total  
**Expected Result**: All features working  
**If Issues**: Check browser console, try refresh
