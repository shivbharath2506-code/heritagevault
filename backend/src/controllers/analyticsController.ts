import { Request, Response } from 'express';
import { query } from '../db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { cacheService } from '../services/cacheService.js';

export const getAnalyticsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;

    const cacheKey = `analytics:summary:m_${museumId}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      res.status(200).json({ summary: cached, cached: true });
      return;
    }

    // Counts
    const artCountRes = await query('SELECT COUNT(*) as count FROM artifacts WHERE museum_id = $1', [museumId]);
    const visCountRes = await query('SELECT COALESCE(SUM(visitor_count), 0) as total FROM visitor_records WHERE museum_id = $1', [museumId]);
    const exhCountRes = await query("SELECT COUNT(*) as active_count, COUNT(*) as total_count FROM exhibitions WHERE museum_id = $1", [museumId]);
    const activeExhRes = await query("SELECT COUNT(*) as count FROM exhibitions WHERE museum_id = $1 AND status = 'Active'", [museumId]);
    const consCountRes = await query(
      `SELECT COUNT(*) as count FROM conservation_records cr
       JOIN artifacts a ON cr.artifact_id = a.id WHERE a.museum_id = $1`,
      [museumId]
    );
    const restCountRes = await query(
      `SELECT COUNT(*) as count, COALESCE(SUM(cost), 0) as total_cost
       FROM restoration_records rr
       JOIN artifacts a ON rr.artifact_id = a.id WHERE a.museum_id = $1`,
      [museumId]
    );

    // Recent records
    const recentArtifacts = await query(
      `SELECT id, name, category, condition, location, acquisition_date, image_url, created_at
       FROM artifacts WHERE museum_id = $1 ORDER BY id DESC LIMIT 5`,
      [museumId]
    );

    const recentExhibitions = await query(
      `SELECT id, name, start_date, end_date, location, status
       FROM exhibitions WHERE museum_id = $1 ORDER BY start_date DESC LIMIT 4`,
      [museumId]
    );

    const recentConservation = await query(
      `SELECT cr.id, cr.conservation_date, cr.conservator, cr.condition_before, cr.condition_after, cr.treatment, a.name as artifact_name
       FROM conservation_records cr
       JOIN artifacts a ON cr.artifact_id = a.id
       WHERE a.museum_id = $1 ORDER BY cr.conservation_date DESC LIMIT 5`,
      [museumId]
    );

    const recentRestoration = await query(
      `SELECT rr.id, rr.restoration_date, rr.restored_by, rr.restoration_type, rr.cost, rr.status, a.name as artifact_name
       FROM restoration_records rr
       JOIN artifacts a ON rr.artifact_id = a.id
       WHERE a.museum_id = $1 ORDER BY rr.restoration_date DESC LIMIT 5`,
      [museumId]
    );

    // 14-day visitor trend
    const visitorTrend = await query(
      `SELECT visit_date, SUM(visitor_count) as daily_count
       FROM visitor_records
       WHERE museum_id = $1
       GROUP BY visit_date
       ORDER BY visit_date ASC
       LIMIT 30`,
      [museumId]
    );

    const summaryData = {
      totalArtifacts: parseInt(artCountRes.rows[0]?.count || '0', 10),
      totalVisitors: parseInt(visCountRes.rows[0]?.total || '0', 10),
      activeExhibitions: parseInt(activeExhRes.rows[0]?.count || '0', 10),
      totalExhibitions: parseInt(exhCountRes.rows[0]?.total_count || '0', 10),
      conservationRecords: parseInt(consCountRes.rows[0]?.count || '0', 10),
      restorationRecords: parseInt(restCountRes.rows[0]?.count || '0', 10),
      totalRestorationCost: parseFloat(restCountRes.rows[0]?.total_cost || '0'),
      recentArtifacts: recentArtifacts.rows,
      recentExhibitions: recentExhibitions.rows,
      recentConservation: recentConservation.rows,
      recentRestoration: recentRestoration.rows,
      visitorTrend: visitorTrend.rows,
    };

    await cacheService.set(cacheKey, summaryData, 180);

    res.status(200).json({ summary: summaryData, cached: false });
  } catch (err: any) {
    console.error('getAnalyticsSummary error:', err);
    res.status(500).json({ error: 'Failed to retrieve analytics summary' });
  }
};

export const getVisitorAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;

    // Daily visitor trend
    const dailyTrend = await query(
      `SELECT visit_date, SUM(visitor_count) as count
       FROM visitor_records
       WHERE museum_id = $1
       GROUP BY visit_date
       ORDER BY visit_date ASC`,
      [museumId]
    );

    // Visitors by exhibition
    const byExhibition = await query(
      `SELECT COALESCE(e.name, 'General Gallery Admission') as exhibition_name,
              SUM(vr.visitor_count) as total_visitors
       FROM visitor_records vr
       LEFT JOIN exhibitions e ON vr.exhibition_id = e.id
       WHERE vr.museum_id = $1
       GROUP BY e.name
       ORDER BY total_visitors DESC`,
      [museumId]
    );

    // Day of week distribution (sample aggregation)
    const dayOfWeekData = dailyTrend.rows.map((row) => {
      const date = new Date(row.visit_date);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return {
        day: days[date.getDay()],
        count: Number(row.count),
      };
    });

    const dayAggregates: Record<string, { total: number; count: number }> = {
      Sun: { total: 0, count: 0 },
      Mon: { total: 0, count: 0 },
      Tue: { total: 0, count: 0 },
      Wed: { total: 0, count: 0 },
      Thu: { total: 0, count: 0 },
      Fri: { total: 0, count: 0 },
      Sat: { total: 0, count: 0 },
    };

    dayOfWeekData.forEach((d) => {
      if (dayAggregates[d.day]) {
        dayAggregates[d.day].total += d.count;
        dayAggregates[d.day].count += 1;
      }
    });

    const weekdayAverages = Object.entries(dayAggregates).map(([day, stats]) => ({
      day,
      average: stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
      total: stats.total,
    }));

    res.status(200).json({
      dailyTrend: dailyTrend.rows,
      byExhibition: byExhibition.rows,
      weekdayAverages,
    });
  } catch (err: any) {
    console.error('getVisitorAnalytics error:', err);
    res.status(500).json({ error: 'Failed to retrieve visitor analytics' });
  }
};

export const getArtifactAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;

    // Categories
    const categoryRes = await query(
      `SELECT category, COUNT(*) as count
       FROM artifacts
       WHERE museum_id = $1
       GROUP BY category
       ORDER BY count DESC`,
      [museumId]
    );

    // Conditions
    const conditionRes = await query(
      `SELECT condition, COUNT(*) as count
       FROM artifacts
       WHERE museum_id = $1
       GROUP BY condition
       ORDER BY count DESC`,
      [museumId]
    );

    // Locations / Galleries
    const locationRes = await query(
      `SELECT location, COUNT(*) as count
       FROM artifacts
       WHERE museum_id = $1
       GROUP BY location
       ORDER BY count DESC`,
      [museumId]
    );

    res.status(200).json({
      byCategory: categoryRes.rows,
      byCondition: conditionRes.rows,
      byLocation: locationRes.rows,
    });
  } catch (err: any) {
    console.error('getArtifactAnalytics error:', err);
    res.status(500).json({ error: 'Failed to retrieve artifact analytics' });
  }
};

export const getConservationAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;

    const conditionBefore = await query(
      `SELECT cr.condition_before, COUNT(*) as count
       FROM conservation_records cr
       JOIN artifacts a ON cr.artifact_id = a.id
       WHERE a.museum_id = $1
       GROUP BY cr.condition_before`,
      [museumId]
    );

    const conditionAfter = await query(
      `SELECT cr.condition_after, COUNT(*) as count
       FROM conservation_records cr
       JOIN artifacts a ON cr.artifact_id = a.id
       WHERE a.museum_id = $1
       GROUP BY cr.condition_after`,
      [museumId]
    );

    const conservatorWorkload = await query(
      `SELECT cr.conservator, COUNT(*) as count
       FROM conservation_records cr
       JOIN artifacts a ON cr.artifact_id = a.id
       WHERE a.museum_id = $1
       GROUP BY cr.conservator
       ORDER BY count DESC`,
      [museumId]
    );

    res.status(200).json({
      conditionBefore: conditionBefore.rows,
      conditionAfter: conditionAfter.rows,
      conservatorWorkload: conservatorWorkload.rows,
    });
  } catch (err: any) {
    console.error('getConservationAnalytics error:', err);
    res.status(500).json({ error: 'Failed to retrieve conservation analytics' });
  }
};

export const getRestorationAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;

    const byStatus = await query(
      `SELECT rr.status, COUNT(*) as count, COALESCE(SUM(rr.cost), 0) as total_cost
       FROM restoration_records rr
       JOIN artifacts a ON rr.artifact_id = a.id
       WHERE a.museum_id = $1
       GROUP BY rr.status`,
      [museumId]
    );

    const byType = await query(
      `SELECT rr.restoration_type, COUNT(*) as count, COALESCE(SUM(rr.cost), 0) as total_cost
       FROM restoration_records rr
       JOIN artifacts a ON rr.artifact_id = a.id
       WHERE a.museum_id = $1
       GROUP BY rr.restoration_type
       ORDER BY total_cost DESC`,
      [museumId]
    );

    res.status(200).json({
      byStatus: byStatus.rows,
      byType: byType.rows,
    });
  } catch (err: any) {
    console.error('getRestorationAnalytics error:', err);
    res.status(500).json({ error: 'Failed to retrieve restoration analytics' });
  }
};
