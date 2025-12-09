import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

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

function collectFilesToExport(): string[] {
  const files: string[] = [];

  // Collect equipment images
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (fs.existsSync(uploadsDir)) {
    const imageFiles = fs.readdirSync(uploadsDir)
      .filter(f => !f.startsWith('.') && fs.statSync(path.join(uploadsDir, f)).isFile());
    imageFiles.forEach(f => files.push(`uploads/${f}`));
  }

  // Collect documents
  const docsDir = path.join(__dirname, '../../uploads/documents');
  if (fs.existsSync(docsDir)) {
    const docFiles = fs.readdirSync(docsDir)
      .filter(f => !f.startsWith('.') && fs.statSync(path.join(docsDir, f)).isFile());
    docFiles.forEach(f => files.push(`uploads/documents/${f}`));
  }

  return files;
}

async function createExportArchive(
  exportData: ExportData,
  files: string[]
): Promise<string> {
  const exportsDir = path.join(__dirname, '../../exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `lab-manager-backup-${timestamp}.zip`;
  const filepath = path.join(exportsDir, filename);

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(filepath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    output.on('close', () => resolve(filepath));
    archive.on('error', reject);

    archive.pipe(output);

    // Add database JSON
    archive.append(JSON.stringify(exportData, null, 2), {
      name: 'database/data.json'
    });

    // Add manifest
    const manifest = {
      exportDate: exportData.exportDate,
      version: exportData.version,
      totalFiles: files.length
    };
    archive.append(JSON.stringify(manifest, null, 2), {
      name: 'manifest.json'
    });

    // Add files
    for (const relPath of files) {
      const sourcePath = path.join(__dirname, '../..', relPath);
      if (fs.existsSync(sourcePath)) {
        archive.file(sourcePath, { name: `files/${relPath}` });
      }
    }

    archive.finalize();
  });
}

async function exportDatabase(): Promise<void> {
  console.log('🚀 Starting database export...\n');

  const exportData: ExportData = {
    exportDate: new Date().toISOString(),
    version: '2.0.0',
    tables: {
      users: [],
      equipment_categories: [],
      equipment: [],
      maintenance_history: [],
      equipment_remarks: [],
      bookings: [],
      site_settings: [],
      equipment_images: [],
      equipment_specs: [],
      document_categories: [],
      documents: []
    }
  };

  try {
    // Export users (excluding the default admin)
    console.log('📊 Exporting users...');
    const usersResult = await pool.query(
      `SELECT id, email, password_hash, full_name, role, approval_status,
              approved_by, approved_at, department, phone, is_active,
              created_at, updated_at
       FROM users
       WHERE email != 'admin@lab.com'
       ORDER BY created_at`
    );
    exportData.tables.users = usersResult.rows;
    console.log(`   ✅ Exported ${usersResult.rows.length} users\n`);

    // Export equipment categories (excluding default ones)
    console.log('📊 Exporting equipment categories...');
    const categoriesResult = await pool.query(
      `SELECT id, name, description, color, icon, created_at, updated_at
       FROM equipment_categories
       WHERE name NOT IN ('Major Equipment', 'Supporting Equipment', 'Accessories',
                          'Measurement Instruments', 'Safety Equipment')
       ORDER BY created_at`
    );
    exportData.tables.equipment_categories = categoriesResult.rows;
    console.log(`   ✅ Exported ${categoriesResult.rows.length} custom equipment categories\n`);

    // Export equipment
    console.log('📊 Exporting equipment...');
    const equipmentResult = await pool.query(
      `SELECT id, name, category_id, location, model_number, serial_number,
              purchase_year, purchase_cost, status, operating_notes, image_url,
              is_bookable, created_by, created_at, updated_at
       FROM equipment
       ORDER BY created_at`
    );
    exportData.tables.equipment = equipmentResult.rows;
    console.log(`   ✅ Exported ${equipmentResult.rows.length} equipment items\n`);

    // Export maintenance history
    console.log('📊 Exporting maintenance history...');
    const maintenanceResult = await pool.query(
      `SELECT id, equipment_id, maintenance_type, description, performed_by,
              performed_date, cost, next_maintenance_date, notes, created_at
       FROM maintenance_history
       ORDER BY created_at`
    );
    exportData.tables.maintenance_history = maintenanceResult.rows;
    console.log(`   ✅ Exported ${maintenanceResult.rows.length} maintenance records\n`);

    // Export equipment remarks
    console.log('📊 Exporting equipment remarks...');
    const remarksResult = await pool.query(
      `SELECT id, equipment_id, remark_type, description, severity, reported_by,
              resolved, resolved_by, resolved_at, created_at
       FROM equipment_remarks
       ORDER BY created_at`
    );
    exportData.tables.equipment_remarks = remarksResult.rows;
    console.log(`   ✅ Exported ${remarksResult.rows.length} equipment remarks\n`);

    // Export bookings
    console.log('📊 Exporting bookings...');
    const bookingsResult = await pool.query(
      `SELECT id, equipment_id, user_id, start_time, end_time, purpose, status,
              admin_notes, approved_by, approved_at, cancelled_at,
              cancellation_reason, created_at, updated_at
       FROM bookings
       ORDER BY created_at`
    );
    exportData.tables.bookings = bookingsResult.rows;
    console.log(`   ✅ Exported ${bookingsResult.rows.length} bookings\n`);

    // Export site settings
    console.log('📊 Exporting site settings...');
    const siteSettingsResult = await pool.query(
      `SELECT id, setting_key, setting_value, description, updated_by,
              created_at, updated_at
       FROM site_settings
       ORDER BY created_at`
    );
    exportData.tables.site_settings = siteSettingsResult.rows;
    console.log(`   ✅ Exported ${siteSettingsResult.rows.length} site settings\n`);

    // Export equipment images
    console.log('📊 Exporting equipment images...');
    const equipmentImagesResult = await pool.query(
      `SELECT id, equipment_id, image_url, image_name, is_primary,
              uploaded_by, created_at
       FROM equipment_images
       ORDER BY created_at`
    );
    exportData.tables.equipment_images = equipmentImagesResult.rows;
    console.log(`   ✅ Exported ${equipmentImagesResult.rows.length} equipment images\n`);

    // Export equipment specs
    console.log('📊 Exporting equipment specs...');
    const equipmentSpecsResult = await pool.query(
      `SELECT id, equipment_id, spec_key, spec_value, spec_unit,
              display_order, created_at, updated_at
       FROM equipment_specs
       ORDER BY equipment_id, display_order`
    );
    exportData.tables.equipment_specs = equipmentSpecsResult.rows;
    console.log(`   ✅ Exported ${equipmentSpecsResult.rows.length} equipment specs\n`);

    // Export document categories (excluding default ones)
    console.log('📊 Exporting document categories...');
    const documentCategoriesResult = await pool.query(
      `SELECT id, category_name, description, color, created_at
       FROM document_categories
       WHERE category_name NOT IN ('COSHH', 'SOP', 'Group Purchase', 'Other')
       ORDER BY created_at`
    );
    exportData.tables.document_categories = documentCategoriesResult.rows;
    console.log(`   ✅ Exported ${documentCategoriesResult.rows.length} custom document categories\n`);

    // Export documents
    console.log('📊 Exporting documents...');
    const documentsResult = await pool.query(
      `SELECT id, document_name, file_url, file_size,
              mime_type, description, uploaded_by, equipment_id,
              category_id, created_at, updated_at
       FROM documents
       ORDER BY created_at`
    );
    exportData.tables.documents = documentsResult.rows;
    console.log(`   ✅ Exported ${documentsResult.rows.length} documents\n`);

    // Collect files to export
    console.log('📦 Collecting files...');
    const files = collectFilesToExport();
    console.log(`   Found ${files.filter(f => f.startsWith('uploads/') && !f.includes('/documents/')).length} equipment images`);
    console.log(`   Found ${files.filter(f => f.includes('uploads/documents/')).length} document files\n`);

    // Create ZIP archive
    console.log('🗜️  Creating archive...');
    const filepath = await createExportArchive(exportData, files);

    console.log('✅ Export completed successfully!');
    console.log(`📁 Archive saved to: ${filepath}`);
    console.log('\n📊 Export Summary:');
    console.log(`   Users: ${exportData.tables.users.length}`);
    console.log(`   Equipment Categories: ${exportData.tables.equipment_categories.length}`);
    console.log(`   Equipment: ${exportData.tables.equipment.length}`);
    console.log(`   Maintenance History: ${exportData.tables.maintenance_history.length}`);
    console.log(`   Equipment Remarks: ${exportData.tables.equipment_remarks.length}`);
    console.log(`   Bookings: ${exportData.tables.bookings.length}`);
    console.log(`   Site Settings: ${exportData.tables.site_settings.length}`);
    console.log(`   Equipment Images: ${exportData.tables.equipment_images.length}`);
    console.log(`   Equipment Specs: ${exportData.tables.equipment_specs.length}`);
    console.log(`   Document Categories: ${exportData.tables.document_categories.length}`);
    console.log(`   Documents: ${exportData.tables.documents.length}`);

  } catch (error) {
    console.error('❌ Error during export:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the export
exportDatabase()
  .then(() => {
    console.log('\n✅ Database export completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database export failed:', error);
    process.exit(1);
  });
