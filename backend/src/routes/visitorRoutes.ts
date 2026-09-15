import { Router } from 'express';
import {
  getVisitorRecords,
  getVisitorById,
  createVisitorRecord,
  updateVisitorRecord,
  deleteVisitorRecord,
} from '../controllers/visitorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Admin, Curator and Staff can access visitor management
router.get('/', authenticateToken, authorizeRoles('admin', 'curator', 'staff'), getVisitorRecords);
router.get('/:id', authenticateToken, authorizeRoles('admin', 'curator', 'staff'), getVisitorById);
router.post('/', authenticateToken, authorizeRoles('admin', 'curator', 'staff'), createVisitorRecord);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'curator', 'staff'), updateVisitorRecord);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'curator', 'staff'), deleteVisitorRecord);

export default router;
