# Next Steps - Products & Customers Page Enhancement

## Products Page Enhancement Plan

### 1. Update Product Interface
Add new fields:
```typescript
interface Product {
  // Existing fields...
  base_unit?: string
  sell_unit?: string
  unit_ratio?: number
  short_code?: string
  barcodes?: Barcode[]
  is_low_stock?: boolean
  stock_display?: string
}
```

### 2. Create Barcode Management Dialog
Component: `BarcodeManagerDialog`
Features:
- List all barcodes for selected product
- Add new barcode (factory, package, internal types)
- Delete barcode
- Test scanner button

### 3. Update Create Product Dialog
Add fields:
- Base Unit selector (kg, m, m², dona, etc.)
- Sell Unit selector (qop, rulon, dona, etc.)
- Unit Ratio input (1 qop = ? kg)
- Short Code input

### 4. Product Card Enhancement
Show:
- Stock in both units (e.g., "100 qop (5000 kg)")
- Barcode count badge
- Quick barcode view button

---

## Customers Page Enhancement Plan

### 1. Update Customer Interface
```typescript
interface Customer {
  // Existing...
  customer_type: 'regular' | 'usta' | 'brigadir' | 'firma'
  debt_limit: number
  auto_block_on_limit: boolean
}
```

### 2. Customer Card Enhancements
- Customer type badge with icon
- Debt limit progress bar
- Debt percentage (75% of limit)
- Warning if approaching limit

### 3. Create/Edit Customer Dialog
Add fields:
- Customer Type selector  
- Debt Limit input
- Auto-block toggle

### 4. Filters
- Filter by customer type
- Filter by debt status (no debt, has debt, overdue)

---

## Alternative: Quick Wins Approach

Instead of full UI overhaul, implement **minimum viable** changes:

### Products (Quick):
1. Show short_code in product list
2. Add "View Barcodes" button that opens simple dialog
3. Display unit_ratio in product detail

### Customers (Quick):
1. Show customer_type badge
2. Display debt limit next to current debt
3. Add debt usage percentage

This approach gets features working fast, can polish UI later.

---

## Recommendation

Given the 70% completion status, I recommend:

**Option A: Quick Wins** (2-3 hours)
- Get barcode viewing working
- Show customer types and limits
- Users can test all backend features
- Polish UI in next iteration

**Option B: Full Enhancement** (5-6 hours)  
- Complete barcode management UI
- Rich customer debt visualization
- Beautiful, polished experience
- Takes longer but complete

**Which would you prefer?**
