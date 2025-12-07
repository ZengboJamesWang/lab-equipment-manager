import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getAllDocumentCategories = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM document_categories
      ORDER BY category_name
    `);

    res.json({
      categories: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get document categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createDocumentCategoryValidation = [
  body('category_name').notEmpty().withMessage('Category name is required'),
  body('color').optional().isString(),
];

export const createDocumentCategory = async (req: AuthRequest, res: Response) => {
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
      return res.status(403).json({ error: 'Only administrators can create categories' });
    }

    const { category_name, description, color } = req.body;

    const result = await pool.query(
      `INSERT INTO document_categories
       (category_name, description, color)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [category_name, description || null, color || 'gray']
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create document category error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateDocumentCategory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can update categories' });
    }

    const { id } = req.params;
    const { category_name, description, color } = req.body;

    const result = await pool.query(
      `UPDATE document_categories
       SET category_name = COALESCE($1, category_name),
           description = COALESCE($2, description),
           color = COALESCE($3, color)
       WHERE id = $4
       RETURNING *`,
      [category_name, description, color, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update document category error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteDocumentCategory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can delete categories' });
    }

    const { id } = req.params;
    const { force } = req.query; // Allow force deletion with documents

    // Check if category has documents
    const docsResult = await pool.query(
      'SELECT COUNT(*) FROM documents WHERE category_id = $1',
      [id]
    );

    const documentCount = parseInt(docsResult.rows[0].count);

    if (documentCount > 0 && force !== 'true') {
      return res.status(400).json({
        error: `Cannot delete category with ${documentCount} existing document(s). Use force delete to remove all documents.`,
        documentCount,
      });
    }

    // If force delete, remove all documents in this category first
    if (documentCount > 0 && force === 'true') {
      await pool.query(
        'DELETE FROM documents WHERE category_id = $1',
        [id]
      );
    }

    const result = await pool.query(
      'DELETE FROM document_categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      message: 'Category deleted successfully',
      documentsDeleted: documentCount,
    });
  } catch (error) {
    console.error('Delete document category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
