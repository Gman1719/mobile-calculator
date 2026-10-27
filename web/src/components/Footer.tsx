import React from 'react';
import {
  Droplet,
  Building2,
  Warehouse,
  ShieldAlert,
  ShieldCheck,
  Activity,
  HeartPulse,
  Clock,
  Layers,
} from 'lucide-react';

interface FooterProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onNavigateHome: (anchor?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLogin,
  onOpenRegister,
  onNavigateHome,
}) => {
  return (
    <footer className="site-footer">
      <div className="footer-top-container">
        {/* Brand & Mission Column */}
        <div className="footer-col brand-col">
          <div className="footer-brand" onClick={() => onNavigateHome()} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">
              <img src="/blood-drop-logo.png" alt="LifeFlow Logo" className="brand-logo-img" />
            </div>
            <div>
              <div className="brand-title">
                LifeFlow <span style={{ color: 'var(--primary)' }}>Clinical</span>
              </div>
              <div className="brand-subtitle">Emergency Blood Logistics &amp; Sourcing</div>
            </div>
          </div>

          <p className="footer-mission-text">
            A real-time clinical blood logistics network engineered to connect voluntary mobile donors, hospital surgical units, and regional blood bank inventories across a synchronized central infrastructure.
          </p>
        </div>

        {/* Column 2: Clinical Portals */}
        <div className="footer-col">
          <h4 className="footer-col-title">Clinical Portals</h4>
          <ul className="footer-links">
            <li>
              <button type="button" className="footer-link-btn" onClick={onOpenLogin}>
                <Building2 className="w-4 h-4 text-primary" />
                <span>Hospital Staff Portal</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={onOpenLogin}>
                <Warehouse className="w-4 h-4 text-blue-500" />
                <span>Blood Bank Workspace</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={onOpenLogin}>
                <ShieldAlert className="w-4 h-4 text-purple-500" />
                <span>System Administration</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={onOpenRegister}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Register Healthcare Facility</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onNavigateHome('five-roles')}>
                <Activity className="w-4 h-4 text-rose-500" />
                <span>Explore the 5 System Roles</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Platform & Features */}
        <div className="footer-col">
          <h4 className="footer-col-title">Network &amp; Sourcing</h4>
          <ul className="footer-links">
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onNavigateHome('about')}>
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Emergency Blood Requisitions</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onNavigateHome('five-roles')}>
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Regional Provider Network</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onNavigateHome('how-it-works')}>
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Clinical Workflow Lifecycle</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <div className="footer-copyright">
            © {new Date().getFullYear()} <strong>LifeFlow Clinical</strong>. All rights reserved. Hospital Blood Logistics &amp; Donor Coordination Network.
          </div>
        </div>
      </div>
    </footer>
  );
};
