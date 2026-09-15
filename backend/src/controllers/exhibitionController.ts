import { Request, Response } from 'express';
import { query } from '../db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { cacheService } from '../services/cacheService.js';

export const getExhibitions = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;
    const { status, search } = req.query;

    let sql = `
      SELECT e.*,
             COUNT(DISTINCT ea.artifact_id) as artifact_count,
             COALESCE(SUM(vr.visitor_count), 0) as total_visitors
      FROM exhibitions e
      LEFT JOIN exhibition_artifacts ea ON e.id = ea.exhibition_id
      LEFT JOIN visitor_records vr ON e.id = vr.exhibition_id
      WHERE e.museum_id = $1
    `;
    const params: any[] = [museumId];

    if (status && typeof status === 'string' && status !== 'All') {
      params.push(status);
      sql += ` AND e.status = $${params.length}`;
    }

    if (search && typeof search === 'string') {
      params.push(`%${search.trim()}%`);
      sql += ` AND (e.name ILIKE $${params.length} OR e.description ILIKE $${params.length} OR e.location ILIKE $${params.length})`;
    }

    sql += ` GROUP BY e.id ORDER BY e.start_date DESC, e.id DESC`;

    const result = await query(sql, params);
    res.status(200).json({ exhibitions: result.rows });
  } catch (err: any) {
    console.error('getExhibitions error:', err);
    res.status(500).json({ error: 'Failed to retrieve exhibitions' });
  }
};

export const getExhibitionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;

    const result = await query(
      `SELECT e.*, m.name as museum_name
       FROM exhibitions e
       JOIN museums m ON e.museum_id = m.id
       WHERE e.id = $1 AND e.museum_id = $2`,
      [id, museumId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Exhibition not found' });
      return;
    }

    // Get linked artifacts
    const artResult = await query(
      `SELECT a.*, ea.display_position
       FROM artifacts a
       JOIN exhibition_artifacts ea ON a.id = ea.artifact_id
       WHERE ea.exhibition_id = $1`,
      [id]
    );

    // Get visitor records
    const visResult = await query(
      `SELECT * FROM visitor_records WHERE exhibition_id = $1 ORDER BY visit_date DESC`,
      [id]
    );

    res.status(200).json({
      exhibition: result.rows[0],
      artifacts: artResult.rows,
      visitorRecords: visResult.rows,
    });
  } catch (err: any) {
    console.error('getExhibitionById error:', err);
    res.status(500).json({ error: 'Failed to fetch exhibition details' });
  }
};

export const createExhibition = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const museumId = req.user?.museum_id || 1;
    const {
      name,
      description,
      start_date,
      end_date,
      location,
      status = 'Planned',
      artifact_ids = [],
    } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Exhibition name is required' });
      return;
    }

    if (!start_date) {
      res.status(400).json({ error: 'Start date is required' });
      return;
    }

    if (!location || location.trim() === '') {
      res.status(400).json({ error: 'Exhibition gallery location is required' });
      return;
    }

    const result = await query(
      `INSERT INTO exhibitions (name, description, start_date, end_date, location, status, museum_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name.trim(),
        description?.trim() || null,
        start_date,
        end_date || null,
        location.trim(),
        status,
        museumId,
      ]
    );

    const newExh = result.rows[0];

    // Link artifacts if provided
    if (Array.isArray(artifact_ids) && artifact_ids.length > 0) {
      for (const artId of artifact_ids) {
        await query(
          `INSERT INTO exhibition_artifacts (exhibition_id, artifact_id, display_position)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [newExh.id, artId, 'Main Gallery Display']
        );
      }
    }

    await cacheService.invalidatePrefix('analytics:');

    res.status(201).json({
      message: 'Exhibition created successfully',
      exhibition: newExh,
    });
  } catch (err: any) {
    console.error('createExhibition error:', err);
    res.status(500).json({ error: 'Failed to create exhibition' });
  }
};

export const updateExhibition = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const museumId = req.user?.museum_id || 1;
    const {
      name,
      description,
      start_date,
      end_date,
      location,
      status,
      artifact_ids,
    } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Exhibition name is required' });
      return;
    }

    if (!start_date) {
      res.status(400).json({ error: 'Start date is required' });
      return;
    }

    const check = await query('SELECT id FROM exhibitions WHERE id = $1 AND museum_id = $2', [id, museumId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Exhibition not found or access denied' });
      return;
    }

    const result = await query(
      `UPDATE exhibitions
       SET name = $1, description = $2, start_date = $3, end_date = $4,
           location = $5, status = $6
       WHERE id = $7 AND museum_id = $8
       RETURNING *`,
      [
        name.trim(),
        description,
        start_date,
        end_date || null,
        location,
        status,
        id,
        museumId,
      ]
    );

    if (Array.isArray(artifact_ids)) {
      await query('DELETE FROM exhibition_artifacts WHERE exhibition_id = $1', [id]);
      for (const artId of artifact_ids) {
        await query(
          `INSERT INTO exhibition_artifacts (exhibition_id, artifact_id, display_position)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [id, artId, 'Main Gallery Display']
        );
      }
    }

    await cacheService.invalidatePrefix('analytics:');

    res.status(200).json({
      message: 'Exhibition updated successfully',
      exhibition: result.rows[0],
    });
  } catch (err: any) {
    console.error('updateExhibition error:', err);
    res.status(500).json({ error: 'Failed to update exhibition' });
  }
};

export const deleteExhibition = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const museumId = req.user?.museum_id || 1;

    const check = await query('SELECT id FROM exhibitions WHERE id = $1 AND museum_id = $2', [id, museumId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Exhibition not found or access denied' });
      return;
    }

    await query('DELETE FROM exhibitions WHERE id = $1 AND museum_id = $2', [id, museumId]);

    await cacheService.invalidatePrefix('analytics:');

    res.status(200).json({ message: 'Exhibition deleted successfully' });
  } catch (err: any) {
    console.error('deleteExhibition error:', err);
    res.status(500).json({ error: 'Failed to delete exhibition' });
  }
};
