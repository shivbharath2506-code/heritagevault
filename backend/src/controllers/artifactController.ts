import { Request, Response } from 'express';
import { query } from '../db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { cacheService } from '../services/cacheService.js';

export const getArtifacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;
    const { search, category, condition } = req.query;

    const cacheKey = `artifacts:m_${museumId}:s_${search || ''}:c_${category || ''}:cond_${condition || ''}`;
    const cached = await cacheService.get<any[]>(cacheKey);
    if (cached) {
      res.status(200).json({ artifacts: cached, cached: true });
      return;
    }

    let sql = `SELECT * FROM artifacts WHERE museum_id = $1`;
    const params: any[] = [museumId];

    if (search && typeof search === 'string') {
      params.push(`%${search.trim()}%`);
      sql += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length} OR period ILIKE $${params.length} OR material ILIKE $${params.length} OR origin ILIKE $${params.length})`;
    }

    if (category && typeof category === 'string' && category !== 'All') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (condition && typeof condition === 'string' && condition !== 'All') {
      params.push(condition);
      sql += ` AND condition = $${params.length}`;
    }

    sql += ` ORDER BY id DESC`;

    const result = await query(sql, params);
    await cacheService.set(cacheKey, result.rows, 120);

    res.status(200).json({ artifacts: result.rows, cached: false });
  } catch (err: any) {
    console.error('getArtifacts error:', err);
    res.status(500).json({ error: 'Failed to retrieve artifacts' });
  }
};

export const getArtifactById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;

    const result = await query(
      `SELECT a.*, m.name as museum_name
       FROM artifacts a
       JOIN museums m ON a.museum_id = m.id
       WHERE a.id = $1 AND a.museum_id = $2`,
      [id, museumId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Artifact not found' });
      return;
    }

    // Get linked conservation records
    const consResult = await query(
      `SELECT * FROM conservation_records WHERE artifact_id = $1 ORDER BY conservation_date DESC`,
      [id]
    );

    // Get linked restoration records
    const restResult = await query(
      `SELECT * FROM restoration_records WHERE artifact_id = $1 ORDER BY restoration_date DESC`,
      [id]
    );

    // Get linked exhibitions
    const exhResult = await query(
      `SELECT e.*, ea.display_position
       FROM exhibitions e
       JOIN exhibition_artifacts ea ON e.id = ea.exhibition_id
       WHERE ea.artifact_id = $1`,
      [id]
    );

    res.status(200).json({
      artifact: result.rows[0],
      conservationRecords: consResult.rows,
      restorationRecords: restResult.rows,
      exhibitions: exhResult.rows,
    });
  } catch (err: any) {
    console.error('getArtifactById error:', err);
    res.status(500).json({ error: 'Failed to fetch artifact details' });
  }
};

export const createArtifact = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const museumId = req.user?.museum_id || 1;
    const {
      name,
      category,
      period,
      origin,
      material,
      description,
      condition = 'Good',
      location,
      acquisition_date,
      image_url,
    } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Artifact name is required' });
      return;
    }

    if (!category || category.trim() === '') {
      res.status(400).json({ error: 'Category is required' });
      return;
    }

    if (!location || location.trim() === '') {
      res.status(400).json({ error: 'Museum storage/gallery location is required' });
      return;
    }

    const result = await query(
      `INSERT INTO artifacts (name, category, period, origin, material, description, condition, location, acquisition_date, image_url, museum_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name.trim(),
        category.trim(),
        period?.trim() || null,
        origin?.trim() || null,
        material?.trim() || null,
        description?.trim() || null,
        condition,
        location.trim(),
        acquisition_date || null,
        image_url || null,
        museumId,
      ]
    );

    // Invalidate caches
    await cacheService.invalidatePrefix('artifacts:');
    await cacheService.invalidatePrefix('analytics:');

    res.status(201).json({
      message: 'Artifact created successfully',
      artifact: result.rows[0],
    });
  } catch (err: any) {
    console.error('createArtifact error:', err);
    res.status(500).json({ error: 'Failed to create artifact record' });
  }
};

export const updateArtifact = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const museumId = req.user?.museum_id || 1;
    const {
      name,
      category,
      period,
      origin,
      material,
      description,
      condition,
      location,
      acquisition_date,
      image_url,
    } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Artifact name is required' });
      return;
    }

    const check = await query('SELECT id FROM artifacts WHERE id = $1 AND museum_id = $2', [id, museumId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Artifact not found or access denied' });
      return;
    }

    const result = await query(
      `UPDATE artifacts
       SET name = $1, category = $2, period = $3, origin = $4, material = $5,
           description = $6, condition = $7, location = $8, acquisition_date = $9,
           image_url = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND museum_id = $12
       RETURNING *`,
      [
        name.trim(),
        category,
        period,
        origin,
        material,
        description,
        condition,
        location,
        acquisition_date,
        image_url,
        id,
        museumId,
      ]
    );

    await cacheService.invalidatePrefix('artifacts:');
    await cacheService.invalidatePrefix('analytics:');

    res.status(200).json({
      message: 'Artifact updated successfully',
      artifact: result.rows[0],
    });
  } catch (err: any) {
    console.error('updateArtifact error:', err);
    res.status(500).json({ error: 'Failed to update artifact record' });
  }
};

export const deleteArtifact = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const museumId = req.user?.museum_id || 1;

    const check = await query('SELECT id FROM artifacts WHERE id = $1 AND museum_id = $2', [id, museumId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Artifact not found or access denied' });
      return;
    }

    await query('DELETE FROM artifacts WHERE id = $1 AND museum_id = $2', [id, museumId]);

    await cacheService.invalidatePrefix('artifacts:');
    await cacheService.invalidatePrefix('analytics:');

    res.status(200).json({ message: 'Artifact deleted successfully' });
  } catch (err: any) {
    console.error('deleteArtifact error:', err);
    res.status(500).json({ error: 'Failed to delete artifact' });
  }
};
