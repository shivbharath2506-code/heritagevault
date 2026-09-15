import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  ShieldCheck,
  Sparkles,
  Wrench,
  Users,
  BarChart3,
  FileText,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'curator', 'conservator', 'staff'] },
    { id: 'artifacts', label: 'Artifacts', icon: Boxes, roles: ['admin', 'curator', 'conservator', 'staff'] },
    { id: 'conservation', label: 'Conservation', icon: ShieldCheck, roles: ['admin', 'curator', 'conservator', 'staff'] },
    { id: 'exhibitions', label: 'Exhibitions', icon: Sparkles, roles: ['admin', 'curator', 'conservator', 'staff'] },
    { id: 'restoration', label: 'Restoration', icon: Wrench, roles: ['admin', 'curator', 'conservator', 'staff'] },
    { id: 'visitors', label: 'Visitors', icon: Users, roles: ['admin', 'curator', 'conservator', 'staff'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'curator', 'conservator', 'staff'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin', 'curator', 'conservator', 'staff'] },
  ];

  const filteredNavItems = navItems.filter((item) => hasRole(...item.roles));

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <div className="logo-symbol">HV</div>
            <div>
              <span className="brand-title">HeritageVault</span>
              <span className="brand-tagline">Museum Management</span>
            </div>
          </div>
          <button className="sidebar-mobile-close" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-label">OPERATIONS & COLLECTIONS</div>

        <nav className="sidebar-nav">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
              >
                <Icon size={19} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {isActive && <span className="active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-divider" />
          <button
            className="sidebar-link public-portal-btn"
            onClick={() => {
              onSelectTab('public');
              onClose();
            }}
          >
            <ExternalLink size={18} className="nav-icon" />
            <span className="nav-label">Public View Portal</span>
          </button>

          <button className="sidebar-link logout-nav-btn" onClick={logout}>
            <LogOut size={18} className="nav-icon" />
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
