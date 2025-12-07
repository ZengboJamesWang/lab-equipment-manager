import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const remarkValidation = [
  body('equipment_id').notEmpty().withMessage('Equipment ID is required'),
  body('remark_type')
    .isIn(['damage', 'malfunction', 'decommission', 'general', 'issue'])
    .withMessage('Invalid remark type'),
  body('description').notEmpty().withMessage('Description is required'),
];

export const createRemark = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { equipment_id, remark_type, description, severity } = req.body;

    const result = await pool.query(
      `INSERT INTO equipment_remarks (
        equipment_id, remark_type, description, severity, reported_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        equipment_id,
        remark_type,
        description,
        severity || null,
        req.user?.id || null,
      ]
    );

    res.status(201).json({
      message: 'Remark created successfully',
      remark: result.rows[0],
    });
  } catch (error) {
    console.error('Create remark error:', error);
    res.status(500).json({ error: 'Failed to create remark' });
  }
};

export const getRemarks = async (req: AuthRequest, res: Response) => {
  try {
    const { equipment_id, remark_type, resolved } = req.query;

    let query = `
      SELECT r.*, e.name as equipment_name,
             u1.full_name as reported_by_name,
             u2.full_name as resolved_by_name
      FROM equipment_remarks r
      JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN users u1 ON r.reported_by = u1.id
      LEFT JOIN users u2 ON r.resolved_by = u2.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (equipment_id) {
      query += ` AND r.equipment_id = $${paramIndex}`;
      params.push(equipment_id);
      paramIndex++;
    }

    if (remark_type) {
      query += ` AND r.remark_type = $${paramIndex}`;
      params.push(remark_type);
      paramIndex++;
    }

    if (resolved !== undefined) {
      query += ` AND r.resolved = $${paramIndex}`;
      params.push(resolved === 'true');
      paramIndex++;
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, params);

    res.json({ remarks: result.rows });
  } catch (error) {
    console.error('Get remarks error:', error);
    res.status(500).json({ error: 'Failed to fetch remarks' });
  }
};

export const resolveRemark = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE equipment_remarks
       SET resolved = true, resolved_by = $1, resolved_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [req.user?.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Remark not found' });
    }

    res.json({
      message: 'Remark resolved successfully',
      remark: result.rows[0],
    });
  } catch (error) {
    console.error('Resolve remark error:', error);
    res.status(500).json({ error: 'Failed to resolve remark' });
  }
};

export const deleteRemark = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM equipment_remarks WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Remark not found' });
    }

    res.json({ message: 'Remark deleted successfully' });
  } catch (error) {
    console.error('Delete remark error:', error);
    res.status(500).json({ error: 'Failed to delete remark' });
  }
};
