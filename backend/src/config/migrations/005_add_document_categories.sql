-- Migration 005: Add document categories table for flexible categorization

-- Create document_categories table
CREATE TABLE IF NOT EXISTS document_categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT 'gray',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on category_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON document_categories(category_name);

-- Insert default categories (migrate existing data)
INSERT INTO document_categories (category_name, description, color) VALUES
  ('COSHH', 'Control of Substances Hazardous to Health documents', 'red'),
  ('SOP', 'Standard Operating Procedures', 'blue'),
  ('Group Purchase', 'Group purchase and procurement documents', 'green'),
  ('Other', 'Miscellaneous documents', 'gray')
ON CONFLICT (category_name) DO NOTHING;

-- Alter documents table to use category_id instead of document_type
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES document_categories(id);

-- Migrate existing data from document_type to category_id
UPDATE documents d
SET category_id = (
  SELECT id FROM document_categories dc
  WHERE dc.category_name = d.document_type
)
WHERE d.category_id IS NULL;

-- For any remaining documents with unmapped types, set to 'Other'
UPDATE documents d
SET category_id = (
  SELECT id FROM document_categories WHERE category_name = 'Other'
)
WHERE d.category_id IS NULL;

-- Now make category_id NOT NULL
ALTER TABLE documents ALTER COLUMN category_id SET NOT NULL;

-- Create index on category_id
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category_id);

COMMENT ON TABLE document_categories IS 'Stores user-defined categories for document organization';
COMMENT ON COLUMN documents.category_id IS 'Reference to document category (replaces document_type)';
