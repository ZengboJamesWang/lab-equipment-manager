import { Router } from 'express';
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  createDocumentValidation,
} from '../controllers/documentController';
import { authenticate } from '../middleware/auth';
import { uploadDocument as uploadMiddleware } from '../middleware/upload';

const router = Router();

// Get all documents (with optional filters)
router.get('/', authenticate, getAllDocuments);

// Get single document
router.get('/:id', authenticate, getDocumentById);

// Create document (with URL)
router.post('/', authenticate, createDocumentValidation, createDocument);

// Upload document file
router.post('/upload', authenticate, uploadMiddleware.single('file'), uploadDocument);

// Update document
router.put('/:id', authenticate, updateDocument);

// Delete document
router.delete('/:id', authenticate, deleteDocument);

export default router;
