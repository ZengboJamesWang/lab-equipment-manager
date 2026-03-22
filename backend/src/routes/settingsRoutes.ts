import { Router } from 'express';
import {
  getAllSettings,
  getSetting,
  updateSetting,
} from '../controllers/settingsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllSettings);
router.get('/:key', authenticate, getSetting);
router.put('/:key', authenticate, requireAdmin, updateSetting);

export default router;
