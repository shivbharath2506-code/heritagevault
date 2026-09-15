import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Landmark, Lock, Mail, Key, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onBackToPublic: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToPublic, onLoginSuccess }) => {
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('admin@heritagevault.com');
  const [password, setPassword] = useState('Admin@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: 'ADMIN',
      name: 'Dr. R. Sundaram',
      email: 'admin@heritagevault.com',
      pass: 'Admin@123',
      color: '#d97706',
      desc: 'Full administrative access across all modules & reports',
    },
    {
      role: 'CURATOR',
      name: 'Meenakshi Krishnan',
      email: 'curator@heritagevault.com',
      pass: 'Curator@123',
      color: '#3b82f6',
      desc: 'Manages artifacts & curatorial exhibitions',
    },
    {
      role: 'CONSERVATOR',
      name: 'Arunmozhi Varman',
      email: 'conservator@heritagevault.com',
      pass: 'Conservator@123',
      color: '#10b981',
      desc: 'Manages conservation logs & restoration projects',
    },
    {
      role: 'STAFF',
      name: 'Kavitha Selvam',
      email: 'staff@heritagevault.com',
      pass: 'Staff@123',
      color: '#8b5cf6',
      desc: 'Logs daily visitor counts & view museum collections',
    },
  ];

  const handleDemoSelect = (demo: typeof demoAccounts[0]) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      toast.success('Authenticated successfully. Welcome to HeritageVault!');
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-background-overlay" />

      <div className="login-container">
        <button className="btn-back-public" onClick={onBackToPublic}>
          <ArrowLeft size={16} /> Back to Public Museum View
        </button>

        <div className="login-card">
          <div className="login-brand-header">
            <div className="login-logo-circle">
              <Landmark size={28} />
            </div>
            <h1 className="login-title">HeritageVault</h1>
            <p className="login-subtitle">
              Government Museum Chennai • Staff Management Portal
            </p>
            <span className="museum-code-badge">CHN-MUS-001</span>
          </div>

          {errorMessage && (
            <div className="auth-error-banner" role="alert">
              <Shield size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Official Staff Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@heritagevault.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Security Password</label>
              <div className="input-with-icon">
                <Key size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-gold btn-full btn-login" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner-sm" /> Authenticating...
                </>
              ) : (
                <>
                  <Lock size={18} /> Sign In to Management System
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="demo-accounts-box">
            <div className="demo-box-header">
              <CheckCircle2 size={15} />
              <span>Quick Demo Role Switcher (One-Click Selection)</span>
            </div>
            <div className="demo-buttons-grid">
              {demoAccounts.map((demo) => {
                const isSelected = email === demo.email;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    className={`demo-role-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleDemoSelect(demo)}
                  >
                    <div className="demo-btn-top">
                      <span className="demo-badge" style={{ backgroundColor: `${demo.color}20`, color: demo.color }}>
                        {demo.role}
                      </span>
                      <span className="demo-btn-name">{demo.name}</span>
                    </div>
                    <span className="demo-btn-desc">{demo.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="login-footer-text">
          <p>© {new Date().getFullYear()} Government Museum Chennai. Restricted Authorized Access Only.</p>
        </div>
      </div>
    </div>
  );
};
