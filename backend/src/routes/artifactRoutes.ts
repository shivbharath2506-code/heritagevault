import { Router } from 'express';
import {
  getArtifacts,
  getArtifactById,
  createArtifact,
  updateArtifact,
  deleteArtifact,
} from '../controllers/artifactController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Public / Authenticated read
router.get('/', authenticateToken, getArtifacts);
router.get('/:id', authenticateToken, getArtifactById);

// Staff roles write permissions
router.post('/', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), createArtifact);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), updateArtifact);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'curator', 'conservator', 'staff'), deleteArtifact);

export default router;
