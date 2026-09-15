import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsSummary, User } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  Boxes,
  Users,
  Sparkles,
  ShieldCheck,
  Wrench,
  TrendingUp,
  Landmark,
  Calendar,
  IndianRupee,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  user: User;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab, user }) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.getAnalyticsSummary();
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to fetch dashboard summary:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  if (isLoading) {
    return (
      <div className="page-loader-container">
        <div className="spinner" />
        <p>Loading Government Museum Chennai dashboard metrics...</p>
      </div>
    );
  }

  const chartData = summary?.visitorTrend?.map((item) => ({
    date: new Date(item.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    visitors: Number(item.daily_count),
  })) || [];

  return (
    <div className="dashboard-page-container">
      {/* Museum Header Banner */}
      <div className="dashboard-banner">
        <div className="banner-text">
          <div className="banner-pill">
            <Landmark size={14} />
            <span>INSTITUTIONAL REGISTRY: CHN-MUS-001</span>
          </div>
          <h1 className="banner-title">Government Museum Chennai</h1>
          <p className="banner-desc">
            Pantheon Complex, Egmore, Chennai • Active Operational Control & Conservation System
          </p>
        </div>

        <div className="banner-actions">
          <button className="btn btn-outline-white btn-sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Live Sync'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <StatCard
          title="Total Artifacts"
          value={summary?.totalArtifacts || 0}
          subtitle="Registered in Vault"
          icon={<Boxes size={22} />}
          accent="amber"
          onClick={() => onNavigateTab('artifacts')}
        />
        <StatCard
          title="Total Visitors"
          value={summary?.totalVisitors?.toLocaleString() || 0}
          subtitle="Recorded Footfall"
          icon={<Users size={22} />}
          accent="primary"
          onClick={() => onNavigateTab('visitors')}
        />
        <StatCard
          title="Active Exhibitions"
          value={summary?.activeExhibitions || 0}
          subtitle={`${summary?.totalExhibitions || 0} Total Programs`}
          icon={<Sparkles size={22} />}
          accent="emerald"
          onClick={() => onNavigateTab('exhibitions')}
        />
        <StatCard
          title="Conservation Records"
          value={summary?.conservationRecords || 0}
          subtitle="Treatments Logged"
          icon={<ShieldCheck size={22} />}
          accent="indigo"
          onClick={() => onNavigateTab('conservation')}
        />
        <StatCard
          title="Restoration Projects"
          value={summary?.restorationRecords || 0}
          subtitle={`₹${(summary?.totalRestorationCost || 0).toLocaleString()} Allocated`}
          icon={<Wrench size={22} />}
          accent="rose"
          onClick={() => onNavigateTab('restoration')}
        />
      </div>

      {/* Main Row: Visitor Chart & Recent Artifacts */}
      <div className="dashboard-grid-2-col">
        {/* Visitor Trend Chart */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2 className="card-title">Daily Visitor Attendance Trend</h2>
              <p className="card-subtitle">Recent daily admissions at Government Museum Chennai</p>
            </div>
            <span className="badge badge-primary">
              <TrendingUp size={13} /> Live Registry
            </span>
          </div>

          <div className="chart-wrapper">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#visitorGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart-placeholder">No visitor records logged yet.</div>
            )}
          </div>
        </div>

        {/* Recent Artifacts */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2 className="card-title">Recently Registered Artifacts</h2>
              <p className="card-subtitle">Latest catalog additions</p>
            </div>
            <button className="btn-link" onClick={() => onNavigateTab('artifacts')}>
              View All <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="recent-list">
            {summary?.recentArtifacts && summary.recentArtifacts.length > 0 ? (
              summary.recentArtifacts.map((art) => (
                <div key={art.id} className="recent-item">
                  <div className="recent-item-icon">
                    <Boxes size={18} />
                  </div>
                  <div className="recent-item-details">
                    <span className="recent-item-title">{art.name}</span>
                    <span className="recent-item-sub">
                      {art.category} • {art.location}
                    </span>
                  </div>
                  <StatusBadge status={art.condition} type="condition" />
                </div>
              ))
            ) : (
              <p className="no-data-text">No artifacts registered yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Exhibitions, Conservation, Restoration */}
      <div className="dashboard-grid-3-col">
        {/* Active Exhibitions */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="card-title">Exhibitions</h2>
            <button className="btn-link" onClick={() => onNavigateTab('exhibitions')}>
              Manage <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="recent-list">
            {summary?.recentExhibitions && summary.recentExhibitions.length > 0 ? (
              summary.recentExhibitions.map((exh) => (
                <div key={exh.id} className="recent-item">
                  <div className="recent-item-details">
                    <span className="recent-item-title">{exh.name}</span>
                    <span className="recent-item-sub">
                      <Calendar size={12} /> {new Date(exh.start_date).toLocaleDateString()} • {exh.location}
                    </span>
                  </div>
                  <StatusBadge status={exh.status} type="exhibition" />
                </div>
              ))
            ) : (
              <p className="no-data-text">No exhibitions scheduled.</p>
            )}
          </div>
        </div>

        {/* Conservation Activity */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="card-title">Recent Conservation</h2>
            <button className="btn-link" onClick={() => onNavigateTab('conservation')}>
              Logs <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="recent-list">
            {summary?.recentConservation && summary.recentConservation.length > 0 ? (
              summary.recentConservation.map((c) => (
                <div key={c.id} className="recent-item">
                  <div className="recent-item-details">
                    <span className="recent-item-title">{c.artifact_name}</span>
                    <span className="recent-item-sub">
                      By {c.conservator} • {new Date(c.conservation_date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="condition-transition-pill">
                    {c.condition_before} → {c.condition_after}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-data-text">No conservation treatments logged.</p>
            )}
          </div>
        </div>

        {/* Restoration Projects */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="card-title">Restoration Projects</h2>
            <button className="btn-link" onClick={() => onNavigateTab('restoration')}>
              Projects <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="recent-list">
            {summary?.recentRestoration && summary.recentRestoration.length > 0 ? (
              summary.recentRestoration.map((r) => (
                <div key={r.id} className="recent-item">
                  <div className="recent-item-details">
                    <span className="recent-item-title">{r.artifact_name}</span>
                    <span className="recent-item-sub">
                      {r.restoration_type} • ₹{Number(r.cost).toLocaleString()}
                    </span>
                  </div>
                  <StatusBadge status={r.status} type="restoration" />
                </div>
              ))
            ) : (
              <p className="no-data-text">No restoration projects recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
