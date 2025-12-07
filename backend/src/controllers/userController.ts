import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { AuthRequest } from '../types';

// Get all users (admin only)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, approval_status, department, phone,
              is_active, approved_by, approved_at, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

// Get pending users (admin only)
export const getPendingUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, approval_status, department, phone, created_at
       FROM users
       WHERE approval_status = 'pending'
       ORDER BY created_at DESC`
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ error: 'Failed to retrieve pending users' });
  }
};

// Approve user (admin only)
export const approveUserValidation = [
  body('userId').isUUID().withMessage('Valid user ID is required'),
];

export const approveUser = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId } = req.body;
    const adminId = req.user?.id;

    // Check if user exists and is pending
    const userCheck = await pool.query(
      'SELECT id, email, full_name, approval_status FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];

    if (user.approval_status === 'approved') {
      return res.status(400).json({ error: 'User is already approved' });
    }

    // Approve the user
    const result = await pool.query(
      `UPDATE users
       SET approval_status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, full_name, role, approval_status, approved_by, approved_at`,
      [adminId, userId]
    );

    res.json({
      message: 'User approved successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

// Reject user (admin only)
export const rejectUserValidation = [
  body('userId').isUUID().withMessage('Valid user ID is required'),
];

export const rejectUser = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId } = req.body;

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, email, full_name, approval_status FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];

    if (user.approval_status === 'rejected') {
      return res.status(400).json({ error: 'User is already rejected' });
    }

    // Reject the user
    const result = await pool.query(
      `UPDATE users
       SET approval_status = 'rejected'
       WHERE id = $1
       RETURNING id, email, full_name, role, approval_status`,
      [userId]
    );

    res.json({
      message: 'User rejected successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
};

// Promote user to admin (admin only)
export const promoteToAdminValidation = [
  body('userId').isUUID().withMessage('Valid user ID is required'),
];

export const promoteToAdmin = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId } = req.body;

    // Check if user exists and is approved
    const userCheck = await pool.query(
      'SELECT id, email, full_name, role, approval_status FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];

    if (user.approval_status !== 'approved') {
      return res.status(400).json({ error: 'User must be approved before being promoted to admin' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'User is already an admin' });
    }

    // Promote to admin
    const result = await pool.query(
      `UPDATE users
       SET role = 'admin'
       WHERE id = $1
       RETURNING id, email, full_name, role, approval_status`,
      [userId]
    );

    res.json({
      message: 'User promoted to admin successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Promote to admin error:', error);
    res.status(500).json({ error: 'Failed to promote user to admin' });
  }
};

// Demote admin to user (admin only)
export const demoteToUserValidation = [
  body('userId').isUUID().withMessage('Valid user ID is required'),
];

export const demoteToUser = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId } = req.body;
    const currentAdminId = req.user?.id;

    // Prevent self-demotion
    if (userId === currentAdminId) {
      return res.status(400).json({ error: 'You cannot demote yourself' });
    }

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, email, full_name, role FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];

    if (user.role === 'user') {
      return res.status(400).json({ error: 'User is already a regular user' });
    }

    // Demote to user
    const result = await pool.query(
      `UPDATE users
       SET role = 'user'
       WHERE id = $1
       RETURNING id, email, full_name, role, approval_status`,
      [userId]
    );

    res.json({
      message: 'Admin demoted to user successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Demote to user error:', error);
    res.status(500).json({ error: 'Failed to demote admin to user' });
  }
};

// Deactivate user (admin only)
export const deactivateUserValidation = [
  body('userId').isUUID().withMessage('Valid user ID is required'),
];

export const deactivateUser = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId } = req.body;
    const currentAdminId = req.user?.id;

    // Prevent self-deactivation
    if (userId === currentAdminId) {
      return res.status(400).json({ error: 'You cannot deactivate yourself' });
    }

    const result = await pool.query(
      `UPDATE users
       SET is_active = false
       WHERE id = $1
       RETURNING id, email, full_name, is_active`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deactivated successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};

// Activate user (admin only)
export const activateUserValidation = [
  body('userId').isUUID().withMessage('Valid user ID is required'),
];

export const activateUser = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET is_active = true
       WHERE id = $1
       RETURNING id, email, full_name, is_active`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User activated successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
};

// Change password (any authenticated user)
export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

export const changePassword = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get current password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
