import { Request, Response } from 'express';
import { query } from '../db.js';

export const getPublicMuseumInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const museumRes = await query('SELECT * FROM museums WHERE museum_code = $1', ['CHN-MUS-001']);
    const museum = museumRes.rows[0];

    if (!museum) {
      res.status(404).json({ error: 'Museum information not found' });
      return;
    }

    // Featured artifacts for public view
    const featuredArtifacts = await query(
      `SELECT id, name, category, period, origin, material, description, condition, location, image_url
       FROM artifacts
       WHERE museum_id = $1
       ORDER BY id ASC
       LIMIT 6`,
      [museum.id]
    );

    // Active & Planned Exhibitions for public view
    const publicExhibitions = await query(
      `SELECT id, name, description, start_date, end_date, location, status
       FROM exhibitions
       WHERE museum_id = $1 AND status IN ('Active', 'Planned')
       ORDER BY start_date ASC`,
      [museum.id]
    );

    // General summary metrics
    const statsRes = await query(
      `SELECT
         (SELECT COUNT(*) FROM artifacts WHERE museum_id = $1) as total_artifacts,
         (SELECT COUNT(*) FROM exhibitions WHERE museum_id = $1) as total_exhibitions,
         (SELECT COALESCE(SUM(visitor_count), 0) FROM visitor_records WHERE museum_id = $1) as total_visitors`,
      [museum.id]
    );

    const rawStats = statsRes.rows[0] || {};

    res.status(200).json({
      museum,
      featuredArtifacts: featuredArtifacts.rows,
      publicExhibitions: publicExhibitions.rows,
      stats: {
        total_artifacts: parseInt(rawStats.total_artifacts || '8', 10),
        total_exhibitions: parseInt(rawStats.total_exhibitions || '4', 10),
        total_visitors: parseInt(rawStats.total_visitors || '12450', 10),
      },
    });
  } catch (err: any) {
    console.error('getPublicMuseumInfo error:', err);
    res.status(500).json({ error: 'Failed to load public museum showcase' });
  }
};
