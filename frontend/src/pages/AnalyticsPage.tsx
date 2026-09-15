import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Boxes,
  ShieldCheck,
  Wrench,
  Users,
  PieChart as PieIcon,
  RefreshCw,
} from 'lucide-react';

const COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];

export const AnalyticsPage: React.FC = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const [visitorData, setVisitorData] = useState<any>(null);
  const [artifactData, setArtifactData] = useState<any>(null);
  const [conservationData, setConservationData] = useState<any>(null);
  const [restorationData, setRestorationData] = useState<any>(null);

  const loadAllAnalytics = async () => {
    setIsLoading(true);
    try {
      const [vis, art, cons, rest] = await Promise.all([
        api.getVisitorAnalytics(),
        api.getArtifactAnalytics(),
        api.getConservationAnalytics(),
        api.getRestorationAnalytics(),
      ]);
      setVisitorData(vis);
      setArtifactData(art);
      setConservationData(cons);
      setRestorationData(rest);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load museum analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="page-loader-container">
        <div className="spinner" />
        <p>Computing curatorial analytics from PostgreSQL database...</p>
      </div>
    );
  }

  // Format visitor line data
  const visitorTimeline =
    visitorData?.dailyTrend?.map((item: any) => ({
      date: item?.visit_date ? new Date(item.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Day',
      visitors: Number(item?.count || item?.total || 0),
    })) || [];

  const categoryDistribution =
    artifactData?.byCategory?.map((item: any) => ({
      category: item?.category || 'General',
      count: Number(item?.count || 0),
    })) || [];

  const conditionDistribution =
    artifactData?.byCondition?.map((item: any) => ({
      name: item?.condition || 'Unknown',
      value: Number(item?.count || 0),
    })) || [];

  const restorationStatusData =
    restorationData?.byStatus?.map((item: any) => ({
      name: item?.status || 'Active',
      value: Number(item?.count || 0),
      cost: Number(item?.total_cost || 0),
    })) || [];

  const restorationTypeData =
    restorationData?.byType?.map((item: any) => {
      const typeStr = item?.restoration_type || 'General Conservation';
      return {
        type: typeStr.length > 25 ? typeStr.slice(0, 25) + '...' : typeStr,
        cost: Number(item?.total_cost || 0),
        count: Number(item?.count || 0),
      };
    }) || [];

  return (
    <div className="module-page-container">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Advanced Museum Analytics & Intelligence</h1>
          <p className="module-subtitle">
            Curatorial performance, visitor demographics, conservation telemetry & expenditure metrics
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={loadAllAnalytics}>
          <RefreshCw size={14} /> Refresh Charts
        </button>
      </div>

      {/* Row 1: Comprehensive Visitor Analytics */}
      <div className="analytics-grid-2">
        <div className="chart-card card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Daily Attendance Trajectory</h3>
              <p className="chart-subtitle">Recorded admissions over logged period</p>
            </div>
            <span className="badge badge-amber">
              <TrendingUp size={13} /> Visitors
            </span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={visitorTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsVisGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#analyticsVisGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Day-of-Week Average Footfall</h3>
              <p className="chart-subtitle">Weekend vs weekday patterns</p>
            </div>
            <span className="badge badge-primary">
              <Users size={13} /> Headcount
            </span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={visitorData?.weekdayAverages || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Average Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Artifacts Analytics (Category & Condition) */}
      <div className="analytics-grid-2">
        <div className="chart-card card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Artifacts by Curatorial Category</h3>
              <p className="chart-subtitle">Distribution across museum wings</p>
            </div>
            <span className="badge badge-emerald">
              <Boxes size={13} /> Vault Inventory
            </span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryDistribution} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Artifacts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Artifact Preservation Health</h3>
              <p className="chart-subtitle">Condition categorization ratio</p>
            </div>
            <span className="badge badge-indigo">
              <PieIcon size={13} /> Audit Breakdown
            </span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={conditionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {conditionDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Conservation & Restoration Analytics */}
      <div className="analytics-grid-2">
        <div className="chart-card card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Restoration Project Allocation</h3>
              <p className="chart-subtitle">Expenditure by specialized restoration category</p>
            </div>
            <span className="badge badge-rose">
              <Wrench size={13} /> Restoration
            </span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={restorationTypeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="type" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Total Cost']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="cost" fill="#ec4899" radius={[4, 4, 0, 0]} name="Expenditure (INR)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Conservator Treatment Logs</h3>
              <p className="chart-subtitle">Scientific interventions per specialist</p>
            </div>
            <span className="badge badge-indigo">
              <ShieldCheck size={13} /> Treatments
            </span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={conservationData?.conservatorWorkload || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="conservator" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Treatments Logged" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
