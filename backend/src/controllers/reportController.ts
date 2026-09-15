import { Request, Response } from 'express';
import { query } from '../db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const generateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const museumId = authReq.user?.museum_id || 1;
    const { reportType = 'artifacts', format = 'json', startDate, endDate } = req.query;

    // Get Museum info
    const museumRes = await query('SELECT * FROM museums WHERE id = $1', [museumId]);
    const museum = museumRes.rows[0] || {
      name: 'Government Museum Chennai',
      museum_code: 'CHN-MUS-001',
      location: 'Egmore, Chennai',
    };

    let reportData: any = {
      title: '',
      type: reportType,
      generatedAt: new Date().toISOString(),
      generatedBy: authReq.user?.name || 'Administrator',
      museum: {
        name: museum.name,
        code: museum.museum_code,
        location: museum.location,
      },
      summary: {},
      records: [],
    };

    if (reportType === 'artifacts') {
      reportData.title = 'Comprehensive Artifact Inventory & Condition Audit Report';
      const arts = await query(
        `SELECT id, name, category, period, origin, material, condition, location, acquisition_date
         FROM artifacts WHERE museum_id = $1 ORDER BY id ASC`,
        [museumId]
      );
      reportData.records = arts.rows;
      reportData.summary = {
        totalArtifacts: arts.rows.length,
        goodCondition: arts.rows.filter((a) => a.condition === 'Good' || a.condition === 'Pristine').length,
        fragileOrCritical: arts.rows.filter((a) => a.condition === 'Fragile' || a.condition === 'Critical').length,
        underRestoration: arts.rows.filter((a) => a.condition === 'Under Restoration').length,
      };
    } else if (reportType === 'visitors') {
      reportData.title = 'Official Visitor Footfall & Attendance Statistics Report';
      let sql = `
        SELECT vr.id, vr.visit_date, vr.visitor_count, COALESCE(e.name, 'General Admission') as exhibition_name
        FROM visitor_records vr
        LEFT JOIN exhibitions e ON vr.exhibition_id = e.id
        WHERE vr.museum_id = $1
      `;
      const params: any[] = [museumId];
      if (startDate) {
        params.push(startDate);
        sql += ` AND vr.visit_date >= $${params.length}`;
      }
      if (endDate) {
        params.push(endDate);
        sql += ` AND vr.visit_date <= $${params.length}`;
      }
      sql += ` ORDER BY vr.visit_date DESC`;

      const visitors = await query(sql, params);
      const totalVisitors = visitors.rows.reduce((sum, v) => sum + Number(v.visitor_count), 0);
      reportData.records = visitors.rows;
      reportData.summary = {
        totalLoggedDays: visitors.rows.length,
        totalFootfall: totalVisitors,
        averageDailyAttendance: visitors.rows.length > 0 ? Math.round(totalVisitors / visitors.rows.length) : 0,
      };
    } else if (reportType === 'conservation') {
      reportData.title = 'Museum Conservation & Preservation Operations Log';
      const cons = await query(
        `SELECT cr.id, cr.conservation_date, cr.conservator, cr.condition_before, cr.condition_after, cr.treatment, cr.notes, a.name as artifact_name
         FROM conservation_records cr
         JOIN artifacts a ON cr.artifact_id = a.id
         WHERE a.museum_id = $1
         ORDER BY cr.conservation_date DESC`,
        [museumId]
      );
      reportData.records = cons.rows;
      reportData.summary = {
        totalTreatmentsCompleted: cons.rows.length,
        stabilizedItems: cons.rows.filter((c) => c.condition_after === 'Good' || c.condition_after === 'Pristine').length,
      };
    } else if (reportType === 'restoration') {
      reportData.title = 'Specialized Restoration Projects & Expenditure Audit';
      const rest = await query(
        `SELECT rr.id, rr.restoration_date, rr.restored_by, rr.restoration_type, rr.description, rr.cost, rr.status, a.name as artifact_name
         FROM restoration_records rr
         JOIN artifacts a ON rr.artifact_id = a.id
         WHERE a.museum_id = $1
         ORDER BY rr.restoration_date DESC`,
        [museumId]
      );
      const totalCost = rest.rows.reduce((sum, r) => sum + Number(r.cost), 0);
      reportData.records = rest.rows;
      reportData.summary = {
        totalRestorationProjects: rest.rows.length,
        completedProjects: rest.rows.filter((r) => r.status === 'Completed').length,
        inProgressProjects: rest.rows.filter((r) => r.status === 'In Progress').length,
        totalExpenditureINR: totalCost,
      };
    } else if (reportType === 'exhibitions') {
      reportData.title = 'Curatorial Exhibitions & Public Program Portfolio';
      const exh = await query(
        `SELECT e.id, e.name, e.description, e.start_date, e.end_date, e.location, e.status,
                COUNT(DISTINCT ea.artifact_id) as linked_artifacts
         FROM exhibitions e
         LEFT JOIN exhibition_artifacts ea ON e.id = ea.exhibition_id
         WHERE e.museum_id = $1
         GROUP BY e.id
         ORDER BY e.start_date DESC`,
        [museumId]
      );
      reportData.records = exh.rows;
      reportData.summary = {
        totalExhibitions: exh.rows.length,
        activeExhibitions: exh.rows.filter((e) => e.status === 'Active').length,
        plannedExhibitions: exh.rows.filter((e) => e.status === 'Planned').length,
      };
    }

    if (format === 'csv') {
      if (reportData.records.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.csv"`);
        res.status(200).send('No records found');
        return;
      }

      const headers = Object.keys(reportData.records[0]);
      const csvRows = [headers.join(',')];

      for (const row of reportData.records) {
        const values = headers.map((header) => {
          const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv"`);
      res.status(200).send(csvRows.join('\n'));
      return;
    }

    res.status(200).json({ report: reportData });
  } catch (err: any) {
    console.error('generateReport error:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};
