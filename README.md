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

### Core Functionality
- ✅ Complete equipment inventory management with categories and metadata
- ✅ Multi-image upload with primary image selection
- ✅ Custom technical specifications per equipment
- ✅ Advanced search, filtering, and calendar views
- ✅ Equipment status tracking and availability management

### Booking System
- ✅ Calendar-based booking interface with visual status indicators
- ✅ Configurable approval workflow per equipment
- ✅ Smart conflict detection and resolution
- ✅ Sortable booking table with filtering
- ✅ Admin approval controls and booking management

### Documents & Media
- ✅ Document upload and categorization (PDF, DOC, XLS, TXT)
- ✅ Color-coded categories with metadata
- ✅ Sortable columns and pagination
- ✅ File viewing, downloading, and link sharing

### User & Access Management
- ✅ JWT authentication with role-based access control
- ✅ User registration with admin approval workflow
- ✅ Password management and profile editing
- ✅ Department tracking and user activation controls

### Maintenance & Issues
- ✅ Maintenance history logging with cost tracking
- ✅ Scheduled maintenance and reminders
- ✅ Issue reporting with severity levels
- ✅ Resolution tracking and admin controls

### Site Administration
- ✅ Customizable site branding and settings
- ✅ Complete database export/import with files (ZIP format)
- ✅ Orphaned data cleanup utilities
- ✅ Migration system with version tracking

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
- **Backup & Migration:** archiver (ZIP creation), unzipper (extraction)

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

**Prerequisites:** Node.js 18+, PostgreSQL 14+

```bash
# 1. Create database
psql -U postgres
CREATE DATABASE lab_manager;
\q

# 2. Setup backend
cd backend
cp .env.example .env  # Edit with database credentials & JWT secret
npm install
npm run build
npm run db:migrate

# 3. Setup frontend
cd ../frontend
npm install
npm run build

# 4. Start application
npm start  # Production mode (http://localhost:5000)
# OR
npm run dev  # Development mode (http://localhost:3000)

# 5. Login
# Email: admin@lab.com
# Password: admin123
# ⚠️ Change password immediately after first login!
```

**Windows:** Use `copy` instead of `cp`, and `scripts\start.bat` or `scripts\start-dev.bat`

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

#### 5. Database Management Scripts

LabManager includes utilities for database export, import, and maintenance:

**Export Database (with all files):**
```bash
cd backend
npm run db:export
# Creates: exports/lab-manager-backup-YYYY-MM-DD.zip
```

**Import Database:**
```bash
cd backend
npm run db:import -- path/to/backup.zip
# Imports all tables and restores files
```

**Cleanup Orphaned Records:**
```bash
cd backend
npm run db:cleanup-orphaned-images
# Removes equipment_images records with missing files
```

**Legacy SQL Export:**
```bash
cd backend
npm run db:export-sql
# Creates SQL dump for manual restoration
```

#### 6. Start the Application

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

- Access at: http://localhost:5000
  (Backend serves both API and frontend static files)

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

**Note:** Development mode starts both backend and frontend servers. Production mode runs a single server that serves everything. Press `Ctrl+C` to stop.

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

> **📋 For complete deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

### Deployment Overview

LabManager uses a single-server architecture where the backend serves both the API and built frontend files.

**Quick Steps:**
1. Set up Linux server with Node.js 18+ and PostgreSQL 14+
2. Configure database and environment variables
3. Build and deploy application
4. Configure Nginx reverse proxy with SSL
5. Start with PM2 process manager

**Production Checklist:**
- ✅ Server with Node.js 18+, PostgreSQL 14+, Nginx
- ✅ Domain name pointing to server IP
- ✅ SSL certificate (Let's Encrypt)
- ✅ Firewall configured (ports 80, 443 open)
- ✅ Strong passwords for database and JWT secret

**See [DEPLOYMENT.md](DEPLOYMENT.md) for:**
- Step-by-step deployment guide
- Nginx configuration examples
- SSL certificate setup
- PM2 process management
- Troubleshooting deployment issues
- Backup and update procedures

**Quick Deploy Commands:**
```bash
# See DEPLOYMENT.md for prerequisites and detailed steps
cd /var/www/labmanager
git pull
cd backend && npm install --production && npm run build && npm run db:migrate
cd ../frontend && npm install && npm run build
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

**Application Issues:**
- Backend won't start: Check PostgreSQL status, verify `.env` credentials, ensure port 5000 is available
- Frontend blank page: Clear cache (Ctrl+Shift+R), check console (F12), verify `VITE_API_URL`
- File upload fails: Check `uploads/` directory exists, verify permissions (`chmod 755`), check file size < 5MB
- Database errors: Test connection with `psql`, verify PostgreSQL is running, check firewall rules

**Migration Issues:**
- **Migration fails**: System is idempotent and handles existing tables automatically
- **Missing columns**: Run `npm run db:migrate` AFTER `git pull` and `npm run build`
- **Check migration status:**
  ```bash
  sudo -u postgres psql -d lab_manager -c "SELECT * FROM schema_migrations ORDER BY version;"
  ```
- **Module not found**: Run `npm run build` before `npm run db:migrate` (TypeScript must be compiled)

**Export/Import Issues:**
- Export creates JSON: Ensure `archiver` dependency installed, check Node.js version 18+
- Import fails: Verify file extension (`.zip` or `.json`), test file with `unzip -t backup.zip`
- Files not restored: Check `uploads/` permissions, verify ZIP structure, check disk space
- Orphaned records: Run `npm run db:cleanup-orphaned-images`

**Other Issues:**
- Login fails after password change: Clear browser localStorage/cookies, try incognito mode
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment-specific troubleshooting

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
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── config/          # Database & migrations (schema.sql + 6 migration files)
│   │   ├── controllers/     # Business logic (auth, equipment, bookings, etc.)
│   │   ├── middleware/      # Auth & file upload middleware
│   │   ├── routes/          # API endpoints
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Migration utilities
│   │   ├── scripts/         # Export/import & cleanup scripts
│   │   └── server.ts        # Entry point
│   ├── uploads/             # User-uploaded files
│   ├── dist/                # Compiled JavaScript
│   └── package.json
│
├── frontend/                 # React/TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/           # Main application pages
│   │   ├── services/        # API client (axios)
│   │   ├── styles/          # Global CSS
│   │   └── App.tsx          # Root component
│   ├── dist/                # Built static files
│   └── package.json
│
├── scripts/                  # Cross-platform startup scripts
├── README.md                 # This file
├── DEPLOYMENT.md             # Deployment guide
└── package.json              # Root scripts
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
- **Enhanced database export/import** - Complete ZIP backups with all files ✨ NEW
- **Database maintenance utilities** - Cleanup scripts for orphaned data ✨ NEW
- Comprehensive deployment documentation for production servers

---

## 🙏 Acknowledgments

- Built with ❤️ for laboratory management
- Uses open-source technologies
- Community-driven development

---

**LabManager v1.0.0** - Making laboratory equipment management simple and efficient.
