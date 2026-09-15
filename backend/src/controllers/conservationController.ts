import { Request, Response } from 'express';
import { query } from '../db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { cacheService } from '../services/cacheService.js';

export const getConservationRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;
    const { artifact_id, date, condition } = req.query;

    let sql = `
      SELECT cr.*, a.name as artifact_name, a.category, a.location as artifact_location, a.image_url
      FROM conservation_records cr
      JOIN artifacts a ON cr.artifact_id = a.id
      WHERE a.museum_id = $1
    `;
    const params: any[] = [museumId];

    if (artifact_id && typeof artifact_id === 'string' && artifact_id !== 'All') {
      params.push(artifact_id);
      sql += ` AND cr.artifact_id = $${params.length}`;
    }

    if (date && typeof date === 'string') {
      params.push(date);
      sql += ` AND cr.conservation_date = $${params.length}`;
    }

    if (condition && typeof condition === 'string' && condition !== 'All') {
      params.push(condition);
      sql += ` AND (cr.condition_before = $${params.length} OR cr.condition_after = $${params.length})`;
    }

    sql += ` ORDER BY cr.conservation_date DESC, cr.id DESC`;

    const result = await query(sql, params);
    res.status(200).json({ conservationRecords: result.rows });
  } catch (err: any) {
    console.error('getConservationRecords error:', err);
    res.status(500).json({ error: 'Failed to retrieve conservation records' });
  }
};

export const getConservationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;

    const result = await query(
      `SELECT cr.*, a.name as artifact_name, a.category, a.location as artifact_location, a.image_url
       FROM conservation_records cr
       JOIN artifacts a ON cr.artifact_id = a.id
       WHERE cr.id = $1 AND a.museum_id = $2`,
      [id, museumId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Conservation record not found' });
      return;
    }

    res.status(200).json({ conservationRecord: result.rows[0] });
  } catch (err: any) {
    console.error('getConservationById error:', err);
    res.status(500).json({ error: 'Failed to fetch conservation record' });
  }
};

export const createConservationRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const museumId = req.user?.museum_id || 1;
    const {
      artifact_id,
      conservation_date,
      conservator,
      condition_before,
      condition_after,
      treatment,
      notes,
    } = req.body;

    if (!artifact_id) {
      res.status(400).json({ error: 'Artifact selection is required' });
      return;
    }

    if (!conservation_date) {
      res.status(400).json({ error: 'Conservation date is required' });
      return;
    }

    if (!conservator || conservator.trim() === '') {
      res.status(400).json({ error: 'Conservator name is required' });
      return;
    }

    if (!treatment || treatment.trim() === '') {
      res.status(400).json({ error: 'Conservation treatment description is required' });
      return;
    }

    // Verify artifact belongs to this museum
    const artCheck = await query('SELECT id FROM artifacts WHERE id = $1 AND museum_id = $2', [artifact_id, museumId]);
    if (artCheck.rows.length === 0) {
      res.status(404).json({ error: 'Selected artifact does not exist or access denied' });
      return;
    }

    const result = await query(
      `INSERT INTO conservation_records (artifact_id, conservation_date, conservator, condition_before, condition_after, treatment, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        artifact_id,
        conservation_date,
        conservator.trim(),
        condition_before || 'Fair',
        condition_after || 'Good',
        treatment.trim(),
        notes?.trim() || null,
      ]
    );

    // Optionally update artifact condition to condition_after
    if (condition_after) {
      await query('UPDATE artifacts SET condition = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [condition_after, artifact_id]);
    }

    await cacheService.invalidatePrefix('artifacts:');
    await cacheService.invalidatePrefix('analytics:');

    res.status(201).json({
      message: 'Conservation record created successfully',
      conservationRecord: result.rows[0],
    });
  } catch (err: any) {
    console.error('createConservationRecord error:', err);
    res.status(500).json({ error: 'Failed to create conservation record' });
  }
};

export const updateConservationRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const museumId = req.user?.museum_id || 1;
    const {
      artifact_id,
      conservation_date,
      conservator,
      condition_before,
      condition_after,
      treatment,
      notes,
    } = req.body;

    const check = await query(
      `SELECT cr.id FROM conservation_records cr
       JOIN artifacts a ON cr.artifact_id = a.id
       WHERE cr.id = $1 AND a.museum_id = $2`,
      [id, museumId]
    );

    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Conservation record not found or access denied' });
      return;
    }

    const result = await query(
      `UPDATE conservation_records
       SET artifact_id = $1, conservation_date = $2, conservator = $3,
           condition_before = $4, condition_after = $5, treatment = $6, notes = $7
       WHERE id = $8
       RETURNING *`,
      [
        artifact_id,
        conservation_date,
        conservator,
        condition_before,
        condition_after,
        treatment,
        notes,
        id,
      ]
    );

    if (condition_after && artifact_id) {
      await query('UPDATE artifacts SET condition = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [condition_after, artifact_id]);
    }

    await cacheService.invalidatePrefix('artifacts:');
    await cacheService.invalidatePrefix('analytics:');

    res.status(200).json({
      message: 'Conservation record updated successfully',
      conservationRecord: result.rows[0],
    });
  } catch (err: any) {
    console.error('updateConservationRecord error:', err);
    res.status(500).json({ error: 'Failed to update conservation record' });
  }
};

export const deleteConservationRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const museumId = req.user?.museum_id || 1;

    const check = await query(
      `SELECT cr.id FROM conservation_records cr
       JOIN artifacts a ON cr.artifact_id = a.id
       WHERE cr.id = $1 AND a.museum_id = $2`,
      [id, museumId]
    );

    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Conservation record not found or access denied' });
      return;
    }

    await query('DELETE FROM conservation_records WHERE id = $1', [id]);

    await cacheService.invalidatePrefix('analytics:');

    res.status(200).json({ message: 'Conservation record deleted successfully' });
  } catch (err: any) {
    console.error('deleteConservationRecord error:', err);
    res.status(500).json({ error: 'Failed to delete conservation record' });
  }
};
