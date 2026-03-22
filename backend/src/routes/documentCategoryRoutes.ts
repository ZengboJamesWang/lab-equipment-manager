import { Router } from 'express';
import {
  getAllDocumentCategories,
  createDocumentCategory,
  updateDocumentCategory,
  deleteDocumentCategory,
  createDocumentCategoryValidation,
} from '../controllers/documentCategoryController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get all document categories
router.get('/', authenticate, getAllDocumentCategories);

// Create document category (admin only)
router.post('/', authenticate, createDocumentCategoryValidation, createDocumentCategory);

// Update document category (admin only)
router.put('/:id', authenticate, updateDocumentCategory);

// Delete document category (admin only)
router.delete('/:id', authenticate, deleteDocumentCategory);

export default router;
