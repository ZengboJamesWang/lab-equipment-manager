-- Migration 006: Fix documents table schema - replace document_type with category_id

-- First, check if category_id column doesn't exist yet, then add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='documents' AND column_name='category_id'
    ) THEN
        ALTER TABLE documents ADD COLUMN category_id INTEGER REFERENCES document_categories(id);
    END IF;
END $$;

-- Update existing documents to use default category if they don't have one
UPDATE documents
SET category_id = (
    SELECT id FROM document_categories
    WHERE category_name = 'Other'
    LIMIT 1
)
WHERE category_id IS NULL;

-- Now make category_id NOT NULL after ensuring all rows have values
ALTER TABLE documents ALTER COLUMN category_id SET NOT NULL;

-- Drop the old document_type column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='documents' AND column_name='document_type'
    ) THEN
        ALTER TABLE documents DROP COLUMN document_type;
    END IF;
END $$;

-- Create index on category_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category_id);

-- Drop old index on document_type if it exists
DROP INDEX IF EXISTS idx_documents_type;

COMMENT ON COLUMN documents.category_id IS 'Reference to document category (COSHH, SOP, Group Purchase, etc.)';
