# Laboratory Equipment Management System (LabManager)

**Version 1.0.0** - First Official Release

A comprehensive full-stack web application designed for managing laboratory equipment inventory, bookings, maintenance records, document management, and issue tracking. Built with modern technologies for reliability, security, and ease of use.

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Requirements](#-system-requirements)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment) - **See also: [DEPLOYMENT.md](DEPLOYMENT.md) for quick reference**
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

### Equipment Management
- ✅ Complete CRUD operations for equipment inventory
- ✅ Multiple equipment categories with customizable colors
- ✅ Detailed metadata tracking (name, model, serial number, location, purchase info)
- ✅ Equipment status tracking (active, under maintenance, reserved, decommissioned)
- ✅ **Multi-image upload** support (local files or URLs, max 5MB)
- ✅ **Primary image selection** for equipment cards
- ✅ **Technical specifications** management with custom key-value pairs
- ✅ Operating notes and manuals
- ✅ Advanced search and filtering
- ✅ Equipment calendar availability view

### Booking & Reservation System
- ✅ Intuitive booking interface with calendar visualization
- ✅ **Equipment approval workflow** - configurable per equipment
- ✅ **Visual status indicators**:
  - Pending bookings (yellow background with ⏳)
  - Confirmed bookings (green background)
  - Cancelled bookings (filtered from display)
- ✅ **Smart conflict detection** (includes pending and confirmed bookings)
- ✅ **Sortable booking table** - sort by equipment, user, time, or status
- ✅ Booking request submission and management
- ✅ Admin approval/rejection controls with notes
- ✅ Email and purpose tracking
- ✅ Edit and cancel bookings
- ✅ Personal booking history with filtering options

### Document Management
- ✅ **Document upload and storage** (PDF, DOC, DOCX, XLS, XLSX, TXT)
- ✅ **Document categories** with color coding
- ✅ **Description and metadata** tracking
- ✅ Document viewing, downloading, and link sharing
- ✅ **Category-based filtering** and organization
- ✅ **Sortable columns** (name, category, size, date, uploader)
- ✅ **Pagination** for large document collections
- ✅ Admin controls for document and category management

### User Management
- ✅ JWT-based secure authentication
- ✅ Role-based access control (Admin/User)
- ✅ User registration with approval workflow
- ✅ **Password change functionality** for all users
- ✅ User profile management
- ✅ Department and contact information tracking
- ✅ User activation/deactivation (admin)
- ✅ Role promotion/demotion (admin)

### Maintenance Tracking
- ✅ Comprehensive maintenance history logging
- ✅ Maintenance types (routine, repair, calibration, inspection)
- ✅ Cost tracking and budgeting
- ✅ Next maintenance scheduling
- ✅ Maintenance records per equipment
- ✅ Technician and notes tracking

### Issue Reporting & Remarks
- ✅ Equipment issue and damage reporting
- ✅ Severity levels (low, medium, high, critical)
- ✅ Issue tracking and resolution workflow
- ✅ Admin controls for issue resolution
- ✅ Comment and follow-up system

### Site Configuration
- ✅ **Customizable site name** (admin configurable)
- ✅ Dynamic branding throughout application
- ✅ Settings management interface
- ✅ Extensible configuration system

---

## 🛠 Technology Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 14+
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** express-validator
- **Security:** bcryptjs for password hashing
- **File Upload:** Multer (5MB limit per file)
- **CORS:** Configurable cross-origin resource sharing

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Date Handling:** date-fns
- **Icons:** lucide-react
- **Styling:** Custom CSS with CSS variables

### Database
- **PostgreSQL 14+** with connection pooling
- **Schema migrations** for version control
- **Parameterized queries** for SQL injection prevention

---

## 💻 System Requirements

### Minimum Requirements
- **CPU:** 2 cores
- **RAM:** 4GB
- **Storage:** 10GB free space
- **Operating System:** Windows, macOS, or Linux

### Recommended Requirements
- **CPU:** 4 cores
- **RAM:** 8GB
- **Storage:** 20GB+ (for document and image storage)
- **Operating System:** Linux (Ubuntu 20.04+) or Windows Server

### Software Prerequisites
- **Node.js:** v18.0.0 or higher
- **PostgreSQL:** v14.0 or higher
- **npm:** v9.0.0 or higher (comes with Node.js)

---

## ⚡ Quick Start

### For Windows Users

1. **Ensure PostgreSQL is running:**
   ```bash
   # Open PowerShell or Command Prompt
   psql -U postgres
   CREATE DATABASE lab_manager;
   \q
   ```

2. **Clone or extract the project:**
   ```bash
   cd C:\path\to\LabManager
   ```

3. **Configure environment:**
   ```bash
   cd backend
   copy .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

4. **Install and setup:**
   ```bash
   cd backend
   npm install
   npm run build
   npm run db:migrate

   cd ..\frontend
   npm install
   npm run build
   ```

5. **Start the application:**

   **Production Mode (recommended):**
   ```bash
   # Windows
   scripts\start.bat

   # Or using npm (all platforms)
   npm start
   ```
   Access at: http://localhost:4173

   **Development Mode (for testing):**
   ```bash
   # Windows
   scripts\start-dev.bat

   # Or using npm (all platforms)
   npm run dev
   ```
   Access at: http://localhost:3000

6. **Login and setup:**
   - Open browser and navigate to the URL shown above
   - Login with: `admin@lab.com` / `admin123`
   - **Change password immediately!**
   - Configure site settings and add equipment

---

## 📦 Installation

### Detailed Installation Steps

#### 1. Install Prerequisites

**Node.js:**
- Download from: https://nodejs.org/
- Install LTS version
- Verify: `node --version` and `npm --version`

**PostgreSQL:**
- Windows: Download from https://www.postgresql.org/download/windows/
- macOS: `brew install postgresql@14`
- Linux: `sudo apt install postgresql postgresql-contrib`
- Verify: `psql --version`

#### 2. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE lab_manager;
CREATE USER lab_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE lab_manager TO lab_admin;
\q
```

#### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env file with your settings:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=lab_manager
# DB_USER=lab_admin
# DB_PASSWORD=your_secure_password
# JWT_SECRET=generate_a_strong_random_secret_here
# PORT=5000
# NODE_ENV=development

# Build the backend
npm run build

# Run database migrations
npm run db:migrate

# Create uploads directory
mkdir uploads
```

**Generate a secure JWT secret:**
```bash
# Linux/macOS:
openssl rand -base64 64

# Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

#### 4. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment (optional)
cp .env.example .env

# Edit .env if needed:
# VITE_API_URL=http://localhost:5000/api

# Build the frontend
npm run build
```

#### 5. Start the Application

LabManager provides cross-platform startup scripts in the `scripts/` folder.

**Production Mode (Recommended):**

Serves the built/optimized version for production use.

```bash
# Windows
scripts\start.bat

# Linux/macOS
./scripts/start.sh

# Or using npm (all platforms)
npm start
```

- Backend: http://localhost:5000
- Frontend: http://localhost:4173

**Development Mode:**

Runs with hot-reload for active development.

```bash
# Windows
scripts\start-dev.bat

# Linux/macOS
./scripts/start-dev.sh

# Or using npm (all platforms)
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

**Note:** Both modes start backend and frontend servers together. Press `Ctrl+C` to stop both.

**Make scripts executable (Linux/macOS only):**
```bash
chmod +x scripts/*.sh scripts/*.js
```

---

## ⚙️ Configuration

### Backend Configuration (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lab_manager
DB_USER=lab_admin
DB_PASSWORD=your_secure_password

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_very_long_random_secret_key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration (.env)

```env
# API URL
VITE_API_URL=http://localhost:5000/api

# Optional: Site Name Override
VITE_SITE_NAME=My Laboratory
```

---

## 📖 Usage Guide

### First-Time Setup

1. **Login as Admin:**
   - Email: `admin@lab.com`
   - Password: `admin123`

2. **Change Admin Password:**
   - Click "Profile" in the header
   - Navigate to "Change Password"
   - Enter current password and new password
   - **Critical for security!**

3. **Configure Site Settings:**
   - Go to Settings page (Admin only)
   - Update site name
   - Save changes

4. **Create Equipment Categories:**
   - Navigate to Categories page
   - Add categories (e.g., Microscopes, Centrifuges, Spectrophotometers)
   - Assign colors for visual identification

5. **Add Equipment:**
   - Go to Equipment page
   - Click "Add Equipment"
   - Fill in details (name, category, location, model, etc.)
   - Upload images
   - Add technical specifications
   - Configure booking settings
   - Enable approval workflow if needed

6. **Create Document Categories:**
   - Go to Documents page
   - Click "New Category" (Admin only)
   - Add categories (e.g., SOPs, Manuals, Safety Documents)

7. **Upload Documents:**
   - Select category
   - Add description
   - Choose file
   - Upload

### User Features

**Equipment Management:**
- Browse equipment catalog
- Search and filter by category, status, location
- View equipment details, images, and specifications
- Check availability calendar

**Booking Equipment:**
- Navigate to equipment details
- Click "Book Equipment"
- Select date and time range
- Add purpose/notes
- Submit booking request
- Track booking status (pending/confirmed)

**Document Access:**
- Browse documents by category
- Search and filter
- View, download, or share links
- Sort by any column

**Profile Management:**
- Update personal information
- Change password
- View department and role

### Administrator Features

**Equipment Administration:**
- Full CRUD operations
- Upload multiple images
- Manage technical specifications
- Configure approval requirements
- Set booking availability

**Booking Management:**
- Approve or reject pending bookings
- View all bookings system-wide
- Cancel bookings if needed

**Document Administration:**
- Upload and categorize documents
- Delete documents
- Manage document categories
- Delete categories (with cascade warnings)

**User Management:**
- Approve new user registrations
- Promote users to admin
- Demote admins to users
- Activate/deactivate accounts

**Maintenance & Issues:**
- Log maintenance activities
- Track maintenance costs
- Schedule future maintenance
- Review and resolve equipment issues

---

## 🔌 API Documentation

### Authentication Endpoints

**POST `/api/auth/register`** - Register new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "department": "Chemistry",
  "phone": "555-1234"
}
```

**POST `/api/auth/login`** - Login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**GET `/api/auth/me`** - Get current user (requires auth)

**POST `/api/users/change-password`** - Change password (requires auth)
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### Equipment Endpoints

**GET `/api/equipment`** - Get all equipment
**GET `/api/equipment/:id`** - Get equipment details
**POST `/api/equipment`** (Admin) - Create equipment
**PUT `/api/equipment/:id`** (Admin) - Update equipment
**DELETE `/api/equipment/:id`** (Admin) - Delete equipment

### Document Endpoints

**GET `/api/documents`** - Get all documents
**POST `/api/documents/upload`** (Admin) - Upload document
**DELETE `/api/documents/:id`** (Admin) - Delete document
**GET `/api/document-categories`** - Get all categories
**POST `/api/document-categories`** (Admin) - Create category
**DELETE `/api/document-categories/:id`** (Admin) - Delete category

### Booking Endpoints

**GET `/api/bookings`** - Get bookings (filtered by user or all for admin)
**POST `/api/bookings`** - Create booking
**PUT `/api/bookings/:id/status`** (Admin) - Update booking status
**DELETE `/api/bookings/:id`** - Cancel booking

For full API documentation, see inline comments in route files.

---

## 🌐 Deployment

> **Quick Start:** For a condensed step-by-step deployment checklist, see [DEPLOYMENT.md](DEPLOYMENT.md)

### Deployment Overview

LabManager uses a **single-server architecture** where the backend serves both the API and the built frontend files. This simplifies deployment as you only need to run one Node.js process.

### Pre-Deployment Checklist

Before deploying to your domain (e.g., `mydomain.com`), ensure you have:

- ✅ A server with Node.js 18+ and PostgreSQL 14+ installed
- ✅ A domain name pointing to your server's IP address
- ✅ SSL/TLS certificate (Let's Encrypt recommended)
- ✅ Firewall configured (ports 80, 443 open; port 5432 restricted)
- ✅ Sufficient storage for uploads and documents (20GB+ recommended)

---

### Production Deployment Steps

#### 1. Server Preparation

```bash
# Update system packages (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install process manager (PM2)
sudo npm install -g pm2
```

#### 2. Database Setup for Production

```bash
# Switch to postgres user
sudo -u postgres psql

# Create production database and user
CREATE DATABASE lab_manager;
CREATE USER lab_admin WITH ENCRYPTED PASSWORD 'STRONG_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE lab_manager TO lab_admin;
\q
```

**Security Note:** Use a strong, unique password for the database user.

#### 3. Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/labmanager
sudo chown -R $USER:$USER /var/www/labmanager
cd /var/www/labmanager

# Upload or clone your application files here
# (Use git clone, scp, or other transfer method)

# Set proper permissions
chmod -R 755 /var/www/labmanager
```

#### 4. Backend Configuration for Production

```bash
cd /var/www/labmanager/backend

# Create production .env file
nano .env
```

**Production `.env` configuration:**

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lab_manager
DB_USER=lab_admin
DB_PASSWORD=YOUR_STRONG_DATABASE_PASSWORD

# JWT Configuration (CRITICAL: Generate a new secret)
JWT_SECRET=GENERATE_A_VERY_LONG_RANDOM_STRING_HERE_64_PLUS_CHARACTERS
JWT_EXPIRES_IN=7d

# CORS Configuration
# Option 1: Specific domain (recommended for security)
CORS_ORIGIN=https://mydomain.com

# Option 2: Multiple domains (comma-separated, if needed)
# CORS_ORIGIN=https://mydomain.com,https://www.mydomain.com

# Option 3: Allow all origins (NOT recommended for production)
# CORS_ORIGIN=*
```

**Generate secure JWT secret:**

```bash
# Linux/macOS:
openssl rand -base64 64

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

#### 5. Frontend Configuration for Production

```bash
cd /var/www/labmanager/frontend

# Create production .env file (optional - usually not needed)
nano .env
```

**Frontend `.env` (optional):**

```env
# API URL - Leave as /api to use same-origin requests
VITE_API_URL=/api

# Site Name (optional, can be configured in app settings)
VITE_SITE_NAME=My Laboratory
```

**Note:** For production, the frontend uses `/api` which proxies to the backend running on the same server.

#### 6. Build and Deploy

```bash
# Install and build backend
cd /var/www/labmanager/backend
npm install --production
npm run build

# Run database migrations
npm run db:migrate

# Create uploads directory with proper permissions
mkdir -p uploads
chmod 755 uploads

# Install and build frontend
cd /var/www/labmanager/frontend
npm install
npm run build

# Verify build was successful
ls -la dist/
```

#### 7. Start Application with PM2

```bash
# Navigate to backend directory
cd /var/www/labmanager/backend

# Start the application
pm2 start dist/server.js --name "labmanager" --env production

# Save PM2 configuration
pm2 save

# Configure PM2 to start on system boot
pm2 startup
# (Follow the command it outputs - you may need to run with sudo)

# Monitor application logs
pm2 logs labmanager

# Check application status
pm2 status
```

**PM2 Management Commands:**

```bash
pm2 restart labmanager    # Restart application
pm2 stop labmanager       # Stop application
pm2 delete labmanager     # Remove from PM2
pm2 logs labmanager       # View logs
pm2 monit                 # Monitor resources
```

#### 8. Configure Reverse Proxy with Nginx

**Install Nginx:**

```bash
sudo apt install -y nginx
```

**Create Nginx configuration:**

```bash
sudo nano /etc/nginx/sites-available/labmanager
```

**Nginx configuration for `mydomain.com`:**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name mydomain.com www.mydomain.com;

    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mydomain.com www.mydomain.com;

    # SSL Configuration (update paths after obtaining certificates)
    ssl_certificate /etc/letsencrypt/live/mydomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mydomain.com/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Max upload size (adjust as needed)
    client_max_body_size 10M;

    # Proxy to Node.js backend (serves both API and frontend)
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

    # Optional: Serve uploads directly via Nginx (better performance)
    location /uploads/ {
        alias /var/www/labmanager/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Logging
    access_log /var/log/nginx/labmanager_access.log;
    error_log /var/log/nginx/labmanager_error.log;
}
```

**Enable the site:**

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/labmanager /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### 9. Obtain SSL/TLS Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate (replace with your domain)
sudo certbot --nginx -d mydomain.com -d www.mydomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

**Certbot will automatically:**
- Obtain SSL certificates
- Update Nginx configuration
- Set up automatic renewal

#### 10. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check firewall status
sudo ufw status
```

#### 11. Post-Deployment Verification

**Test the deployment:**

1. **Access your site:** `https://mydomain.com`
2. **Login with default credentials:**
   - Email: `admin@lab.com`
   - Password: `admin123`
3. **IMMEDIATELY change the admin password** in Settings > Change Password
4. **Configure site settings:** Settings > Site Name
5. **Test all features:**
   - Equipment management
   - Bookings
   - Document uploads
   - User registration/approval

**Check application logs:**

```bash
# PM2 logs
pm2 logs labmanager

# Nginx logs
sudo tail -f /var/log/nginx/labmanager_access.log
sudo tail -f /var/log/nginx/labmanager_error.log
```

---

### Alternative: Direct Deployment (Without Nginx)

If you prefer to run the application directly without a reverse proxy:

```bash
# Update backend .env
PORT=80          # For HTTP (requires sudo/root)
# or
PORT=443         # For HTTPS (requires SSL certificates in Node.js)

# Update CORS_ORIGIN
CORS_ORIGIN=https://mydomain.com

# Run with PM2 as root (for ports < 1024)
sudo pm2 start dist/server.js --name "labmanager"
```

**Note:** Using Nginx as a reverse proxy is **strongly recommended** for:
- SSL/TLS termination
- Static file caching
- Better security
- Load balancing (future scaling)
- Easier certificate management

---

### Environment-Specific Configurations

#### Development
- `NODE_ENV=development`
- `CORS_ORIGIN=http://localhost:3000`
- Hot reload enabled
- Detailed error logging

#### Production
- `NODE_ENV=production`
- `CORS_ORIGIN=https://mydomain.com`
- Optimized builds
- Error logging to files
- PM2 process management

---

### Backup Strategy

**Database backups:**

```bash
# Create backup script
nano /var/www/labmanager/scripts/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/labmanager"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U lab_admin -h localhost lab_manager > "$BACKUP_DIR/lab_manager_$DATE.sql"

# Backup uploads directory
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /var/www/labmanager/backend/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /var/www/labmanager/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
# 0 2 * * * /var/www/labmanager/scripts/backup-db.sh >> /var/log/labmanager-backup.log 2>&1
```

---

### Monitoring and Maintenance

**Monitor application:**

```bash
# System resources
pm2 monit

# Application logs
pm2 logs labmanager --lines 100

# System health
systemctl status nginx
systemctl status postgresql
```

**Update the application:**

```bash
# Stop application
pm2 stop labmanager

# Backup database first!
pg_dump -U lab_admin lab_manager > backup_before_update.sql

# Pull updates (if using git)
cd /var/www/labmanager
git pull

# Rebuild backend
cd backend
npm install --production
npm run build

# Run migrations if any
npm run db:migrate

# Rebuild frontend
cd ../frontend
npm install
npm run build

# Restart application
pm2 restart labmanager
```

---

## 🔒 Security

### Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT-based stateless authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ File upload validation (type, size, sanitization)
- ✅ CORS protection
- ✅ Rate limiting ready (can be configured)
- ✅ Secure HTTP headers

### Security Best Practices

1. **Change Default Credentials Immediately**
2. **Use Strong JWT Secret** (64+ character random string)
3. **Enable HTTPS in Production** (use Let's Encrypt)
4. **Configure Firewall** (only expose ports 80, 443)
5. **Regular Backups** (database + uploads directory)
6. **Keep Dependencies Updated**
7. **Monitor Logs for Suspicious Activity**
8. **Use Environment Variables** (never commit secrets)

---

## 🔧 Troubleshooting

### Common Issues

**Backend won't start:**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database credentials in `.env`
- Ensure port 5000 is available: `netstat -an | grep 5000`
- Check logs for error messages

**Frontend shows blank page:**
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors (F12)
- Verify `VITE_API_URL` in `.env`
- Ensure backend is running

**Can't upload files:**
- Verify `uploads/` directory exists in backend
- Check directory permissions: `chmod 755 backend/uploads`
- Verify file size is under 5MB
- Check file format is supported

**Database connection errors:**
- Test connection: `psql -U lab_admin -d lab_manager -h localhost`
- Check PostgreSQL is accepting connections
- Verify firewall rules
- Review PostgreSQL logs

**Login fails after password change:**
- Clear browser localStorage and cookies
- Try incognito/private browsing mode
- Verify password was changed successfully in database

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Coding Standards

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

---

## 📄 License

MIT License

Copyright (c) 2025 Laboratory Equipment Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 📞 Support

For technical support, bug reports, or feature requests:

- Check this README and troubleshooting section
- Review issue tracker (if available)
- Contact your system administrator

---

## 🎯 Project Structure

```
LabManager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── schema.sql
│   │   │   ├── migrations/
│   │   │   │   ├── 001_add_site_settings_and_equipment_features.sql
│   │   │   │   ├── 002_add_equipment_requires_approval.sql
│   │   │   │   ├── 003_update_booking_status_constraint.sql
│   │   │   │   ├── 004_add_documents_table.sql
│   │   │   │   ├── 005_add_document_categories.sql
│   │   │   │   └── 006_fix_documents_schema.sql
│   │   │   └── run-migration.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── equipmentController.ts
│   │   │   ├── bookingController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── documentController.ts
│   │   │   ├── documentCategoryController.ts
│   │   │   ├── maintenanceController.ts
│   │   │   ├── remarkController.ts
│   │   │   └── settingsController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── upload.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── equipmentRoutes.ts
│   │   │   ├── bookingRoutes.ts
│   │   │   ├── categoryRoutes.ts
│   │   │   ├── documentRoutes.ts
│   │   │   ├── documentCategoryRoutes.ts
│   │   │   ├── maintenanceRoutes.ts
│   │   │   ├── remarkRoutes.ts
│   │   │   └── settingsRoutes.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── migrate.ts
│   │   └── server.ts
│   ├── uploads/              (Auto-created)
│   ├── dist/                 (Built files)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   └── EquipmentCalendar.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Equipment.tsx
│   │   │   ├── EquipmentDetails.tsx
│   │   │   ├── Bookings.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── Maintenance.tsx
│   │   │   ├── Remarks.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Profile.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── dist/                 (Built files)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── scripts/                  (Startup scripts)
│   ├── start.js             (Production - Node.js)
│   ├── start-dev.js         (Development - Node.js)
│   ├── start.bat            (Production - Windows)
│   ├── start-dev.bat        (Development - Windows)
│   ├── start.sh             (Production - Linux/macOS)
│   └── start-dev.sh         (Development - Linux/macOS)
├── .gitignore
├── LICENSE
├── README.md
├── CONTRIBUTING.md
└── package.json              (Root package for npm scripts)
```

---

## 🔄 Version History

### v1.0.0 - Initial Release (December 2025)

First official release of the Laboratory Equipment Management System.

**Features:**
- Complete equipment inventory management system
- Booking and reservation workflow with approval system
- Sortable booking table with status filtering
- Cancelled bookings automatically filtered from display
- Document management with categories
- User authentication and profile management
- Password change functionality for all users
- Maintenance tracking and scheduling
- Issue reporting and resolution
- Admin dashboard and controls
- Sortable tables with pagination
- Multi-image upload for equipment
- Technical specifications management
- Customizable site branding
- JWT authentication and role-based access control
- Input validation and file upload security
- Comprehensive deployment documentation for production servers

---

## 🙏 Acknowledgments

- Built with ❤️ for laboratory management
- Uses open-source technologies
- Community-driven development

---

**LabManager v1.0.0** - Making laboratory equipment management simple and efficient.
