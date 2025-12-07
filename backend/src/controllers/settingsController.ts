import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getAllSettings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM site_settings ORDER BY setting_key'
    );

    res.json({ settings: result.rows });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const getSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;

    const result = await pool.query(
      'SELECT * FROM site_settings WHERE setting_key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ setting: result.rows[0] });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
};

export const updateSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { setting_value } = req.body;

    const result = await pool.query(
      `UPDATE site_settings
       SET setting_value = $1, updated_by = $2
       WHERE setting_key = $3
       RETURNING *`,
      [setting_value, req.user?.id, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({
      message: 'Setting updated successfully',
      setting: result.rows[0],
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};
