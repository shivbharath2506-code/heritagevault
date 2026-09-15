import { Router } from 'express';
import {
  getRestorationRecords,
  getRestorationById,
  createRestorationRecord,
  updateRestorationRecord,
  deleteRestorationRecord,
} from '../controllers/restorationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Authenticated staff roles can access restoration
router.get('/', authenticateToken, authorizeRoles('admin', 'conservator', 'curator', 'staff'), getRestorationRecords);
router.get('/:id', authenticateToken, authorizeRoles('admin', 'conservator', 'curator', 'staff'), getRestorationById);
router.post('/', authenticateToken, authorizeRoles('admin', 'conservator', 'curator', 'staff'), createRestorationRecord);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'conservator', 'curator', 'staff'), updateRestorationRecord);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'conservator', 'curator', 'staff'), deleteRestorationRecord);

export default router;
