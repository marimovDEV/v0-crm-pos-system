# Stroy Material CRM - Production Deployment Guide

## 🚀 Production Deployment Checklist

### Prerequisites
- Ubuntu 20.04+ Server or similar
- Python 3.10+
- PostgreSQL 13+ (production database)
- Nginx
- Domain name configured
- SSL certificate

---

## 📋 Step-by-Step Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3-pip python3-venv nginx postgresql postgresql-contrib -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

### 2. Create Deployment User

```bash
sudo adduser stroycrm
sudo usermod -aG sudo stroycrm
su - stroycrm
```

### 3. Clone Project

```bash
cd /home/stroycrm
git clone <your-repo-url> stroymarketcrm
cd stroymarketcrm
```

### 4. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Create production settings
cp config/settings.py config/settings_prod.py
```

**Edit `config/settings_prod.py`:**

```python
import os
from pathlib import Path

DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com', 'SERVER_IP']

# PostgreSQL Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'stroycrm_db',
        'USER': 'stroycrm_user',
        'PASSWORD': 'STRONG_PASSWORD_HERE',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Security
SECRET_KEY = 'GENERATE_NEW_SECRET_KEY_HERE'
CSRF_TRUSTED_ORIGINS = ['https://your-domain.com']

# Static files
STATIC_ROOT = '/home/stroycrm/stroymarketcrm/backend/staticfiles'
STATIC_URL = '/static/'

# CORS
CORS_ALLOWED_ORIGINS = [
    'https://your-domain.com',
]
```

### 5. PostgreSQL Setup

```bash
sudo -u postgres psql

CREATE DATABASE stroycrm_db;
CREATE USER stroycrm_user WITH PASSWORD 'STRONG_PASSWORD_HERE';
ALTER ROLE stroycrm_user SET client_encoding TO 'utf8';
ALTER ROLE stroycrm_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE stroycrm_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE stroycrm_db TO stroycrm_user;
\q
```

### 6. Run Django Migrations

```bash
cd /home/stroycrm/stroymarketcrm/backend
source venv/bin/activate

export DJANGO_SETTINGS_MODULE=config.settings_prod

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 7. Seed Data (Optional)

```bash
python seed_data.py
```

### 8. Gunicorn Setup

Create `/etc/systemd/system/stroycrm-backend.service`:

```ini
[Unit]
Description=Stroy CRM Gunicorn Service
After=network.target

[Service]
User=stroycrm
Group=www-data
WorkingDirectory=/home/stroycrm/stroymarketcrm/backend
Environment="DJANGO_SETTINGS_MODULE=config.settings_prod"
ExecStart=/home/stroycrm/stroymarketcrm/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/home/stroycrm/stroymarketcrm/backend/gunicorn.sock \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl start stroycrm-backend
sudo systemctl enable stroycrm-backend
sudo systemctl status stroycrm-backend
```

### 9. Frontend Setup

```bash
cd /home/stroycrm/stroymarketcrm/frontend

# Install dependencies
npm install

# Update API URL in .env.production
echo "NEXT_PUBLIC_API_URL=https://your-domain.com/api" > .env.production

# Build for production
npm run build
```

### 10. PM2 Setup for Frontend

```bash
sudo npm install -g pm2

cd /home/stroycrm/stroymarketcrm/frontend
pm2 start npm --name "stroycrm-frontend" -- start
pm2 save
pm2 startup
```

### 11. Nginx Configuration

Create `/etc/nginx/sites-available/stroycrm`:

```nginx
# Backend API
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location /api/ {
        proxy_pass http://unix:/home/stroycrm/stroymarketcrm/backend/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /home/stroycrm/stroymarketcrm/backend/staticfiles/;
    }

    location /admin/ {
        proxy_pass http://unix:/home/stroycrm/stroymarketcrm/backend/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/stroycrm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 12. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo systemctl reload nginx
```

### 13. Firewall Setup

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## 🔧 Maintenance Commands

### Restart Services

```bash
# Backend
sudo systemctl restart stroycrm-backend

# Frontend
pm2 restart stroycrm-frontend

# Nginx
sudo systemctl restart nginx
```

### View Logs

```bash
# Backend
sudo journalctl -u stroycrm-backend -f

# Frontend
pm2 logs stroycrm-frontend

# Nginx
sudo tail -f /var/log/nginx/error.log
```

### Update Code

```bash
cd /home/stroycrm/stroymarketcrm

# Pull latest changes
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart stroycrm-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart stroycrm-frontend
```

### Backup Database

```bash
# Daily backup
sudo -u postgres pg_dump stroycrm_db > backup_$(date +%Y%m%d).sql

# Restore
sudo -u postgres psql stroycrm_db < backup_20260110.sql
```

---

## 📊 Monitoring

### Setup Monitoring

```bash
# Install monitoring tools
pm2 install pm2-logrotate
sudo apt install htop iotop -y

# Check resource usage
htop
pm2 monit
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend accessible at https://your-domain.com/api/
- [ ] Frontend accessible at https://your-domain.com/
- [ ] Admin panel works at https://your-domain.com/admin/
- [ ] SSL certificate valid and auto-renews
- [ ] Database backups automated
- [ ] Logs rotating properly
- [ ] Firewall configured
- [ ] Services auto-start on reboot
- [ ] Login works (admin/your_password)
- [ ] POS barcode scanner functional
- [ ] Reports generate correctly

---

## 🆘 Troubleshooting

### Backend Not Starting

```bash
# Check logs
sudo journalctl -u stroycrm-backend -n 50

# Test Gunicorn manually
cd /home/stroycrm/stroymarketcrm/backend
source venv/bin/activate
gunicorn config.wsgi:application
```

### Frontend Not Loading

```bash
# Check PM2 status
pm2 status
pm2 logs stroycrm-frontend --lines 100

# Restart
pm2 restart stroycrm-frontend
```

### Database Connection Error

```bash
# Check PostgreSQL running
sudo systemctl status postgresql

# Test connection
psql -U stroycrm_user -d stroycrm_db -h localhost
```

### 502 Bad Gateway

```bash
# Check Nginx config
sudo nginx -t

# Check socket file exists
ls -la /home/stroycrm/stroymarketcrm/backend/gunicorn.sock

# Restart all
sudo systemctl restart stroycrm-backend
sudo systemctl restart nginx
```

---

## 📞 Support

For issues, check logs first:
1. Backend: `sudo journalctl -u stroycrm-backend`
2. Frontend: `pm2 logs`
3. Nginx: `/var/log/nginx/error.log`

**Production URL**: https://your-domain.com
**Admin Panel**: https://your-domain.com/admin/
**API Root**: https://your-domain.com/api/
