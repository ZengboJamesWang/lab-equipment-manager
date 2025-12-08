import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

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
  };
}

async function exportDatabase(): Promise<void> {
  console.log('🚀 Starting database export...\n');

  const exportData: ExportData = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    tables: {
      users: [],
      equipment_categories: [],
      equipment: [],
      maintenance_history: [],
      equipment_remarks: [],
      bookings: []
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

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Write to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `lab-manager-export-${timestamp}.json`;
    const filepath = path.join(exportsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    console.log('✅ Export completed successfully!');
    console.log(`📁 File saved to: ${filepath}`);
    console.log('\n📊 Export Summary:');
    console.log(`   Users: ${exportData.tables.users.length}`);
    console.log(`   Equipment Categories: ${exportData.tables.equipment_categories.length}`);
    console.log(`   Equipment: ${exportData.tables.equipment.length}`);
    console.log(`   Maintenance History: ${exportData.tables.maintenance_history.length}`);
    console.log(`   Equipment Remarks: ${exportData.tables.equipment_remarks.length}`);
    console.log(`   Bookings: ${exportData.tables.bookings.length}`);

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
