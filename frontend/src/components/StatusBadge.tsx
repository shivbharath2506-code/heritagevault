import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'condition' | 'exhibition' | 'restoration' | 'role';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'condition', className = '' }) => {
  const getBadgeClass = () => {
    const s = (status || '').toLowerCase().replace(/\s+/g, '-');
    return `badge badge-${type} badge-${s} ${className}`;
  };

  const getRoleLabel = () => {
    switch (status?.toLowerCase()) {
      case 'admin':
        return 'Chief Administrator';
      case 'curator':
        return 'Senior Curator';
      case 'conservator':
        return 'Art Conservator';
      case 'staff':
        return 'Museum Staff';
      default:
        return status;
    }
  };

  return (
    <span className={getBadgeClass()}>
      <span className="badge-dot" />
      {type === 'role' ? getRoleLabel() : status}
    </span>
  );
};
