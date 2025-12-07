import { Router } from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  cancelBooking,
  getEquipmentAvailability,
  bookingValidation,
} from '../controllers/bookingController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllBookings);
router.get('/:id', authenticate, getBookingById);
router.get('/equipment/:equipment_id/availability', authenticate, getEquipmentAvailability);
router.post('/', authenticate, bookingValidation, createBooking);
router.put('/:id', authenticate, updateBooking);
router.delete('/:id', authenticate, deleteBooking);
router.patch('/:id/status', authenticate, requireAdmin, updateBookingStatus);
router.patch('/:id/cancel', authenticate, cancelBooking);

export default router;
