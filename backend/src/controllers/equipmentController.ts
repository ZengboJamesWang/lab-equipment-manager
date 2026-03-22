import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const equipmentValidation = [
  body('name').notEmpty().withMessage('Equipment name is required'),
  body('status')
    .optional()
    .isIn(['active', 'under_maintenance', 'decommissioned', 'reserved'])
    .withMessage('Invalid status'),
];

export const getAllEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const { category, status, search } = req.query;

    let query = `
      SELECT e.*, c.name as category_name, c.color as category_color,
             u.full_name as created_by_name
      FROM equipment e
      LEFT JOIN equipment_categories c ON e.category_id = c.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND e.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status) {
      query += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (e.name ILIKE $${paramIndex} OR e.model_number ILIKE $${paramIndex} OR e.serial_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY e.created_at DESC';

    const result = await pool.query(query, params);

    res.json({ equipment: result.rows });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

export const getEquipmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.*, c.name as category_name, c.color as category_color,
              u.full_name as created_by_name
       FROM equipment e
       LEFT JOIN equipment_categories c ON e.category_id = c.id
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({ equipment: result.rows[0] });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

export const createEquipment = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      category_id,
      location,
      model_number,
      serial_number,
      purchase_year,
      purchase_cost,
      status,
      operating_notes,
      image_url,
      is_bookable,
      requires_approval,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO equipment (
        name, category_id, location, model_number, serial_number,
        purchase_year, purchase_cost, status, operating_notes,
        image_url, is_bookable, requires_approval, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        name,
        category_id || null,
        location || null,
        model_number || null,
        serial_number || null,
        purchase_year || null,
        purchase_cost || null,
        status || 'active',
        operating_notes || null,
        image_url || null,
        is_bookable !== undefined ? is_bookable : true,
        requires_approval !== undefined ? requires_approval : false,
        req.user?.id || null,
      ]
    );

    res.status(201).json({
      message: 'Equipment created successfully',
      equipment: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Serial number already exists' });
    }
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
};

export const updateEquipment = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const {
      name,
      category_id,
      location,
      model_number,
      serial_number,
      purchase_year,
      purchase_cost,
      status,
      operating_notes,
      image_url,
      is_bookable,
      requires_approval,
    } = req.body;

    const result = await pool.query(
      `UPDATE equipment
       SET name = $1, category_id = $2, location = $3, model_number = $4,
           serial_number = $5, purchase_year = $6, purchase_cost = $7,
           status = $8, operating_notes = $9, image_url = $10, is_bookable = $11,
           requires_approval = $12
       WHERE id = $13
       RETURNING *`,
      [
        name,
        category_id || null,
        location || null,
        model_number || null,
        serial_number || null,
        purchase_year || null,
        purchase_cost || null,
        status || 'active',
        operating_notes || null,
        image_url || null,
        is_bookable !== undefined ? is_bookable : true,
        requires_approval !== undefined ? requires_approval : false,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({
      message: 'Equipment updated successfully',
      equipment: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Serial number already exists' });
    }
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
};

export const deleteEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM equipment WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
};

export const getEquipmentMaintenanceHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT m.*, u.full_name as performed_by_name
       FROM maintenance_history m
       LEFT JOIN users u ON m.performed_by = u.id
       WHERE m.equipment_id = $1
       ORDER BY m.performed_date DESC`,
      [id]
    );

    res.json({ maintenance_history: result.rows });
  } catch (error) {
    console.error('Get maintenance history error:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance history' });
  }
};

export const getEquipmentRemarks = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.*, u1.full_name as reported_by_name, u2.full_name as resolved_by_name
       FROM equipment_remarks r
       LEFT JOIN users u1 ON r.reported_by = u1.id
       LEFT JOIN users u2 ON r.resolved_by = u2.id
       WHERE r.equipment_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({ remarks: result.rows });
  } catch (error) {
    console.error('Get equipment remarks error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment remarks' });
  }
};

// Equipment Image Upload
export const uploadEquipmentImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_primary } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate the URL for the uploaded file
    const image_url = `/uploads/${file.filename}`;
    const image_name = file.originalname;

    // If setting as primary, unset other primary images
    if (is_primary === 'true' || is_primary === true) {
      await pool.query(
        'UPDATE equipment_images SET is_primary = false WHERE equipment_id = $1',
        [id]
      );
    }

    const result = await pool.query(
      `INSERT INTO equipment_images (equipment_id, image_url, image_name, is_primary, uploaded_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, image_url, image_name, is_primary === 'true' || is_primary === true, req.user?.id]
    );

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: result.rows[0],
    });
  } catch (error) {
    console.error('Upload equipment image error:', error);
    res.status(500).json({ error: 'Failed to upload equipment image' });
  }
};

// Equipment Images
export const getEquipmentImages = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ei.*, u.full_name as uploaded_by_name
       FROM equipment_images ei
       LEFT JOIN users u ON ei.uploaded_by = u.id
       WHERE ei.equipment_id = $1
       ORDER BY ei.is_primary DESC, ei.created_at DESC`,
      [id]
    );

    res.json({ images: result.rows });
  } catch (error) {
    console.error('Get equipment images error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment images' });
  }
};

export const addEquipmentImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { image_url, image_name, is_primary } = req.body;

    // If setting as primary, unset other primary images
    if (is_primary) {
      await pool.query(
        'UPDATE equipment_images SET is_primary = false WHERE equipment_id = $1',
        [id]
      );
    }

    const result = await pool.query(
      `INSERT INTO equipment_images (equipment_id, image_url, image_name, is_primary, uploaded_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, image_url, image_name || null, is_primary || false, req.user?.id]
    );

    res.status(201).json({
      message: 'Image added successfully',
      image: result.rows[0],
    });
  } catch (error) {
    console.error('Add equipment image error:', error);
    res.status(500).json({ error: 'Failed to add equipment image' });
  }
};

export const deleteEquipmentImage = async (req: AuthRequest, res: Response) => {
  try {
    const { imageId } = req.params;

    const result = await pool.query(
      'DELETE FROM equipment_images WHERE id = $1 RETURNING *',
      [imageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete equipment image error:', error);
    res.status(500).json({ error: 'Failed to delete equipment image' });
  }
};

export const setPrimaryImage = async (req: AuthRequest, res: Response) => {
  try {
    const { imageId } = req.params;

    // Get the equipment_id for this image
    const imageResult = await pool.query(
      'SELECT equipment_id FROM equipment_images WHERE id = $1',
      [imageId]
    );

    if (imageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const equipmentId = imageResult.rows[0].equipment_id;

    // Unset all primary images for this equipment
    await pool.query(
      'UPDATE equipment_images SET is_primary = false WHERE equipment_id = $1',
      [equipmentId]
    );

    // Set this image as primary
    const result = await pool.query(
      'UPDATE equipment_images SET is_primary = true WHERE id = $1 RETURNING *',
      [imageId]
    );

    res.json({
      message: 'Primary image updated successfully',
      image: result.rows[0],
    });
  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({ error: 'Failed to set primary image' });
  }
};

// Equipment Specs
export const getEquipmentSpecs = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM equipment_specs
       WHERE equipment_id = $1
       ORDER BY display_order, spec_key`,
      [id]
    );

    res.json({ specs: result.rows });
  } catch (error) {
    console.error('Get equipment specs error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment specs' });
  }
};

export const addOrUpdateEquipmentSpec = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { spec_key, spec_value, spec_unit, display_order } = req.body;

    const result = await pool.query(
      `INSERT INTO equipment_specs (equipment_id, spec_key, spec_value, spec_unit, display_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (equipment_id, spec_key)
       DO UPDATE SET spec_value = $3, spec_unit = $4, display_order = $5
       RETURNING *`,
      [id, spec_key, spec_value || null, spec_unit || null, display_order || 0]
    );

    res.status(201).json({
      message: 'Spec saved successfully',
      spec: result.rows[0],
    });
  } catch (error) {
    console.error('Add/update equipment spec error:', error);
    res.status(500).json({ error: 'Failed to save equipment spec' });
  }
};

export const deleteEquipmentSpec = async (req: AuthRequest, res: Response) => {
  try {
    const { specId } = req.params;

    const result = await pool.query(
      'DELETE FROM equipment_specs WHERE id = $1 RETURNING *',
      [specId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Spec not found' });
    }

    res.json({ message: 'Spec deleted successfully' });
  } catch (error) {
    console.error('Delete equipment spec error:', error);
    res.status(500).json({ error: 'Failed to delete equipment spec' });
  }
};
