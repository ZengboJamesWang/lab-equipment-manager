import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const bookingValidation = [
  body('equipment_id').notEmpty().withMessage('Equipment ID is required'),
  body('start_time').isISO8601().withMessage('Valid start time is required'),
  body('end_time').isISO8601().withMessage('Valid end time is required'),
];

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { equipment_id, user_id, status, start_date, end_date } = req.query;

    let query = `
      SELECT b.*, e.name as equipment_name, e.location as equipment_location,
             u.full_name as user_name, u.email as user_email,
             a.full_name as approved_by_name
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN users a ON b.approved_by = a.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (equipment_id) {
      query += ` AND b.equipment_id = $${paramIndex}`;
      params.push(equipment_id);
      paramIndex++;
    }

    if (user_id) {
      query += ` AND b.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND b.end_time >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND b.start_time <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    // Exclude cancelled bookings from display
    query += ` AND b.status != 'cancelled'`;

    query += ' ORDER BY b.start_time ASC';

    const result = await pool.query(query, params);

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT b.*, e.name as equipment_name, e.location as equipment_location,
              u.full_name as user_name, u.email as user_email,
              a.full_name as approved_by_name
       FROM bookings b
       JOIN equipment e ON b.equipment_id = e.id
       JOIN users u ON b.user_id = u.id
       LEFT JOIN users a ON b.approved_by = a.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking: result.rows[0] });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { equipment_id, start_time, end_time, purpose } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if equipment exists and is bookable
    const equipmentCheck = await pool.query(
      'SELECT is_bookable, status, requires_approval FROM equipment WHERE id = $1',
      [equipment_id]
    );

    if (equipmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    if (!equipmentCheck.rows[0].is_bookable) {
      return res.status(400).json({ error: 'Equipment is not bookable' });
    }

    if (equipmentCheck.rows[0].status !== 'active') {
      return res.status(400).json({ error: 'Equipment is not available' });
    }

    const requiresApproval = equipmentCheck.rows[0].requires_approval;

    // Check for overlapping bookings (both confirmed and pending)
    const overlapCheck = await pool.query(
      `SELECT id FROM bookings
       WHERE equipment_id = $1
         AND status IN ('confirmed', 'pending')
         AND (
           (start_time <= $2 AND end_time > $2) OR
           (start_time < $3 AND end_time >= $3) OR
           (start_time >= $2 AND end_time <= $3)
         )`,
      [equipment_id, start_time, end_time]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'Time slot conflicts with existing booking',
      });
    }

    // Determine initial status based on whether approval is required
    const initialStatus = requiresApproval ? 'pending' : 'confirmed';

    const result = await pool.query(
      `INSERT INTO bookings (equipment_id, user_id, start_time, end_time, purpose, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [equipment_id, user_id, start_time, end_time, purpose || null, initialStatus]
    );

    const message = requiresApproval
      ? 'Booking created successfully. Awaiting admin approval.'
      : 'Booking created and confirmed successfully';

    res.status(201).json({
      message,
      booking: result.rows[0],
      requires_approval: requiresApproval,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['confirmed', 'rejected', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateFields: string[] = ['status = $1'];
    const params: any[] = [status];
    let paramIndex = 2;

    if (status === 'confirmed' || status === 'rejected') {
      updateFields.push(`approved_by = $${paramIndex}`);
      params.push(req.user?.id);
      paramIndex++;

      updateFields.push(`approved_at = CURRENT_TIMESTAMP`);
    }

    if (status === 'cancelled') {
      updateFields.push(`cancelled_at = CURRENT_TIMESTAMP`);
    }

    if (admin_notes) {
      updateFields.push(`admin_notes = $${paramIndex}`);
      params.push(admin_notes);
      paramIndex++;
    }

    params.push(id);

    const result = await pool.query(
      `UPDATE bookings
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      message: 'Booking status updated successfully',
      booking: result.rows[0],
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const bookingCheck = await pool.query(
      'SELECT user_id, status FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingCheck.rows[0];

    // Users can cancel their own bookings, admins can cancel any
    if (
      booking.user_id !== req.user?.id &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    // Delete the booking record completely
    await pool.query('DELETE FROM bookings WHERE id = $1', [id]);

    res.json({
      message: 'Booking cancelled and removed successfully',
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

export const getEquipmentAvailability = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { equipment_id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'start_date and end_date are required',
      });
    }

    const result = await pool.query(
      `SELECT id, start_time, end_time, status, purpose
       FROM bookings
       WHERE equipment_id = $1
         AND status = 'confirmed'
         AND start_time < $3
         AND end_time > $2
       ORDER BY start_time ASC`,
      [equipment_id, start_date, end_date]
    );

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Get equipment availability error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment availability' });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { start_time, end_time, purpose } = req.body;

    // Check if booking exists and belongs to user
    const bookingCheck = await pool.query(
      'SELECT user_id, equipment_id, status, start_time FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingCheck.rows[0];

    // Only allow users to update their own bookings, unless admin
    if (booking.user_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }

    // Don't allow updating past or cancelled bookings
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Cannot update this booking' });
    }

    // Don't allow updating past bookings
    if (new Date(booking.start_time) < new Date()) {
      return res.status(400).json({ error: 'Cannot update past bookings' });
    }

    // Validate new times if provided
    if (start_time && end_time) {
      if (new Date(start_time) >= new Date(end_time)) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }

      // Check for overlapping bookings (excluding current booking)
      const overlapCheck = await pool.query(
        `SELECT id FROM bookings
         WHERE equipment_id = $1
           AND id != $2
           AND status = 'confirmed'
           AND (
             (start_time <= $3 AND end_time > $3) OR
             (start_time < $4 AND end_time >= $4) OR
             (start_time >= $3 AND end_time <= $4)
           )`,
        [booking.equipment_id, id, start_time, end_time]
      );

      if (overlapCheck.rows.length > 0) {
        return res.status(400).json({
          error: 'Time slot conflicts with existing booking',
        });
      }
    }

    // Update booking
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (start_time) {
      updateFields.push(`start_time = $${paramIndex}`);
      params.push(start_time);
      paramIndex++;
    }

    if (end_time) {
      updateFields.push(`end_time = $${paramIndex}`);
      params.push(end_time);
      paramIndex++;
    }

    if (purpose !== undefined) {
      updateFields.push(`purpose = $${paramIndex}`);
      params.push(purpose || null);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    const result = await pool.query(
      `UPDATE bookings
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      params
    );

    res.json({
      message: 'Booking updated successfully',
      booking: result.rows[0],
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if booking exists and belongs to user
    const bookingCheck = await pool.query(
      'SELECT user_id, status, start_time FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingCheck.rows[0];

    // Only allow users to delete their own bookings, unless admin
    if (booking.user_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this booking' });
    }

    // Don't allow deleting past bookings
    if (new Date(booking.start_time) < new Date()) {
      return res.status(400).json({ error: 'Cannot delete past bookings' });
    }

    await pool.query('DELETE FROM bookings WHERE id = $1', [id]);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};
