import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { cacheService } from '../services/cacheService.js';
import { getPublicMuseumInfo } from '../controllers/museumController.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    system: 'HERITAGEVAULT Digital Museum Management System',
    museum: 'Government Museum Chennai (CHN-MUS-001)',
    timestamp: new Date().toISOString(),
    redis_cached: cacheService.isAvailable(),
  });
});

router.get('/db-test', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT 1 as connected, CURRENT_TIMESTAMP as server_time');
    res.status(200).json({
      database: 'connected',
      details: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      database: 'error',
      message: err.message,
    });
  }
});

// Public museum landing endpoint (no auth required)
router.get('/public/showcase', getPublicMuseumInfo);

export default router;
