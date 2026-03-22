# Database Export and Import Guide

This guide explains how to export data from your current lab equipment management system and import it into another instance of the system.

## Overview

There are two methods available for exporting and importing your database:

1. **JSON Export/Import** (Recommended) - Exports data to JSON format with built-in validation
2. **SQL Dump** - Traditional PostgreSQL dump for advanced users

## Prerequisites

- Node.js and npm installed
- Access to both source and target databases
- Properly configured `.env` files on both systems

## Method 1: JSON Export/Import (Recommended)

### Exporting Data

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the export script:
   ```bash
   npm run db:export
   ```

3. The export file will be created in `backend/exports/` directory with the filename:
   ```
   lab-manager-export-YYYY-MM-DD.json
   ```

### What Gets Exported

The JSON export includes:
- ✅ All users (excluding default admin@lab.com)
- ✅ Custom equipment categories (excluding default categories)
- ✅ All equipment items with full details
- ✅ Complete maintenance history
- ✅ Equipment remarks and damage reports
- ✅ All bookings and reservations

### What Does NOT Get Exported

- ❌ Default admin user (admin@lab.com)
- ❌ Default equipment categories (Major Equipment, Supporting Equipment, etc.)
- ❌ Database schema (the target system must already have the schema)

### Importing Data

1. Copy the export JSON file to the target system's `backend/exports/` directory

2. On the target system, navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Make sure the target database has the schema already set up. If not, run:
   ```bash
   npm run db:update-schema
   ```

4. Run the import script with the path to your export file:
   ```bash
   npm run db:import -- exports/lab-manager-export-YYYY-MM-DD.json
   ```

5. The import will:
   - Run in a transaction (all-or-nothing)
   - Skip duplicate entries (based on email, serial number, etc.)
   - Preserve all UUIDs and relationships
   - Show a summary of imported records

## Method 2: SQL Dump

### Exporting with SQL

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the SQL export script:
   ```bash
   npm run db:export-sql
   ```

   **Note:** This method requires `pg_dump` to be installed on your system. You can install it with PostgreSQL client tools.

3. The SQL dump file will be created in `backend/exports/` directory:
   ```
   lab-manager-dump-YYYY-MM-DD.sql
   ```

### Importing SQL Dump

1. Copy the SQL dump file to the target system

2. On the target system, make sure the database and schema are already created

3. Import using psql:
   ```bash
   psql -h localhost -U postgres -d lab_manager -f lab-manager-dump-YYYY-MM-DD.sql
   ```

   Replace the connection parameters with your target database credentials.

## Important Notes

### Before Importing

1. **Backup the target database** - Always backup before importing to prevent data loss
   ```bash
   pg_dump -h localhost -U postgres -d lab_manager > backup-before-import.sql
   ```

2. **Verify target system** - Ensure the target system has:
   - The same database schema version
   - Default admin user created
   - Default equipment categories created

3. **Check for conflicts** - If the target system already has data, imports will:
   - Skip users with duplicate emails
   - Skip equipment with duplicate serial numbers
   - Skip categories with duplicate names

### After Importing

1. **Verify data integrity**:
   - Login with an imported user account
   - Check equipment listings
   - Verify bookings and maintenance records

2. **Update file references** - If equipment has image URLs, you may need to:
   - Copy the `uploads/` directory from source to target
   - Or update image URLs to point to the correct location

3. **Test functionality**:
   - Create a test booking
   - Add a maintenance record
   - Submit an equipment remark

## Troubleshooting

### "Connection refused" Error

Check your `.env` file has correct database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lab_manager
DB_USER=postgres
DB_PASSWORD=your_password
```

### "File not found" Error

Make sure you're providing the correct path to the export file:
```bash
npm run db:import -- exports/lab-manager-export-2024-01-15.json
```

### "Foreign key constraint violation" Error

This usually means the target database is missing referenced records. Solutions:
1. Import in the correct order (users → categories → equipment → maintenance → remarks → bookings)
2. The scripts already handle this order automatically
3. If persists, check that all referenced UUIDs exist in the target database

### "pg_dump: command not found"

Install PostgreSQL client tools:
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql-client`

## Advanced Usage

### Exporting Specific Date Range

You can modify the export script to filter by date. Edit `backend/src/scripts/export-data.ts`:

```typescript
// Example: Only export bookings from the last 30 days
const bookingsResult = await pool.query(
  `SELECT * FROM bookings
   WHERE created_at >= NOW() - INTERVAL '30 days'
   ORDER BY created_at`
);
```

### Exporting Only Specific Tables

Comment out tables you don't want to export in `export-data.ts`:

```typescript
// exportData.tables.bookings = bookingsResult.rows;  // Skip bookings
```

### Custom Import Logic

The import scripts use `ON CONFLICT DO NOTHING` to skip duplicates. You can modify this to:
- Update existing records: `ON CONFLICT DO UPDATE SET ...`
- Generate new UUIDs: Remove the UUID from INSERT statement

## Support

If you encounter issues:
1. Check the console output for detailed error messages
2. Verify database connectivity
3. Ensure all prerequisites are met
4. Check that the source and target systems are running the same version

## Security Considerations

- ⚠️ Export files contain sensitive data including password hashes
- 🔒 Store export files securely
- 🗑️ Delete export files after successful import
- 🔐 Use secure file transfer methods (SCP, SFTP) when moving files between systems
- 👤 Inform users if you're migrating their accounts to a new system
