import { Router } from 'express';
import {
  createRemark,
  getRemarks,
  resolveRemark,
  deleteRemark,
  remarkValidation,
} from '../controllers/remarkController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getRemarks);
router.post('/', authenticate, remarkValidation, createRemark);
router.patch('/:id/resolve', authenticate, requireAdmin, resolveRemark);
router.delete('/:id', authenticate, requireAdmin, deleteRemark);

export default router;
