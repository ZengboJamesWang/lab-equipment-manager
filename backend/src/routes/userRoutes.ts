import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getAllUsers,
  getPendingUsers,
  approveUser,
  approveUserValidation,
  rejectUser,
  rejectUserValidation,
  promoteToAdmin,
  promoteToAdminValidation,
  demoteToUser,
  demoteToUserValidation,
  deactivateUser,
  deactivateUserValidation,
  activateUser,
  activateUserValidation,
  changePassword,
  changePasswordValidation,
} from '../controllers/userController';

const router = express.Router();

// Change password - requires authentication only (any user)
router.post('/change-password', authenticate, changePasswordValidation, changePassword);

// All routes below require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// Get all users
router.get('/', getAllUsers);

// Get pending users
router.get('/pending', getPendingUsers);

// Approve user
router.post('/approve', approveUserValidation, approveUser);

// Reject user
router.post('/reject', rejectUserValidation, rejectUser);

// Promote user to admin
router.post('/promote', promoteToAdminValidation, promoteToAdmin);

// Demote admin to user
router.post('/demote', demoteToUserValidation, demoteToUser);

// Deactivate user
router.post('/deactivate', deactivateUserValidation, deactivateUser);

// Activate user
router.post('/activate', activateUserValidation, activateUser);

export default router;
