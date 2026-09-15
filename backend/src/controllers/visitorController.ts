import { Request, Response } from 'express';
import { query } from '../db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { cacheService } from '../services/cacheService.js';

export const getVisitorRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;
    const { start_date, end_date, exhibition_id } = req.query;

    let sql = `
      SELECT vr.*, e.name as exhibition_name
      FROM visitor_records vr
      LEFT JOIN exhibitions e ON vr.exhibition_id = e.id
      WHERE vr.museum_id = $1
    `;
    const params: any[] = [museumId];

    if (start_date && typeof start_date === 'string') {
      params.push(start_date);
      sql += ` AND vr.visit_date >= $${params.length}`;
    }

    if (end_date && typeof end_date === 'string') {
      params.push(end_date);
      sql += ` AND vr.visit_date <= $${params.length}`;
    }

    if (exhibition_id && typeof exhibition_id === 'string' && exhibition_id !== 'All') {
      params.push(exhibition_id);
      sql += ` AND vr.exhibition_id = $${params.length}`;
    }

    sql += ` ORDER BY vr.visit_date DESC, vr.id DESC`;

    const result = await query(sql, params);

    // Calculate aggregated metrics
    const totalCount = result.rows.reduce((sum, row) => sum + Number(row.visitor_count), 0);
    const avgDaily = result.rows.length > 0 ? Math.round(totalCount / result.rows.length) : 0;

    res.status(200).json({
      visitorRecords: result.rows,
      summary: {
        totalVisitors: totalCount,
        averageDaily: avgDaily,
        recordCount: result.rows.length,
      },
    });
  } catch (err: any) {
    console.error('getVisitorRecords error:', err);
    res.status(500).json({ error: 'Failed to retrieve visitor records' });
  }
};

export const getVisitorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;

    const result = await query(
      `SELECT vr.*, e.name as exhibition_name
       FROM visitor_records vr
       LEFT JOIN exhibitions e ON vr.exhibition_id = e.id
       WHERE vr.id = $1 AND vr.museum_id = $2`,
      [id, museumId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Visitor record not found' });
      return;
    }

    res.status(200).json({ visitorRecord: result.rows[0] });
  } catch (err: any) {
    console.error('getVisitorById error:', err);
    res.status(500).json({ error: 'Failed to fetch visitor record' });
  }
};

export const createVisitorRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const museumId = req.user?.museum_id || 1;
    const { visit_date, visitor_count, exhibition_id } = req.body;

    if (!visit_date) {
      res.status(400).json({ error: 'Visit date is required' });
      return;
    }

    const count = parseInt(visitor_count, 10);
    if (isNaN(count) || count < 0) {
      res.status(400).json({ error: 'Visitor count must be a non-negative integer' });
      return;
    }

    let validExhibitionId = exhibition_id ? parseInt(exhibition_id, 10) : null;
    if (validExhibitionId) {
      const exhCheck = await query('SELECT id FROM exhibitions WHERE id = $1 AND museum_id = $2', [validExhibitionId, museumId]);
      if (exhCheck.rows.length === 0) {
        validExhibitionId = null;
      }
    }

    const result = await query(
      `INSERT INTO visitor_records (visit_date, visitor_count, exhibition_id, museum_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [visit_date, count, validExhibitionId, museumId]
    );

    await cacheService.invalidatePrefix('analytics:');

    res.status(201).json({
      message: 'Visitor record created successfully',
      visitorRecord: result.rows[0],
    });
  } catch (err: any) {
    console.error('createVisitorRecord error:', err);
    res.status(500).json({ error: 'Failed to create visitor record' });
  }
};

export const updateVisitorRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const museumId = req.user?.museum_id || 1;
    const { visit_date, visitor_count, exhibition_id } = req.body;

    if (!visit_date) {
      res.status(400).json({ error: 'Visit date is required' });
      return;
    }

    const count = parseInt(visitor_count, 10);
    if (isNaN(count) || count < 0) {
      res.status(400).json({ error: 'Visitor count must be a non-negative integer' });
      return;
    }

    const check = await query('SELECT id FROM visitor_records WHERE id = $1 AND museum_id = $2', [id, museumId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Visitor record not found or access denied' });
      return;
    }

    let validExhibitionId = exhibition_id ? parseInt(exhibition_id, 10) : null;

    const result = await query(
      `UPDATE visitor_records
       SET visit_date = $1, visitor_count = $2, exhibition_id = $3
       WHERE id = $4 AND museum_id = $5
       RETURNING *`,
      [visit_date, count, validExhibitionId, id, museumId]
    );

    await cacheService.invalidatePrefix('analytics:');

    res.status(200).json({
      message: 'Visitor record updated successfully',
      visitorRecord: result.rows[0],
    });
  } catch (err: any) {
    console.error('updateVisitorRecord error:', err);
    res.status(500).json({ error: 'Failed to update visitor record' });
  }
};

export const deleteVisitorRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const museumId = req.user?.museum_id || 1;

    const check = await query('SELECT id FROM visitor_records WHERE id = $1 AND museum_id = $2', [id, museumId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Visitor record not found or access denied' });
      return;
    }

    await query('DELETE FROM visitor_records WHERE id = $1 AND museum_id = $2', [id, museumId]);

    await cacheService.invalidatePrefix('analytics:');

    res.status(200).json({ message: 'Visitor record deleted successfully' });
  } catch (err: any) {
    console.error('deleteVisitorRecord error:', err);
    res.status(500).json({ error: 'Failed to delete visitor record' });
  }
};
