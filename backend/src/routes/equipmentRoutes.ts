import { Router } from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentMaintenanceHistory,
  getEquipmentRemarks,
  getEquipmentImages,
  addEquipmentImage,
  uploadEquipmentImage,
  deleteEquipmentImage,
  setPrimaryImage,
  getEquipmentSpecs,
  addOrUpdateEquipmentSpec,
  deleteEquipmentSpec,
  equipmentValidation,
} from '../controllers/equipmentController';
import { authenticate, requireAdmin } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/', authenticate, getAllEquipment);
router.get('/:id', authenticate, getEquipmentById);
router.get('/:id/maintenance', authenticate, getEquipmentMaintenanceHistory);
router.get('/:id/remarks', authenticate, getEquipmentRemarks);

// Images
router.get('/:id/images', authenticate, getEquipmentImages);
router.post('/:id/images', authenticate, requireAdmin, addEquipmentImage);
router.post('/:id/images/upload', authenticate, requireAdmin, upload.single('image'), uploadEquipmentImage);
router.delete('/:id/images/:imageId', authenticate, requireAdmin, deleteEquipmentImage);
router.put('/:id/images/:imageId/primary', authenticate, requireAdmin, setPrimaryImage);

// Specs
router.get('/:id/specs', authenticate, getEquipmentSpecs);
router.post('/:id/specs', authenticate, requireAdmin, addOrUpdateEquipmentSpec);
router.delete('/:id/specs/:specId', authenticate, requireAdmin, deleteEquipmentSpec);

router.post('/', authenticate, requireAdmin, equipmentValidation, createEquipment);
router.put('/:id', authenticate, requireAdmin, equipmentValidation, updateEquipment);
router.delete('/:id', authenticate, requireAdmin, deleteEquipment);

export default router;
