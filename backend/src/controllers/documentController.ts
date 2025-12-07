import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getAllDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { category_id, equipment_id } = req.query;

    let query = `
      SELECT d.*, u.full_name as uploader_name, e.name as equipment_name,
             dc.category_name, dc.color as category_color
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN equipment e ON d.equipment_id = e.id
      LEFT JOIN document_categories dc ON d.category_id = dc.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category_id) {
      params.push(category_id);
      query += ` AND d.category_id = $${params.length}`;
    }

    if (equipment_id) {
      params.push(equipment_id);
      query += ` AND d.equipment_id = $${params.length}`;
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      documents: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

export const getDocumentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT d.*, u.full_name as uploader_name, e.name as equipment_name,
              dc.category_name, dc.color as category_color
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       LEFT JOIN equipment e ON d.equipment_id = e.id
       LEFT JOIN document_categories dc ON d.category_id = dc.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document: result.rows[0] });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

export const createDocumentValidation = [
  body('document_name').notEmpty().withMessage('Document name is required'),
  body('category_id')
    .isInt()
    .withMessage('Category ID must be a valid integer'),
];

export const createDocument = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can upload documents' });
    }

    const {
      document_name,
      category_id,
      file_url,
      file_size,
      mime_type,
      description,
      equipment_id,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO documents
       (document_name, category_id, file_url, file_size, mime_type, description, uploaded_by, equipment_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        document_name,
        category_id,
        file_url,
        file_size || null,
        mime_type || null,
        description || null,
        req.user.id,
        equipment_id || null,
      ]
    );

    res.status(201).json({
      message: 'Document created successfully',
      document: result.rows[0],
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
};

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can upload documents' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      document_name,
      category_id,
      description,
      equipment_id,
    } = req.body;

    // File is already uploaded by multer middleware
    const file_url = `/uploads/documents/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO documents
       (document_name, category_id, file_url, file_size, mime_type, description, uploaded_by, equipment_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        document_name || req.file.originalname,
        category_id,
        file_url,
        req.file.size,
        req.file.mimetype,
        description || null,
        req.user.id,
        equipment_id || null,
      ]
    );

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0],
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can update documents' });
    }

    const { id } = req.params;
    const {
      document_name,
      category_id,
      description,
      equipment_id,
    } = req.body;

    const result = await pool.query(
      `UPDATE documents
       SET document_name = COALESCE($1, document_name),
           category_id = COALESCE($2, category_id),
           description = COALESCE($3, description),
           equipment_id = COALESCE($4, equipment_id),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [document_name, category_id, description, equipment_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      message: 'Document updated successfully',
      document: result.rows[0],
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can delete documents' });
    }

    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};
