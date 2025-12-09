import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Extract } from 'unzipper';

interface ExportData {
  exportDate: string;
  version: string;
  tables: {
    users: any[];
    equipment_categories: any[];
    equipment: any[];
    maintenance_history: any[];
    equipment_remarks: any[];
    bookings: any[];
    site_settings: any[];
    equipment_images: any[];
    equipment_specs: any[];
    document_categories: any[];
    documents: any[];
  };
}

async function detectFormat(filepath: string): Promise<'json' | 'zip'> {
  if (filepath.endsWith('.json')) return 'json';
  if (filepath.endsWith('.zip')) return 'zip';
  throw new Error('Unsupported format. Use .json or .zip');
}

async function extractArchive(filepath: string): Promise<string> {
  const tempDir = path.join(__dirname, '../../temp-import');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  await pipeline(
    createReadStream(filepath),
    Extract({ path: tempDir })
  );

  return tempDir;
}

async function restoreFiles(tempDir: string): Promise<void> {
  const filesDir = path.join(tempDir, 'files');
  if (!fs.existsSync(filesDir)) {
    console.log('⚠️  No files to restore');
    return;
  }

  // Restore uploads/
  const uploadsSource = path.join(filesDir, 'uploads');
  const uploadsDest = path.join(__dirname, '../../uploads');

  if (!fs.existsSync(uploadsDest)) {
    fs.mkdirSync(uploadsDest, { recursive: true });
  }

  if (fs.existsSync(uploadsSource)) {
    const files = fs.readdirSync(uploadsSource);
    let count = 0;
    for (const file of files) {
      const src = path.join(uploadsSource, file);
      const dest = path.join(uploadsDest, file);

      // Skip if exists (don't overwrite)
      if (!fs.existsSync(dest) && fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
        count++;
      }
    }
    console.log(`   ✅ Restored ${count} equipment images`);
  }

  // Restore uploads/documents/
  const docsSource = path.join(filesDir, 'uploads', 'documents');
  const docsDest = path.join(__dirname, '../../uploads/documents');

  if (!fs.existsSync(docsDest)) {
    fs.mkdirSync(docsDest, { recursive: true });
  }

  if (fs.existsSync(docsSource)) {
    const files = fs.readdirSync(docsSource);
    let count = 0;
    for (const file of files) {
      const src = path.join(docsSource, file);
      const dest = path.join(docsDest, file);

      // Skip if exists (don't overwrite)
      if (!fs.existsSync(dest) && fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
        count++;
      }
    }
    console.log(`   ✅ Restored ${count} document files`);
  }
}

function cleanupTempDir(tempDir: string): void {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function importDatabaseFromJSON(importData: ExportData): Promise<void> {
  console.log(`📅 Export Date: ${importData.exportDate}`);
  console.log(`📦 Version: ${importData.version}\n`);

    // Start transaction
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Import users
      console.log('📥 Importing users...');
      let usersImported = 0;
      for (const user of importData.tables.users) {
        await client.query(
          `INSERT INTO users (id, email, password_hash, full_name, role, approval_status,
                              approved_by, approved_at, department, phone, is_active,
                              created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (email) DO NOTHING`,
          [
            user.id, user.email, user.password_hash, user.full_name, user.role,
            user.approval_status, user.approved_by, user.approved_at, user.department,
            user.phone, user.is_active, user.created_at, user.updated_at
          ]
        );
        usersImported++;
      }
      console.log(`   ✅ Imported ${usersImported} users\n`);

      // Import equipment categories
      console.log('📥 Importing equipment categories...');
      let categoriesImported = 0;
      for (const category of importData.tables.equipment_categories) {
        await client.query(
          `INSERT INTO equipment_categories (id, name, description, color, icon,
                                             created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (name) DO NOTHING`,
          [
            category.id, category.name, category.description, category.color,
            category.icon, category.created_at, category.updated_at
          ]
        );
        categoriesImported++;
      }
      console.log(`   ✅ Imported ${categoriesImported} equipment categories\n`);

      // Import document categories
      console.log('📥 Importing document categories...');
      let documentCategoriesImported = 0;
      for (const category of importData.tables.document_categories || []) {
        await client.query(
          `INSERT INTO document_categories (id, category_name, description, color, created_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (category_name) DO NOTHING`,
          [category.id, category.category_name, category.description, category.color, category.created_at]
        );
        documentCategoriesImported++;
      }
      console.log(`   ✅ Imported ${documentCategoriesImported} document categories\n`);

      // Import equipment
      console.log('📥 Importing equipment...');
      let equipmentImported = 0;
      for (const equipment of importData.tables.equipment) {
        await client.query(
          `INSERT INTO equipment (id, name, category_id, location, model_number,
                                  serial_number, purchase_year, purchase_cost, status,
                                  operating_notes, image_url, is_bookable, created_by,
                                  created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO NOTHING`,
          [
            equipment.id, equipment.name, equipment.category_id, equipment.location,
            equipment.model_number, equipment.serial_number, equipment.purchase_year,
            equipment.purchase_cost, equipment.status, equipment.operating_notes,
            equipment.image_url, equipment.is_bookable, equipment.created_by,
            equipment.created_at, equipment.updated_at
          ]
        );
        equipmentImported++;
      }
      console.log(`   ✅ Imported ${equipmentImported} equipment items\n`);

      // Import site settings
      console.log('📥 Importing site settings...');
      let siteSettingsImported = 0;
      for (const setting of importData.tables.site_settings || []) {
        await client.query(
          `INSERT INTO site_settings (id, setting_key, setting_value, description, updated_by,
                                      created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (setting_key) DO UPDATE
           SET setting_value = EXCLUDED.setting_value,
               description = EXCLUDED.description,
               updated_at = EXCLUDED.updated_at`,
          [setting.id, setting.setting_key, setting.setting_value, setting.description,
           setting.updated_by, setting.created_at, setting.updated_at]
        );
        siteSettingsImported++;
      }
      console.log(`   ✅ Imported ${siteSettingsImported} site settings\n`);

      // Import equipment images
      console.log('📥 Importing equipment images...');
      let equipmentImagesImported = 0;
      for (const image of importData.tables.equipment_images || []) {
        await client.query(
          `INSERT INTO equipment_images (id, equipment_id, image_url, image_name, is_primary,
                                         uploaded_by, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [image.id, image.equipment_id, image.image_url, image.image_name,
           image.is_primary, image.uploaded_by, image.created_at]
        );
        equipmentImagesImported++;
      }
      console.log(`   ✅ Imported ${equipmentImagesImported} equipment images\n`);

      // Import equipment specs
      console.log('📥 Importing equipment specs...');
      let equipmentSpecsImported = 0;
      for (const spec of importData.tables.equipment_specs || []) {
        await client.query(
          `INSERT INTO equipment_specs (id, equipment_id, spec_key, spec_value, spec_unit,
                                        display_order, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [spec.id, spec.equipment_id, spec.spec_key, spec.spec_value, spec.spec_unit,
           spec.display_order, spec.created_at, spec.updated_at]
        );
        equipmentSpecsImported++;
      }
      console.log(`   ✅ Imported ${equipmentSpecsImported} equipment specs\n`);

      // Import maintenance history
      console.log('📥 Importing maintenance history...');
      let maintenanceImported = 0;
      for (const maintenance of importData.tables.maintenance_history) {
        await client.query(
          `INSERT INTO maintenance_history (id, equipment_id, maintenance_type, description,
                                            performed_by, performed_date, cost,
                                            next_maintenance_date, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [
            maintenance.id, maintenance.equipment_id, maintenance.maintenance_type,
            maintenance.description, maintenance.performed_by, maintenance.performed_date,
            maintenance.cost, maintenance.next_maintenance_date, maintenance.notes,
            maintenance.created_at
          ]
        );
        maintenanceImported++;
      }
      console.log(`   ✅ Imported ${maintenanceImported} maintenance records\n`);

      // Import equipment remarks
      console.log('📥 Importing equipment remarks...');
      let remarksImported = 0;
      for (const remark of importData.tables.equipment_remarks) {
        await client.query(
          `INSERT INTO equipment_remarks (id, equipment_id, remark_type, description,
                                          severity, reported_by, resolved, resolved_by,
                                          resolved_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [
            remark.id, remark.equipment_id, remark.remark_type, remark.description,
            remark.severity, remark.reported_by, remark.resolved, remark.resolved_by,
            remark.resolved_at, remark.created_at
          ]
        );
        remarksImported++;
      }
      console.log(`   ✅ Imported ${remarksImported} equipment remarks\n`);

      // Import bookings
      console.log('📥 Importing bookings...');
      let bookingsImported = 0;
      for (const booking of importData.tables.bookings) {
        await client.query(
          `INSERT INTO bookings (id, equipment_id, user_id, start_time, end_time,
                                 purpose, status, admin_notes, approved_by, approved_at,
                                 cancelled_at, cancellation_reason, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO NOTHING`,
          [
            booking.id, booking.equipment_id, booking.user_id, booking.start_time,
            booking.end_time, booking.purpose, booking.status, booking.admin_notes,
            booking.approved_by, booking.approved_at, booking.cancelled_at,
            booking.cancellation_reason, booking.created_at, booking.updated_at
          ]
        );
        bookingsImported++;
      }
      console.log(`   ✅ Imported ${bookingsImported} bookings\n`);

      // Import documents
      console.log('📥 Importing documents...');
      let documentsImported = 0;
      for (const doc of importData.tables.documents || []) {
        await client.query(
          `INSERT INTO documents (id, document_name, file_url, file_size,
                                  mime_type, description, uploaded_by, equipment_id,
                                  category_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [doc.id, doc.document_name, doc.file_url, doc.file_size,
           doc.mime_type, doc.description, doc.uploaded_by, doc.equipment_id,
           doc.category_id, doc.created_at, doc.updated_at]
        );
        documentsImported++;
      }
      console.log(`   ✅ Imported ${documentsImported} documents\n`);

      // Commit transaction
      await client.query('COMMIT');

      console.log('✅ Import completed successfully!');
      console.log('\n📊 Import Summary:');
      console.log(`   Users: ${usersImported}`);
      console.log(`   Equipment Categories: ${categoriesImported}`);
      console.log(`   Document Categories: ${documentCategoriesImported}`);
      console.log(`   Equipment: ${equipmentImported}`);
      console.log(`   Site Settings: ${siteSettingsImported}`);
      console.log(`   Equipment Images: ${equipmentImagesImported}`);
      console.log(`   Equipment Specs: ${equipmentSpecsImported}`);
      console.log(`   Maintenance History: ${maintenanceImported}`);
      console.log(`   Equipment Remarks: ${remarksImported}`);
      console.log(`   Bookings: ${bookingsImported}`);
      console.log(`   Documents: ${documentsImported}`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
}

async function importDatabase(filepath: string): Promise<void> {
  console.log('🚀 Starting database import...\n');

  try {
    const format = await detectFormat(filepath);

    if (format === 'json') {
      console.log('📦 Detected legacy JSON format\n');

      // Read the JSON file
      if (!fs.existsSync(filepath)) {
        throw new Error(`File not found: ${filepath}`);
      }

      const fileContent = fs.readFileSync(filepath, 'utf-8');
      const importData: ExportData = JSON.parse(fileContent);

      await importDatabaseFromJSON(importData);

    } else {
      console.log('📦 Detected ZIP archive format\n');

      const tempDir = await extractArchive(filepath);
      try {
        const dataPath = path.join(tempDir, 'database/data.json');

        if (!fs.existsSync(dataPath)) {
          throw new Error(`Database file not found in archive: ${dataPath}`);
        }

        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const importData: ExportData = JSON.parse(fileContent);

        await importDatabaseFromJSON(importData);

        console.log('\n📁 Restoring files...');
        await restoreFiles(tempDir);

      } finally {
        cleanupTempDir(tempDir);
      }
    }

  } catch (error) {
    console.error('❌ Error during import:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Get the filepath from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Error: Please provide the path to the export file');
  console.log('Usage: npm run import -- <path-to-export-file.json>');
  process.exit(1);
}

const filepath = path.resolve(args[0]);

// Run the import
importDatabase(filepath)
  .then(() => {
    console.log('\n✅ Database import completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database import failed:', error);
    process.exit(1);
  });
