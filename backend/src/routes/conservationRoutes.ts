import { Router } from 'express';
import {
  getConservationRecords,
  getConservationById,
  createConservationRecord,
  updateConservationRecord,
  deleteConservationRecord,
} from '../controllers/conservationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Authenticated staff roles can view and manage conservation records
router.get('/', authenticateToken, authorizeRoles('admin', 'conservator', 'curator', 'staff'), getConservationRecords);
router.get('/:id', authenticateToken, authorizeRoles('admin', 'conservator', 'curator', 'staff'), getConservationById);
router.post('/', authenticateToken, authorizeRoles('admin', 'conservator', 'curator', 'staff'), createConservationRecord);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'conservator', 'curator', 'staff'), updateConservationRecord);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'conservator', 'curator', 'staff'), deleteConservationRecord);

export default router;
