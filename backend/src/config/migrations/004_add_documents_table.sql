-- Migration 004: Add documents table for COSHH & SOP files

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('COSHH', 'SOP', 'OTHER')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  description TEXT,
  uploaded_by UUID REFERENCES users(id),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on document_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- Create index on equipment_id for faster equipment-specific queries
CREATE INDEX IF NOT EXISTS idx_documents_equipment ON documents(equipment_id);

-- Insert sample COSHH document (optional)
-- INSERT INTO documents (document_name, document_type, file_url, description, uploaded_by)
-- VALUES ('Sample COSHH Risk Assessment', 'COSHH', '/uploads/documents/sample-coshh.pdf', 'Example COSHH document', 1);

COMMENT ON TABLE documents IS 'Stores laboratory documents including COSHH and SOP files';
COMMENT ON COLUMN documents.document_type IS 'Type of document: COSHH (Control of Substances Hazardous to Health), SOP (Standard Operating Procedure), or OTHER';
COMMENT ON COLUMN documents.file_url IS 'URL or path to the document file (can be Supabase Storage URL or local path)';
COMMENT ON COLUMN documents.equipment_id IS 'Optional reference to equipment if document is equipment-specific';
