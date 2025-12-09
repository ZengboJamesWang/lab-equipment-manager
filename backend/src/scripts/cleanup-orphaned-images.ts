import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function cleanupOrphanedImages(): Promise<void> {
  console.log('🔍 Checking for orphaned equipment_images records...\n');

  try {
    // Get all equipment_images records
    const result = await pool.query(
      `SELECT id, equipment_id, image_url, image_name, created_at
       FROM equipment_images
       ORDER BY created_at`
    );

    console.log(`📊 Found ${result.rows.length} total image records in database\n`);

    const orphanedRecords: any[] = [];

    // Check if files exist
    for (const record of result.rows) {
      const filename = record.image_url.replace('/uploads/', '');
      const filepath = path.join(__dirname, '../../uploads', filename);

      if (!fs.existsSync(filepath)) {
        orphanedRecords.push(record);
      }
    }

    if (orphanedRecords.length === 0) {
      console.log('✅ No orphaned records found! All image files exist.\n');
      return;
    }

    console.log(`⚠️  Found ${orphanedRecords.length} orphaned image records:\n`);
    orphanedRecords.forEach((r, i) => {
      console.log(`${i + 1}. ${r.image_name}`);
      console.log(`   File: ${r.image_url}`);
      console.log(`   Created: ${new Date(r.created_at).toLocaleString()}`);
      console.log();
    });

    console.log('🗑️  Deleting orphaned records...\n');

    const ids = orphanedRecords.map(r => r.id);
    const deleteResult = await pool.query(
      `DELETE FROM equipment_images WHERE id = ANY($1::uuid[])`,
      [ids]
    );

    const deletedCount = deleteResult.rowCount || 0;
    console.log(`✅ Successfully deleted ${deletedCount} orphaned records`);
    console.log('\n📊 Cleanup Summary:');
    console.log(`   Total records checked: ${result.rows.length}`);
    console.log(`   Orphaned records removed: ${deletedCount}`);
    console.log(`   Valid records remaining: ${result.rows.length - deletedCount}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

cleanupOrphanedImages()
  .then(() => {
    console.log('\n✅ Cleanup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  });
