import { Router } from 'express';
import {
  getAnalyticsSummary,
  getVisitorAnalytics,
  getArtifactAnalytics,
  getConservationAnalytics,
  getRestorationAnalytics,
} from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Dashboard Summary - Available to all authenticated roles for overview
router.get('/summary', authenticateToken, getAnalyticsSummary);

// Advanced Analytics - Accessible to authenticated staff
router.get('/visitors', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), getVisitorAnalytics);
router.get('/artifacts', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), getArtifactAnalytics);
router.get('/conservation', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), getConservationAnalytics);
router.get('/restoration', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), getRestorationAnalytics);

export default router;
