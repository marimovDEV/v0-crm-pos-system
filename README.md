# 🏗️ Stroy Material CRM

[![Django](https://img.shields.io/badge/Django-6.0-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Modern CRM system for construction materials retail businesses with barcode scanning, multi-unit product management, customer debt tracking, and real-time reports.

---

## ✨ Features

### 🎯 Core Features
- **Barcode Scanner** - USB/Bluetooth scanner support with voice feedback
- **Multi-Unit Products** - Manage products in different units (bags→kg, rolls→m²)
- **Customer Debt Management** - Track debt with limits, auto-blocking, and payment history
- **Material Calculator** - Calculate quantities from area/volume with wastage
- **Keyboard Shortcuts** - F8 (debt sale), F9 (checkout), Esc (cancel), ? (help)
- **Real-time Reports** - Daily sales, customer debt, low stock alerts

### 📦 Product Management
- Multiple barcodes per product (factory, package, internal)
- Category-based organization
- Stock tracking with min/max levels
- Unit conversion system
- Batch/package tracking

### 👥 Customer Management
- Customer types: Usta, Brigadir, Firma, Regular
- Debt limits per customer type
- Auto-blocking on limit exceed
- Payment history and transactions
- Visual debt percentage indicators

### 💰 Sales & POS
- Fast barcode-based checkout
- Mixed payment methods (cash, card, debt)
- Voice feedback in Uzbek
- Scanner status indicator
- Receipt generation

### 📊 Reports & Analytics
- Daily sales summary
- Top products analysis
- Customer debt by type
- Low stock warnings
- Excel export

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Development Setup

1. **Clone Repository**
```bash
git clone <your-repo-url>
cd stroymarketcrm
```

2. **Backend Setup**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python seed_data.py  # Load sample data
python manage.py runserver
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

**Default Login:**
- Username: `admin`
- Password: `admin123`

---

## 📁 Project Structure

```
stroymarketcrm/
├── backend/
│   ├── config/              # Django settings
│   ├── core/                # Core models (Branch, Employee)
│   ├── products/            # Product management
│   │   ├── models.py        # Product, Barcode, Category
│   │   ├── barcode_views.py # Barcode API
│   │   └── calculator_views.py # Material calculator
│   ├── customers/           # Customer & debt management
│   ├── sales/               # Sales & POS
│   └── seed_data.py         # Sample data generator
│
├── frontend/
│   ├── app/                 # Next.js pages
│   │   ├── pos/             # Point of Sale
│   │   ├── products/        # Product management
│   │   ├── customers/       # Customer management
│   │   └── reports/         # Analytics
│   ├── components/          # Reusable components
│   │   ├── barcode-viewer.tsx
│   │   ├── scanner-status.tsx
│   │   └── keyboard-shortcuts-overlay.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── use-barcode-scanner.ts
│   │   └── use-keyboard-shortcuts.ts
│   └── lib/                 # Utilities
│
├── DEPLOYMENT.md            # Production deployment guide
├── MANUAL_TEST_UZ.md        # Manual testing guide (Uzbek)
└── README.md                # This file
```

---

## 🎮 Usage

### POS - Point of Sale

1. Navigate to **POS** page
2. **Scan barcode** or type product code + Enter
3. **Voice feedback** confirms product added
4. Use shortcuts:
   - **F8** - Switch to debt payment
   - **F9** - Quick checkout
   - **Esc** - Cancel/reset
   - **?** - Show help

### Products - Barcode Management

1. Navigate to **Products** page
2. Click **barcode icon** (📱) on any product
3. View all 3 barcodes (Factory, Package, Internal)
4. Click **copy** to copy barcode to clipboard

### Customers - Debt Tracking

1. Navigate to **Customers** page
2. See customer types with icons:
   - 🏢 Firma (Company)
   - 🎩 Brigadir (Foreman)
   - 💼 Usta (Master)
   - 👤 Regular
3. View debt percentage (e.g., "30% / 50M limit")

### Reports

1. Navigate to **Reports** page
2. Select date range and branch filter
3. View KPIs and charts
4. Click **Export** for Excel download

---

## 🔧 Configuration

### Backend (`backend/config/settings.py`)

```python
# Scanner Configuration
BARCODE_SCANNER = {
    'TYPE_THRESHOLD': 100,  # ms between keypresses
    'MIN_LENGTH': 4,
    'ENABLED': True
}

# Voice Feedback
VOICE_FEEDBACK = {
    'LANGUAGE': 'uz-UZ',
    'ENABLED': True
}

# Database (Development)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SCANNER_ENABLED=true
NEXT_PUBLIC_VOICE_FEEDBACK=true
```

---

## 📊 Sample Data

Run `python seed_data.py` to create:
- **12 products** (6 per branch) with 36 barcodes
- **4 customers** (different types with debt limits)
- **2 branches** configured
- **Multiple categories**

---

## 🧪 Testing

### Manual Testing (10 minutes)

See `MANUAL_TEST_UZ.md` for step-by-step guide.

**Quick Test:**
```bash
# 1. Start servers
cd backend && source venv/bin/activate && python manage.py runserver
cd frontend && npm run dev

# 2. Open http://localhost:3000
# 3. Login: admin / admin123
# 4. Test POS: Type "U1-C450" + Enter
# 5. Test shortcuts: F8, F9, Esc, ?
```

### API Testing

```bash
# Get products
curl http://localhost:8000/api/products/

# Lookup barcode
curl -X POST http://localhost:8000/api/products/barcode/lookup/ \
  -H "Content-Type: application/json" \
  -d '{"barcode": "U1-C450"}'

# Material calculator
curl -X POST http://localhost:8000/api/products/calculator/ \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "value": 100, "measurement_type": "area"}'
```

---

## 🚀 Production Deployment

See `DEPLOYMENT.md` for complete production setup guide including:
- Ubuntu server configuration
- PostgreSQL setup
- Gunicorn + Nginx
- SSL certificates
- PM2 process manager
- Monitoring and backups

**Quick Deploy:**
```bash
# 1. Server setup
sudo apt update && sudo apt install python3-pip nginx postgresql -y

# 2. Clone and setup
git clone <repo> && cd stroymarketcrm
cd backend && pip install -r requirements.txt gunicorn
python manage.py migrate --settings=config.settings_prod

# 3. Run services
gunicorn config.wsgi:application --bind 0.0.0.0:8000
cd ../frontend && npm install && npm run build && npm start
```

---

## 📈 Roadmap

### Completed ✅
- [x] Barcode scanner integration
- [x] Multi-unit product system
- [x] Customer debt management
- [x] Material calculator API
- [x] Reports system
- [x] Keyboard shortcuts
- [x] Voice feedback

### In Progress 🚧
- [ ] Brigadir mode (bulk discounts)
- [ ] Truck sale mode (Gazel/Kamaz volumes)
- [ ] Receipt printing (58mm/80mm)
- [ ] Mobile app (React Native)

### Planned 📋
- [ ] Inventory transfer between branches
- [ ] Purchase orders management
- [ ] Supplier management
- [ ] Advanced analytics dashboard
- [ ] SMS notifications
- [ ] WhatsApp integration

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 💡 Tips & Tricks

### Barcode Scanner Setup
- USB scanners work automatically (no drivers needed)
- Configure scanner to add Enter after each scan
- Set keyboard language to match your scanners

### Performance Optimization
- Enable SQLite WAL mode (already configured)
- Use indexes on frequently queried fields
- Implement Redis caching for reports

### Keyboard Shortcuts
- **F8**: Quick debt sale
- **F9**: Complete checkout
- **Esc**: Cancel current operation
- **?**: Show shortcuts help
- **Enter**: Add product (when typing barcode)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/stroymarketcrm/issues)
- **Email**: support@example.com
- **Documentation**: See `/docs` folder

---

## 🙏 Acknowledgments

- Built with Django REST Framework
- UI powered by Next.js + TailwindCSS
- Icons from Lucide React
- Voice synthesis using Web Speech API

---

**Made with ❤️ for construction materials retailers**

**Version**: 1.0.0  
**Last Updated**: 2026-01-10
