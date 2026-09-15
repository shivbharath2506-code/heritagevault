import { Router } from 'express';
import {
  getExhibitions,
  getExhibitionById,
  createExhibition,
  updateExhibition,
  deleteExhibition,
} from '../controllers/exhibitionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Authenticated staff roles can view and manage exhibitions
router.get('/', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), getExhibitions);
router.get('/:id', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), getExhibitionById);
router.post('/', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), createExhibition);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), updateExhibition);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), deleteExhibition);

export default router;
