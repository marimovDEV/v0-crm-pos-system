# v0 Prompt - Stroy Material CRM Frontend

## Project Overview
Create a professional Construction Materials CRM/POS system with modern UI/UX. The system manages inventory, sales, customers, and provides business analytics.

## Tech Stack Requirements
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui components
- **Icons**: lucide-react
- **State Management**: React Context API + localStorage
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **TypeScript**: Strict mode

## Design System

### Color Palette
```typescript
// Semantic colors
--success: oklch(0.6 0.15 145)    // Green - profits, positive
--danger: oklch(0.55 0.22 25)     // Red - debts, warnings
--warning: oklch(0.75 0.15 85)    // Yellow - alerts
--info: oklch(0.55 0.15 240)      // Blue - neutral info
--primary: oklch(0.205 0 0)       // Dark gray
--muted: oklch(0.97 0 0)          // Light gray backgrounds
```

### Typography Scale
- **Hero Numbers**: 3xl-4xl, font-bold
- **Card Titles**: lg-xl, font-semibold  
- **Body Text**: base, font-normal
- **Labels**: sm, font-medium
- **Captions**: xs, text-muted-foreground

### Component Patterns
- **Cards**: White background, subtle shadow, hover:shadow-md, rounded-lg
- **Stat Cards**: Colored left border (4px), icon in colored circle, big bold number
- **Tables**: Zebra striping, hover:bg-muted/50, right-aligned numbers
- **Buttons**: Primary (filled), Secondary (outline), Destructive (red)

## Pages to Create

### 1. Dashboard (/)
**Layout**: 
- Header with branch selector and refresh button
- 4 stat cards in grid (responsive: 1 col mobile, 2 tablet, 4 desktop)
- Weekly sales chart (area chart with gradient)
- Low stock products table (right sidebar on desktop)
- Top selling products table

**Stat Cards**:
```typescript
interface StatCard {
  title: string            // e.g., "Bugungi savdo"
  value: string            // formatted money "125,000 so'm"
  icon: LucideIcon         // DollarSign, TrendingUp, etc.
  variant: 'success' | 'danger' | 'warning' | 'default'
  description?: string     // Small subtext
  trend?: {
    value: number          // e.g., 12.5
    isPositive: boolean
  }
}
```

**Features**:
- Real-time stats update every 30s
- Empty states with icons
- Skeleton loaders during data fetch
- Alerts panel for critical issues (low stock, high debt)

---

### 2. POS - Point of Sale (/pos)
**Layout**: 
- 3-step wizard: Products → Payment → Receipt
- Product grid with search (left 2/3 on desktop)
- Shopping cart (right 1/3 on desktop, floating button on mobile)
- Step indicators at top

**Product Card**:
```typescript
<Card hover:scale-105 transition-all cursor-pointer>
  <Icon placeholder with gradient bg />
  <Product name (line-clamp-2) />
  <Price (large, bold, colored) />
  <Stock badge (red if < 10) />
  <Add button (appears on hover) />
</Card>
```

**Cart Features**:
- Quantity adjustment (+ / - buttons)
- Remove item (trash icon)
- Real-time subtotal
- Discount percentage input
- Payment method selection (Cash, Card, Debt)
- Customer selection (for debt sales)

**Mobile UX**:
- Floating cart button (bottom-right) showing count and total
- Bottom sheet for cart view
- Touch-friendly buttons (min 44px)

---

### 3. Products (/products)
**Layout**:
- Header with search, filters, "New Product" button
- Product cards grid (responsive)
- Filter sidebar (categories, price range, stock status)

**Product Card**:
```typescript
<Card>
  <Category badge />
  <Product name />
  <Cost price (small, muted) />
  <Sale price (large, primary color) />
  <Profit (green if positive, with percentage) />
  <Stock indicator (colored badge) />
  <Actions (Edit, Delete) />
</Card>
```

**Features**:
- Smart search (name or SKU)
- Category filter chips
- Sort by: name, price, stock, profit
- Bulk actions
- Add/Edit dialog with form validation

---

### 4. Sales History (/sales)
**Layout**:
- Date range picker (top)
- Summary cards (total sales, profit, count)
- Sales table with filters

**Table Columns**:
- Sale ID (link to detail)
- Date & Time
- Customer (if any)
- Items count
- Total amount (bold, right-aligned)
- Payment method (badge)
- Status

**Features**:
- Export to Excel/PDF
- Filter by payment method, customer
- View receipt modal
- Zebra striping for readability

---

### 5. Warehouse (/warehouse)
**Layout**:
- Stock adjustment form
- Current inventory table
- Low stock alerts

**Features**:
- Increase/Decrease stock
- Stock transfer between branches
- Inventory history log
- Critical stock warnings (red badges)

---

### 6. Customers (/customers)
**Layout**:
- Customer cards/list toggle
- Search and filters
- Add customer dialog

**Customer Card**:
```typescript
<Card>
  <Avatar with initials />
  <Name (bold) />
  <Phone />
  <Debt (red if > 0, bold) />
  <Credit limit />
  <Actions />
</Card>
```

---

## Responsive Design Rules

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile (< 768px)
- Sidebar hidden (hamburger menu)
- 1-column card grids
- Bottom navigation (4 icons + center FAB)
- Compact tables (hide columns, show details on tap)
- Full-width dialogs

### Desktop (>= 768px)
- Fixed sidebar (256px width)
- Multi-column grids
- Hover effects enabled
- Keyboard shortcuts displayed

---

## Component Library Requirements

### 1. EnhancedStatCard
```tsx
interface EnhancedStatCardProps {
  title: string
  value: string
  icon: LucideIcon
  variant: 'success' | 'danger' | 'warning' | 'default'
  description?: string
  trend?: { value: number; isPositive: boolean }
  className?: string
}
```

**Styling**:
- Border-left-4 with variant color
- Icon in rounded colored background
- Hover shadow transition
- Large bold value (3xl font)
- Small muted description

---

### 2. DataTable
```tsx
interface Column<T> {
  key: keyof T
  header: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  sortable?: boolean
  zebra?: boolean  // alternating row colors
}
```

**Features**:
- Zebra striping (nth-child(even) bg-muted/20)
- Hover state (hover:bg-muted/50)
- Right-align for numbers
- Custom cell renderers
- Empty state

---

### 3. NumberFormat Component
```tsx
<NumberFormat 
  value={125000} 
  variant="currency"  // currency, percent, number
  color="success"     // success, danger, warning, default
  size="lg"           // sm, base, lg, xl
/>
// Outputs: <span class="text-2xl font-bold text-success">125,000 so'm</span>
```

---

### 4. EmptyState
```tsx
<EmptyState
  icon={PackageX}
  iconColor="text-muted-foreground"
  title="Mahsulot topilmadi"
  description="Qidiruv natijasi bo'sh"
  action={<Button>Yangi qo'shish</Button>}
  compact={false}
/>
```

---

### 5. LoadingStates
- SkeletonCard (for stat cards)
- SkeletonTable (shimmer effect)
- SkeletonChart

---

## UX Patterns

### 1. Form Validation
- Inline errors (red text below field)
- Required fields marked with *
- Success states (green checkmark)
- Disabled submit until valid

### 2. Toasts
```typescript
toast({
  title: "Muvaffaqiyatli",
  description: "Mahsulot saqlandi",
  variant: "default" | "destructive"
})
```

### 3. Dialogs
- Backdrop blur
- Slide-in animation
- Max-width 600px
- Close on Escape
- Confirm before destructive actions

### 4. Loading States
- Skeleton screens (not spinners)
- Optimistic updates where possible
- Disable buttons during loading

---

## Accessibility Requirements
- Semantic HTML (main, nav, article, section)
- ARIA labels for icons
- Keyboard navigation (Tab, Enter, Escape)
- Focus visible outlines
- Color contrast ratio ≥ 4.5:1
- Touch targets ≥ 44px on mobile

---

## Code Style

### File Structure
```
app/
  page.tsx              # Dashboard
  pos/page.tsx          # POS
  products/page.tsx     # Products
  sales/page.tsx        # Sales
  warehouse/page.tsx    # Warehouse
  customers/page.tsx    # Customers
  
components/
  ui/                   # shadcn components
  dashboard/
    stat-card.tsx
    enhanced-chart.tsx
    alerts-panel.tsx
  
lib/
  utils.ts              # cn(), formatMoney()
  api.ts                # API client (axios)
```

### Naming Conventions
- Components: PascalCase
- Files: kebab-case
- Props interfaces: ComponentNameProps
- Utility functions: camelCase

---

## Example Prompt for v0

**Short Version**:
```
Create a professional CRM dashboard page with Next.js 14, Tailwind CSS, and shadcn/ui. 

Include:
- 4 stat cards (Today's sales, profit, debts, low stock) with icons and semantic colors
- Area chart for weekly sales trend
- Low stock products table with zebra striping
- Mobile responsive (stack cards, bottom navigation)

Use EnhancedStatCard component with colored left border, icon in circle, large bold numbers. Chart should have gradient fill. Tables with hover states and right-aligned money values.
```

**Detailed Version**:
```
Build a complete Point of Sale (POS) page for a construction materials CRM using Next.js 14 App Router, TypeScript, Tailwind CSS v4, and shadcn/ui components.

LAYOUT:
- 3-step wizard: Product Selection → Payment → Receipt
- Desktop: Product grid (66%) + Cart sidebar (33%)
- Mobile: Product grid + Floating cart button → Bottom sheet

PRODUCT GRID:
- Search bar with icon (auto-focus)
- 2-4 responsive columns
- Each card: gradient icon placeholder, name (line-clamp-2), price (bold primary), stock badge, hover "Add" button
- Cards scale on hover (scale-105)

SHOPPING CART:
- Desktop: Fixed sidebar with scroll
- Mobile: Floating button (bottom-right) with count badge + total → Opens bottom sheet
- Cart items: Name, quantity controls (+/-), remove button, line total
- Bottom: Subtotal, discount %, total (large bold)
- "Checkout" button (full-width, primary)

PAYMENT STEP:
- Radio group: Cash, Card, Debt (visual cards with icons)
- Customer selector (required for debt)
- Optional notes textarea
- Order summary with totals

RECEIPT STEP:
- Monospace font receipt design
- Print button
- "New Sale" button to reset

TECH DETAILS:
- TypeScript strict mode
- Zod validation for forms
- Optimistic UI updates
- Toast notifications
- Keyboard shortcuts (F9 = checkout, Esc = cancel)
- Barcode scanner support

DESIGN:
- Semantic colors (green=profit, red=debt)
- Gradient backgrounds
- Subtle shadows
- Smooth transitions
- Touch-friendly (44px min)

Make it production-ready with error handling, loading states, and accessibility.
```

---

## Additional Context

The backend API provides:
- GET /products/ - List products
- POST /sales/ - Create sale
- GET /customers/ - List customers
- GET /dashboard/stats/ - Dashboard data

Response format:
```json
{
  "results": [...],
  "count": 100,
  "next": "url",
  "previous": "url"
}
```

Money is returned as numbers (e.g., 125000), format with `formatMoney()` utility.
