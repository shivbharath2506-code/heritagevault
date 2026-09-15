import { Router } from 'express';
import { generateReport } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Authenticated staff can generate and download reports
router.get('/', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), generateReport);

export default router;
