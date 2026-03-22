import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  changePassword,
  registerValidation,
  loginValidation,
  changePasswordValidation,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, changePasswordValidation, changePassword);

export default router;
