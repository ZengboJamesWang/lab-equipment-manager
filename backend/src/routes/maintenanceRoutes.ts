import { Router } from 'express';
import {
  createMaintenanceRecord,
  getMaintenanceRecords,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  maintenanceValidation,
} from '../controllers/maintenanceController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getMaintenanceRecords);
router.post('/', authenticate, requireAdmin, maintenanceValidation, createMaintenanceRecord);
router.put('/:id', authenticate, requireAdmin, maintenanceValidation, updateMaintenanceRecord);
router.delete('/:id', authenticate, requireAdmin, deleteMaintenanceRecord);

export default router;
