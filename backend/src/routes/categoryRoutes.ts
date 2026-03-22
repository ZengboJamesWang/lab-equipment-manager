import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryValidation,
} from '../controllers/categoryController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllCategories);
router.get('/:id', authenticate, getCategoryById);
router.post('/', authenticate, requireAdmin, categoryValidation, createCategory);
router.put('/:id', authenticate, requireAdmin, categoryValidation, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export default router;
