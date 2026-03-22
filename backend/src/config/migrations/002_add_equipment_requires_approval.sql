-- Migration: Add requires_approval field to equipment table
-- Created: 2025-11-27

-- Add requires_approval column to equipment table
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;

-- Add comment to explain the field
COMMENT ON COLUMN equipment.requires_approval IS 'If true, bookings for this equipment require admin approval before being confirmed';

-- Update existing equipment to not require approval by default
UPDATE equipment SET requires_approval = false WHERE requires_approval IS NULL;
