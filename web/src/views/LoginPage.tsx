import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Activity,
  CheckCircle2,
  Zap,
  ArrowRight,
  LockKeyhole,
} from 'lucide-react';

interface LoginPageProps {
  onBackToHome: () => void;
  onOpenRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToHome, onOpenRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-page-glow top-left" />
      <div className="auth-page-glow bottom-right" />

      <div className="auth-container">
        {/* Navigation Bar */}
        <div className="auth-nav">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onBackToHome}>
            <ArrowLeft className="w-4 h-4" />
            Back to Public Portal
          </button>
        </div>

        {/* Auth Layout Box */}
        <div className="auth-card-layout">
          {/* Main Form */}
          <div className="auth-card-main">
            <div className="auth-header" style={{ marginBottom: '2rem' }}>
              <h1 className="auth-title">
                Institutional <span className="auth-title-gradient">Sign In</span>
              </h1>
              <p className="auth-subtitle">
                Access your verified hospital trauma center, regional blood bank, or administrative workspace.
              </p>
            </div>

            {error && (
              <div className="auth-error-banner">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Institutional Email Address
                </label>
                <div className="input-with-icon">
                  <Mail className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    className="form-control"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">
                  Account Password
                </label>
                <div className="input-with-icon">
                  <Lock className="input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="auth-form-options">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this workstation</span>
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                  Active AES-256 session
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Authenticating Clinical Credentials...
                  </>
                ) : (
                  <>
                    <span>Enter Verified Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch-prompt-pro">
              <div className="switch-prompt-content">
                <span className="switch-prompt-question">
                  Want to join our blood donation network?
                </span>{' '}
                <button
                  type="button"
                  className="auth-link-button-highlight"
                  onClick={onOpenRegister}
                >
                  <strong>Register Your Hospital or Blood Bank &rarr;</strong>
                </button>
              </div>
            </div>
          </div>

          {/* Clinical Sidebar */}
          <div className="auth-card-sidebar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="auth-sidebar-header">
                <h3>Clinical Security & Governance</h3>
                <p>
                  Synchronized national emergency blood requisition and cold-chain inventory infrastructure.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="auth-sidebar-features" style={{ margin: 0, gap: '1.1rem' }}>
                <div className="sidebar-feature-card">
                  <div className="feature-icon-box">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong>Role-Segregated Workspaces</strong>
                    <p>Dedicated clinical dashboards for trauma centers, blood banks, and system administrators.</p>
                  </div>
                </div>

                <div className="sidebar-feature-card">
                  <div className="feature-icon-box">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <strong>Atomic Stock Synchronization</strong>
                    <p>Real-time inventory deduction guarantees no duplicate allocation during critical emergency transfusions.</p>
                  </div>
                </div>

                <div className="sidebar-feature-card">
                  <div className="feature-icon-box">
                    <LockKeyhole className="w-4 h-4" />
                  </div>
                  <div>
                    <strong>Immutable Clinical Audit Trail</strong>
                    <p>Every transaction, batch transfer, and clinical order is timestamped and archived for regulatory compliance.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-sidebar-footer">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Certified Healthcare Data Architecture &bull; ISO/IEC 27001 Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
