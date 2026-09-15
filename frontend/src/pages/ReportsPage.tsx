import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Landmark,
  ShieldCheck,
  Boxes,
  Users,
  Sparkles,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const toast = useToast();

  const [reportType, setReportType] = useState('artifacts');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportCategories = [
    { id: 'artifacts', label: 'Artifact Inventory & Condition Audit', icon: Boxes },
    { id: 'visitors', label: 'Visitor Footfall & Admissions Summary', icon: Users },
    { id: 'conservation', label: 'Conservation Treatments Log', icon: ShieldCheck },
    { id: 'restoration', label: 'Restoration Projects & Cost Audit', icon: Wrench },
    { id: 'exhibitions', label: 'Curatorial Exhibitions Portfolio', icon: Sparkles },
  ];

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReport(reportType, startDate || undefined, endDate || undefined);
      setReportData(res.report);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const url = api.getReportDownloadUrl(reportType, startDate || undefined, endDate || undefined);
    window.open(url, '_blank');
    toast.success('Downloading report CSV...');
  };

  return (
    <div className="module-page-container reports-page-container">
      {/* Header (Hidden during print) */}
      <div className="module-header no-print">
        <div>
          <h1 className="module-title">Institutional Audit & Reports Generator</h1>
          <p className="module-subtitle">
            Generate formal compliance, curatorial inventories, and statistical reports for Government Museum Chennai
          </p>
        </div>

        <div className="report-action-buttons">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Report
          </button>
          <button className="btn btn-gold" onClick={handleDownloadCsv}>
            <Download size={16} /> Export as CSV
          </button>
        </div>
      </div>

      {/* Report Selection Tabs (Hidden during print) */}
      <div className="report-tabs-bar no-print">
        {reportCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = reportType === cat.id;
          return (
            <button
              key={cat.id}
              className={`report-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setReportType(cat.id)}
            >
              <Icon size={17} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Filter Bar for reports (Hidden during print) */}
      {reportType === 'visitors' && (
        <div className="filter-card no-print">
          <div className="filter-group">
            <div className="date-filter-item">
              <label>Audit Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-filter-item">
              <label>Audit End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Printable Report Document */}
      {isLoading ? (
        <div className="page-loader-container">
          <div className="spinner" />
          <p>Compiling official report from museum database...</p>
        </div>
      ) : reportData ? (
        <div className="printable-report-document card">
          {/* Official Document Header */}
          <div className="report-doc-header">
            <div className="doc-emblem">
              <Landmark size={36} />
            </div>
            <div className="doc-institution-text">
              <h2>GOVERNMENT MUSEUM CHENNAI</h2>
              <p className="doc-sub">DEPARTMENT OF MUSEUMS • GOVERNMENT OF TAMIL NADU</p>
              <p className="doc-address">Pantheon Complex, Egmore, Chennai - 600008 • Museum Code: CHN-MUS-001</p>
            </div>
          </div>

          <div className="report-doc-meta-strip">
            <div className="doc-meta-item">
              <strong>DOCUMENT TITLE:</strong> <span>{reportData.title}</span>
            </div>
            <div className="doc-meta-item">
              <strong>GENERATED:</strong> <span>{new Date(reportData.generatedAt).toLocaleString()}</span>
            </div>
            <div className="doc-meta-item">
              <strong>OFFICER IN CHARGE:</strong> <span>{reportData.generatedBy} (Chief Administrator)</span>
            </div>
          </div>

          {/* Executive Summary Cards */}
          <div className="report-summary-box">
            <h4 className="summary-box-title">Executive Summary & Aggregated Metrics</h4>
            <div className="summary-metrics-grid">
              {Object.entries(reportData.summary).map(([key, val]: [string, any]) => {
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());
                const formattedVal =
                  typeof val === 'number' && (key.toLowerCase().includes('cost') || key.toLowerCase().includes('inr'))
                    ? `₹${Number(val).toLocaleString()}`
                    : typeof val === 'number'
                    ? Number(val).toLocaleString()
                    : String(val || '—');

                return (
                  <div key={key} className="summary-metric-cell">
                    <span className="metric-label">{formattedKey}</span>
                    <span className="metric-value">{formattedVal}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Tabular Records */}
          <div className="report-table-section">
            <h4 className="table-section-title">Itemized Database Records ({reportData.records.length})</h4>
            {reportData.records.length === 0 ? (
              <p className="no-data-text">No records found for this reporting cycle.</p>
            ) : (
              <table className="report-print-table">
                <thead>
                  <tr>
                    {Object.keys(reportData.records[0]).map((col) => (
                      <th key={col}>
                        {col.replace(/_/g, ' ').toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.records.map((row: any, idx: number) => (
                    <tr key={idx}>
                      {Object.keys(row).map((col) => (
                        <td key={col}>
                          {col.includes('date') && row[col]
                            ? new Date(row[col]).toLocaleDateString()
                            : col === 'cost'
                            ? `₹${Number(row[col]).toLocaleString()}`
                            : row[col] === null || row[col] === undefined
                            ? '—'
                            : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Document Sign-off */}
          <div className="report-doc-footer">
            <div className="sign-block">
              <div className="sign-line" />
              <span>Authorized Signature</span>
              <span className="sign-title">Chief Curator / Director of Museums</span>
            </div>

            <div className="sign-seal">
              <div className="seal-circle">
                <span>OFFICIAL SEAL</span>
                <span>CHN-MUS-001</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
