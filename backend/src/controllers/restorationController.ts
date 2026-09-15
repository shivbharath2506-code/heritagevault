import { Request, Response } from 'express';
import { query } from '../db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { cacheService } from '../services/cacheService.js';

export const getRestorationRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;
    const { status, artifact_id } = req.query;

    let sql = `
      SELECT rr.*, a.name as artifact_name, a.category, a.location as artifact_location, a.image_url
      FROM restoration_records rr
      JOIN artifacts a ON rr.artifact_id = a.id
      WHERE a.museum_id = $1
    `;
    const params: any[] = [museumId];

    if (status && typeof status === 'string' && status !== 'All') {
      params.push(status);
      sql += ` AND rr.status = $${params.length}`;
    }

    if (artifact_id && typeof artifact_id === 'string' && artifact_id !== 'All') {
      params.push(artifact_id);
      sql += ` AND rr.artifact_id = $${params.length}`;
    }

    sql += ` ORDER BY rr.restoration_date DESC, rr.id DESC`;

    const result = await query(sql, params);
    res.status(200).json({ restorationRecords: result.rows });
  } catch (err: any) {
    console.error('getRestorationRecords error:', err);
    res.status(500).json({ error: 'Failed to retrieve restoration records' });
  }
};

export const getRestorationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;

    const result = await query(
      `SELECT rr.*, a.name as artifact_name, a.category, a.location as artifact_location, a.image_url
       FROM restoration_records rr
       JOIN artifacts a ON rr.artifact_id = a.id
       WHERE rr.id = $1 AND a.museum_id = $2`,
      [id, museumId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Restoration record not found' });
      return;
    }

    res.status(200).json({ restorationRecord: result.rows[0] });
  } catch (err: any) {
    console.error('getRestorationById error:', err);
    res.status(500).json({ error: 'Failed to fetch restoration record' });
  }
};

export const createRestorationRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const museumId = req.user?.museum_id || 1;
    const {
      artifact_id,
      restoration_date,
      restored_by,
      restoration_type,
      description,
      cost = 0,
      status = 'Planned',
    } = req.body;

    if (!artifact_id) {
      res.status(400).json({ error: 'Artifact selection is required' });
      return;
    }

    if (!restoration_date) {
      res.status(400).json({ error: 'Restoration date is required' });
      return;
    }

    if (!restored_by || restored_by.trim() === '') {
      res.status(400).json({ error: 'Restored by specialist/laboratory is required' });
      return;
    }

    if (!restoration_type || restoration_type.trim() === '') {
      res.status(400).json({ error: 'Restoration type is required' });
      return;
    }

    const numericCost = Number(cost);
    if (isNaN(numericCost) || numericCost < 0) {
      res.status(400).json({ error: 'Restoration cost must be a non-negative number' });
      return;
    }

    // Verify artifact belongs to museum
    const artCheck = await query('SELECT id FROM artifacts WHERE id = $1 AND museum_id = $2', [artifact_id, museumId]);
    if (artCheck.rows.length === 0) {
      res.status(404).json({ error: 'Selected artifact does not exist or access denied' });
      return;
    }

    const result = await query(
      `INSERT INTO restoration_records (artifact_id, restoration_date, restored_by, restoration_type, description, cost, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        artifact_id,
        restoration_date,
        restored_by.trim(),
        restoration_type.trim(),
        description?.trim() || '',
        numericCost,
        status,
      ]
    );

    // If status is In Progress, optionally set artifact condition to 'Under Restoration'
    if (status === 'In Progress') {
      await query("UPDATE artifacts SET condition = 'Under Restoration', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [artifact_id]);
    }

    await cacheService.invalidatePrefix('artifacts:');
    await cacheService.invalidatePrefix('analytics:');

    res.status(201).json({
      message: 'Restoration record created successfully',
      restorationRecord: result.rows[0],
    });
  } catch (err: any) {
    console.error('createRestorationRecord error:', err);
    res.status(500).json({ error: 'Failed to create restoration record' });
  }
};

export const updateRestorationRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const museumId = req.user?.museum_id || 1;
    const {
      artifact_id,
      restoration_date,
      restored_by,
      restoration_type,
      description,
      cost,
      status,
    } = req.body;

    const check = await query(
      `SELECT rr.id FROM restoration_records rr
       JOIN artifacts a ON rr.artifact_id = a.id
       WHERE rr.id = $1 AND a.museum_id = $2`,
      [id, museumId]
    );

    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Restoration record not found or access denied' });
      return;
    }

    const numericCost = Number(cost);
    if (isNaN(numericCost) || numericCost < 0) {
      res.status(400).json({ error: 'Restoration cost must be a non-negative number' });
      return;
    }

    const result = await query(
      `UPDATE restoration_records
       SET artifact_id = $1, restoration_date = $2, restored_by = $3,
           restoration_type = $4, description = $5, cost = $6, status = $7
       WHERE id = $8
       RETURNING *`,
      [
        artifact_id,
        restoration_date,
        restored_by,
        restoration_type,
        description,
        numericCost,
        status,
        id,
      ]
    );

    if (status === 'Completed' && artifact_id) {
      await query("UPDATE artifacts SET condition = 'Good', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [artifact_id]);
    }

    await cacheService.invalidatePrefix('artifacts:');
    await cacheService.invalidatePrefix('analytics:');

    res.status(200).json({
      message: 'Restoration record updated successfully',
      restorationRecord: result.rows[0],
    });
  } catch (err: any) {
    console.error('updateRestorationRecord error:', err);
    res.status(500).json({ error: 'Failed to update restoration record' });
  }
};

export const deleteRestorationRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const museumId = req.user?.museum_id || 1;

    const check = await query(
      `SELECT rr.id FROM restoration_records rr
       JOIN artifacts a ON rr.artifact_id = a.id
       WHERE rr.id = $1 AND a.museum_id = $2`,
      [id, museumId]
    );

    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Restoration record not found or access denied' });
      return;
    }

    await query('DELETE FROM restoration_records WHERE id = $1', [id]);

    await cacheService.invalidatePrefix('analytics:');

    res.status(200).json({ message: 'Restoration record deleted successfully' });
  } catch (err: any) {
    console.error('deleteRestorationRecord error:', err);
    res.status(500).json({ error: 'Failed to delete restoration record' });
  }
};
