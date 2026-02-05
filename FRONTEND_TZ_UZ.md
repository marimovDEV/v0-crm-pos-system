# Stroy Material CRM - Frontend Technical Specification

## Loyiha Tavsifi
Qurilish materiallari savdosi uchun zamonaviy CRM/POS tizimi. Sistema omborni boshqarish, savdo, mijozlar va biznes analitikasini ta'minlaydi.

## Texnologiyalar
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- shadcn/ui components
- Recharts (grafikalar)
- Axios (API client)

## Dizayn Tizimi

### Ranglar
- **Yashil** (success): Foyda, ijobiy o'zgarishlar
- **Qizil** (danger): Qarzlar, xatolar, past qoldiq
- **Sariq** (warning): Ogohlantirishlar
- **Ko'k** (info): Neytral ma'lumot

### Typography
- Katta raqamlar: 3xl-4xl, bold
- Sarlavhalar: lg-xl, semibold
- Oddiy text: base
- Label: sm, medium
- Caption: xs, muted

### Componentlar
- **Card**: Oq fon, subtle shadow, hover effekt
- **Stat Card**: Chap border rangli, icon rangli doirada, katta bold raqam
- **Table**: Zebra striping, hover bg-muted/50
- **Button**: Primary, Outline, Destructive

## Sahifalar

### 1. Dashboard (/)
**Tarkibi**:
- 4 ta statistika kartasi (bugungi savdo, foyda, qarzlar, kam qolgan)
- Haftalik savdo grafigi
- Kam qolgan mahsulotlar jadvali
- Eng ko'p sotilgan mahsulotlar

**Xususiyatlar**:
- Har 30 sekundda avtomatik yangilanish
- Bo'sh holat ko'rinishlari
- Skeleton loaders
- Ogohlantirishlar paneli

### 2. POS - Savdo (/pos)
**Tarkibi**:
- 3 bosqichli jarayon: Mahsulotlar → To'lov → Chek
- Mahsulot gridi + Savatcha
- Qidiruv va filter

**Mahsulot kartasi**:
- Icon placeholder (gradient fon)
- Mahsulot nomi
- Narx (katta, bold)
- Qoldiq badge
- "Qo'shish" button (hover da)

**Savatcha**:
- Desktop: Fixed sidebar
- Mobile: Floating button → Bottom sheet
- Miqdor boshqaruvi
- Chegirma %
- To'lov turi tanlash
- Mijoz tanlash (qarz uchun)

### 3. Mahsulotlar (/products)
**Tarkibi**:
- Qidiruv va filterlar
- Mahsulot gridi
- "Yangi mahsulot" button

**Mahsulot kartasi**:
- Kategoriya badge
- Nomi
- Kelish narxi (kichik, muted)
- Sotuv narxi (katta, primary)
- Foyda (yashil, foiz bilan)
- Qoldiq (rangli badge)

### 4. Savdo tarixi (/sales)
**Tarkibi**:
- Sana filteri
- Umumiy statistika
- Savdolar jadvali

**Jadval**:
- Savdo ID
- Sana va vaqt
- Mijoz
- Mahsulotlar soni
- Summa (bold, right-aligned)
- To'lov turi
- Holat

### 5. Ombor (/warehouse)
**Tarkibi**:
- Qoldiq sozlash formi
- Joriy inventar jadvali
- Kam qolgan ogohlantirishlari

### 6. Mijozlar (/customers)
**Tarkibi**:
- Mijozlar ro'yxati
- Qidiruv va filterlar
- Yangi mijoz qo'shish

**Mijoz kartasi**:
- Avatar (initials)
- Ism (bold)
- Telefon
- Qarz (qizil agar > 0)
- Kredit limiti

## Responsive Dizayn

### Mobile (< 768px)
- Sidebar yashirin (hamburger menu)
- 1-column grid
- Bottom navigation
- Compact jadvallar
- Full-width dialogs

### Desktop (>= 768px)
- Fixed sidebar (256px)
- Multi-column grids
- Hover effektlar
- Klaviatura yorliqlari

## Asosiy Componentlar

### 1. EnhancedStatCard
- Rangli chap border
- Icon rangli fondda
- Katta bold raqam
- Hover shadow
- Trend indicator (+/- %)

### 2. DataTable
- Zebra striping
- Hover holat
- Raqamlar right-aligned
- Sortable ustunlar
- Bo'sh holat

### 3. NumberFormat
- Currency formatting
- Semantic ranglar
- Responsive o'lchamlar

### 4. EmptyState
- Icon
- Sarlavha
- Tavsif
- Action button

## API Integration

### Endpoints
- GET /products/ - Mahsulotlar ro'yxati
- POST /sales/ - Savdo yaratish
- GET /customers/ - Mijozlar
- GET /dashboard/stats/ - Dashboard ma'lumotlari

### Response Format
```json
{
  "results": [...],
  "count": 100,
  "next": "url",
  "previous": "url"
}
```

## UX Patterns

### Form Validation
- Inline errors
- Required fields (*)
- Success states
- Disabled submit

### Toasts
- Success/Error notifications
- Auto-dismiss
- Action button

### Dialogs
- Backdrop blur
- Slide-in animation
- Esc to close
- Confirm destructive

### Loading
- Skeleton screens
- Optimistic updates
- Disabled buttons

## Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus outlines
- 4.5:1 contrast ratio
- 44px touch targets (mobile)

## Fayl Strukturasi
```
app/
  page.tsx              # Dashboard
  pos/page.tsx          # POS
  products/page.tsx     # Mahsulotlar
  sales/page.tsx        # Savdo tarixi
  warehouse/page.tsx    # Ombor
  customers/page.tsx    # Mijozlar
  
components/
  ui/                   # shadcn components
  dashboard/
    stat-card.tsx
    enhanced-chart.tsx
  
lib/
  utils.ts              # Utilities
  api.ts                # API client
```

## Code Style
- Components: PascalCase
- Files: kebab-case
- Props: ComponentNameProps
- Functions: camelCase
- TypeScript strict mode
- ESLint + Prettier
