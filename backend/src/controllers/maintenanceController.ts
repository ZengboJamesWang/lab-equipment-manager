import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const maintenanceValidation = [
  body('equipment_id').notEmpty().withMessage('Equipment ID is required'),
  body('maintenance_type')
    .isIn(['routine', 'repair', 'calibration', 'inspection', 'other'])
    .withMessage('Invalid maintenance type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('performed_date').isISO8601().withMessage('Valid date is required'),
];

export const createMaintenanceRecord = async (
  req: AuthRequest,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      equipment_id,
      maintenance_type,
      description,
      performed_date,
      cost,
      next_maintenance_date,
      notes,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO maintenance_history (
        equipment_id, maintenance_type, description, performed_by,
        performed_date, cost, next_maintenance_date, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        equipment_id,
        maintenance_type,
        description,
        req.user?.id || null,
        performed_date,
        cost || null,
        next_maintenance_date || null,
        notes || null,
      ]
    );

    res.status(201).json({
      message: 'Maintenance record created successfully',
      maintenance: result.rows[0],
    });
  } catch (error) {
    console.error('Create maintenance record error:', error);
    res.status(500).json({ error: 'Failed to create maintenance record' });
  }
};

export const getMaintenanceRecords = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { equipment_id, maintenance_type, start_date, end_date } = req.query;

    let query = `
      SELECT m.*, e.name as equipment_name, u.full_name as performed_by_name
      FROM maintenance_history m
      JOIN equipment e ON m.equipment_id = e.id
      LEFT JOIN users u ON m.performed_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (equipment_id) {
      query += ` AND m.equipment_id = $${paramIndex}`;
      params.push(equipment_id);
      paramIndex++;
    }

    if (maintenance_type) {
      query += ` AND m.maintenance_type = $${paramIndex}`;
      params.push(maintenance_type);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND m.performed_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND m.performed_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ' ORDER BY m.performed_date DESC';

    const result = await pool.query(query, params);

    res.json({ maintenance_records: result.rows });
  } catch (error) {
    console.error('Get maintenance records error:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
};

export const updateMaintenanceRecord = async (
  req: AuthRequest,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const {
      maintenance_type,
      description,
      performed_date,
      cost,
      next_maintenance_date,
      notes,
    } = req.body;

    const result = await pool.query(
      `UPDATE maintenance_history
       SET maintenance_type = $1, description = $2, performed_date = $3,
           cost = $4, next_maintenance_date = $5, notes = $6
       WHERE id = $7
       RETURNING *`,
      [
        maintenance_type,
        description,
        performed_date,
        cost || null,
        next_maintenance_date || null,
        notes || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.json({
      message: 'Maintenance record updated successfully',
      maintenance: result.rows[0],
    });
  } catch (error) {
    console.error('Update maintenance record error:', error);
    res.status(500).json({ error: 'Failed to update maintenance record' });
  }
};

export const deleteMaintenanceRecord = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM maintenance_history WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance record error:', error);
    res.status(500).json({ error: 'Failed to delete maintenance record' });
  }
};
