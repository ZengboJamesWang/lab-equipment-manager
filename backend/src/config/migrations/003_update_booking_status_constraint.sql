-- Migration 003: Update booking status constraint to include 'pending'
-- This allows bookings to be created with pending status for approval workflow

-- Drop the old constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add the new constraint with 'pending' status
ALTER TABLE bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rejected', 'completed'));
