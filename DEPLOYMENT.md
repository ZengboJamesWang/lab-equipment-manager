# Quick Deployment Guide for LabManager

## Deploying to Your Custom Domain (e.g., mydomain.com)

This guide provides a quick reference for deploying LabManager to a production server with your own domain name.

---

## 📋 Pre-Deployment Checklist

- [ ] Linux server (Ubuntu 20.04+ recommended) with root/sudo access
- [ ] Domain name (e.g., mydomain.com) pointing to server IP
- [ ] Minimum 4GB RAM, 2 CPU cores, 20GB storage
- [ ] Ports 22 (SSH), 80 (HTTP), 443 (HTTPS) accessible
- [ ] Email for SSL certificate registration

---

## 🚀 Quick Deployment Steps

### 1. Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Certbot (SSL certificates)
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Setup Database

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE lab_manager;
CREATE USER lab_admin WITH ENCRYPTED PASSWORD 'YOUR_STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE lab_manager TO lab_admin;
\q
```

### 3. Upload Application

```bash
# Create directory
sudo mkdir -p /var/www/labmanager
sudo chown -R $USER:$USER /var/www/labmanager

# Upload files (use scp, git clone, or ftp)
cd /var/www/labmanager
# ... transfer your files here ...
```

### 4. Configure Backend

Create `/var/www/labmanager/backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lab_manager
DB_USER=lab_admin
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# JWT (generate with: openssl rand -base64 64)
JWT_SECRET=PASTE_YOUR_GENERATED_64_CHAR_SECRET_HERE
JWT_EXPIRES_IN=7d

# CORS (use your actual domain)
CORS_ORIGIN=https://mydomain.com
```

### 5. Build and Deploy

```bash
# Backend
cd /var/www/labmanager/backend
npm install --production
npm run build
npm run db:migrate
mkdir -p uploads
chmod 755 uploads

# Frontend
cd /var/www/labmanager/frontend
npm install
npm run build
```

### 6. Start with PM2

```bash
cd /var/www/labmanager/backend
pm2 start dist/server.js --name "labmanager"
pm2 save
pm2 startup  # Follow the command it outputs
```

### 7. Configure Nginx

Create `/etc/nginx/sites-available/labmanager`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name mydomain.com www.mydomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mydomain.com www.mydomain.com;

    # SSL (certbot will update these paths)
    ssl_certificate /etc/letsencrypt/live/mydomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mydomain.com/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    client_max_body_size 10M;

    # Proxy to backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/labmanager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Obtain SSL Certificate

```bash
# Make sure your domain points to this server first!
sudo certbot --nginx -d mydomain.com -d www.mydomain.com
```

Follow the prompts and provide your email.

### 9. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 10. Verify Deployment

1. Visit `https://mydomain.com`
2. Login with:
   - Email: `admin@lab.com`
   - Password: `admin123`
3. **IMMEDIATELY** change password in Settings
4. Configure site name in Settings
5. Test all features

---

## 🔧 Common Configuration Changes

### Update CORS for Multiple Domains

In `backend/.env`:
```env
CORS_ORIGIN=https://mydomain.com,https://www.mydomain.com,https://app.mydomain.com
```

### Change Application Port

In `backend/.env`:
```env
PORT=8080  # Or any other port
```

Update Nginx proxy_pass accordingly:
```nginx
proxy_pass http://localhost:8080;
```

### Increase Upload Size Limit

In Nginx config:
```nginx
client_max_body_size 50M;  # Adjust as needed
```

In `backend/src/middleware/upload.ts`, update the multer limits.

---

## 📊 Monitoring Commands

```bash
# Check application status
pm2 status
pm2 logs labmanager
pm2 monit

# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/labmanager_access.log
sudo tail -f /var/log/nginx/labmanager_error.log

# Check PostgreSQL
sudo systemctl status postgresql

# Check SSL certificate
sudo certbot certificates
```

---

## 🔄 Update Application

```bash
# Stop app
pm2 stop labmanager

# Backup database
pg_dump -U lab_admin lab_manager > backup_$(date +%Y%m%d).sql

# Update code (if using git)
cd /var/www/labmanager
git pull

# Rebuild
cd backend
npm install --production
npm run build
npm run db:migrate

cd ../frontend
npm install
npm run build

# Restart
pm2 restart labmanager
```

---

## 🔐 Security Checklist

- [ ] Changed default admin password
- [ ] Generated strong JWT secret (64+ characters)
- [ ] Using strong database password
- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] CORS_ORIGIN set to your specific domain (not *)
- [ ] NODE_ENV=production
- [ ] Database user has limited privileges
- [ ] Regular backups configured
- [ ] Server kept up-to-date (`sudo apt update && sudo apt upgrade`)

---

## 📞 Troubleshooting

**Application won't start:**
```bash
pm2 logs labmanager  # Check for errors
pm2 restart labmanager
```

**502 Bad Gateway:**
- Check if backend is running: `pm2 status`
- Check backend port matches Nginx config
- Check backend logs: `pm2 logs`

**Can't access via domain:**
- Verify DNS points to server IP: `nslookup mydomain.com`
- Check firewall: `sudo ufw status`
- Check Nginx: `sudo nginx -t`

**Database connection errors:**
```bash
# Test database connection
psql -U lab_admin -d lab_manager -h localhost
# Check credentials in backend/.env
```

**SSL certificate issues:**
```bash
# Renew manually
sudo certbot renew
# Check status
sudo certbot certificates
```

---

## 📋 Daily Backup Script

Create `/var/www/labmanager/scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/labmanager"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U lab_admin -h localhost lab_manager > "$BACKUP_DIR/db_$DATE.sql"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /var/www/labmanager/backend/uploads/

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and schedule:
```bash
chmod +x /var/www/labmanager/scripts/backup.sh
crontab -e
# Add: 0 2 * * * /var/www/labmanager/scripts/backup.sh >> /var/log/labmanager-backup.log 2>&1
```

---

## 📚 Additional Resources

- Full documentation: See `README.md`
- PM2 documentation: https://pm2.keymetrics.io/
- Let's Encrypt: https://letsencrypt.org/
- Nginx docs: https://nginx.org/en/docs/

---

**Need help?** Check the full README.md or contact your system administrator.
