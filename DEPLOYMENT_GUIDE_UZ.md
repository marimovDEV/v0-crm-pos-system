# Deployment Guide - PythonAnywhere (Backend) & Vercel (Frontend)

Ushbu qo'llanma loyihani production ga joylashtirish bo'yicha batafsil qadamlarni o'z ichiga oladi.

## 1. Backend: PythonAnywhere (Production)

### 1.1 Faqat Backendni yuklash (Sparse Checkout)
Agar PythonAnywhere-ga faqat `backend` papkasini yuklamoqchi bo'lsangiz (frontend-siz), quyidagi buyruqlarni ishlating:

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/marimovDEV/v0-crm-pos-system.git
cd v0-crm-pos-system
git sparse-checkout set backend
cd backend
```

> [!NOTE]
> Bu usul faqat `backend` papkasidagi fayllarni yuklab oladi va PythonAnywhere-da joyni tejaydi.

### 1.2 Virtualenv yaratish va dependency'larni o'rnatish
```bash
mkvirtualenv --python=/usr/bin/python3.10 venv
pip install -r requirements.txt
```

### 1.3 .env faylini yaratish
`backend` papkasida `.env` faylini yarating:
```env
SECRET_KEY=sizing_maxfiy_kalitingiz  # Yangi kalit yarating
DEBUG=False
ALLOWED_HOSTS=ogabek.pythonanywhere.com  # O'zingizning domeningiz
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://stroymarketcrm.vercel.app  # Frontend manzili
```

### 1.4 Ma'lumotlar bazasi va Static fayllar
```bash
python manage.py migrate
python manage.py collectstatic
```

### 1.5 PythonAnywhere Web App sozlamalari
- **Source code**: `/home/ogabek/v0-crm-pos-system/backend`
- **WSGI configuration file**: Faylni ochib, quyidagicha o'zgartiring:
```python
import os
import sys

path = '/home/ogabek/v0-crm-pos-system/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```
- **Static files section**:
    - URL: `/static/` -> Path: `/home/ogabek/v0-crm-pos-system/backend/staticfiles`
    - URL: `/media/` -> Path: `/home/ogabek/v0-crm-pos-system/backend/media`

---

## 2. Frontend: Vercel (Production)

### 2.1 Loyihani import qilish
1. [Vercel](https://vercel.com) saytiga kiring.
2. "Add New Project" tugmasini bosing va GitHub dagi `v0-crm-pos-system` reposini tanlang.

### 2.2 Project Settings
- **Root Directory**: `frontend`
- **Framework Preset**: Next.js
- **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: `https://ogabek.pythonanywhere.com/api`
    - `NEXT_PUBLIC_SCANNER_ENABLED`: `true`
    - `NEXT_PUBLIC_VOICE_FEEDBACK`: `true`

### 2.3 Deploy
"Deploy" tugmasini bosing va jarayon yakunlanishini kuting.

---

## 3. Yakuniy tekshiruv
- Frontend manziliga kiring (masalan: `stroymarketcrm.vercel.app`).
- PIN kod orqali tizimga kiring (admin: `1234`).
- Barcha sahifalar (Dashboard, POS, Mahsulotlar) to'g'ri ishlayotganini tekshiring.
