-- Migration: Add site settings, equipment images, and equipment specs
-- Created: 2025-11-27

-- 1. Create site settings table for storing configurable site settings
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default site name setting
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES ('site_name', 'Lab Manager', 'The name displayed in the application header')
ON CONFLICT (setting_key) DO NOTHING;

-- 2. Create equipment images table (allow multiple images per equipment)
CREATE TABLE IF NOT EXISTS equipment_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create equipment specs table for custom specifications
CREATE TABLE IF NOT EXISTS equipment_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    spec_key VARCHAR(100) NOT NULL,
    spec_value TEXT,
    spec_unit VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(equipment_id, spec_key)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_equipment_images_equipment ON equipment_images(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_images_primary ON equipment_images(equipment_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_equipment_specs_equipment ON equipment_specs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_specs_order ON equipment_specs(equipment_id, display_order);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipment_specs_updated_at ON equipment_specs;
CREATE TRIGGER update_equipment_specs_updated_at BEFORE UPDATE ON equipment_specs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
