import React from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './StatusBadge';
import { LogOut, Landmark, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Toggle navigation menu">
          <Menu size={22} />
        </button>
        <div className="navbar-museum-info">
          <div className="museum-icon-badge">
            <Landmark size={20} />
          </div>
          <div>
            <h1 className="navbar-museum-title">Government Museum Chennai</h1>
            <p className="navbar-museum-subtitle">Egmore, Chennai • CHN-MUS-001</p>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        {user && (
          <div className="navbar-user-section">
            <div className="user-avatar" title={user.name}>
              {getInitials(user.name)}
            </div>
            <div className="user-details-text">
              <span className="user-name">{user.name}</span>
              <StatusBadge status={user.role} type="role" />
            </div>
            <button className="btn-logout" onClick={logout} title="Sign Out">
              <LogOut size={16} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
