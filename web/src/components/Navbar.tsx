import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleName } from '../types';
import { 
  Droplet, 
  Building2, 
  ShieldAlert, 
  Warehouse, 
  LogOut, 
  User as UserIcon,
  LogIn,
  LayoutDashboard,
  Home,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  currentView?: 'HOME' | 'LOGIN' | 'REGISTER' | 'DASHBOARD';
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onNavigateHome: (anchor?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView = 'HOME',
  onOpenLogin,
  onOpenRegister,
  onNavigateHome,
}) => {
  const { user, activeRole, activeOrg, logout, setActiveRole } = useAuth();

  const getRoleLabel = (role: RoleName | 'HOME' | null) => {
    switch (role) {
      case 'HOSPITAL_STAFF':
        return 'Hospital Staff';
      case 'BLOOD_BANK_OFFICER':
        return 'Blood Bank Officer';
      case 'SYSTEM_ADMINISTRATOR':
        return 'System Administrator';
      case 'DONOR':
        return 'Blood Donor';
      case 'REQUESTER':
        return 'Blood Requester';
      case 'HOME':
        return 'System Overview';
      default:
        return 'Guest';
    }
  };

  const getDashboardRole = (): RoleName => {
    if (!user) return 'HOSPITAL_STAFF';
    return (
      user.roles.find((r) =>
        ['HOSPITAL_STAFF', 'BLOOD_BANK_OFFICER', 'SYSTEM_ADMINISTRATOR'].includes(r)
      ) || 'HOSPITAL_STAFF'
    );
  };

  const handleBrandClick = () => {
    if (user) {
      setActiveRole(getDashboardRole());
    } else {
      onNavigateHome();
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    onNavigateHome(anchor);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <div className="nav-brand" onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <img src="/blood-drop-logo.png" alt="LifeFlow Logo" className="brand-logo-img" />
          </div>
          <div>
            <div className="brand-title">
              LifeFlow <span style={{ color: 'var(--primary)' }}>Clinical</span>
            </div>
            <div className="brand-subtitle">Emergency Blood Logistics & Sourcing</div>
          </div>
        </div>

        {/* Center Navigation */}
        {user ? (
          <div className="nav-workspace-pill">
            <span className="pulse-dot-green" />
            <span className="nav-workspace-label">
              {getRoleLabel(getDashboardRole())} Workspace
            </span>
          </div>
        ) : (
          <div className="nav-public-links">
            <a href="#about" className="nav-link" onClick={(e) => handleLinkClick(e, 'about')}>About</a>
            <a href="#how-it-works" className="nav-link" onClick={(e) => handleLinkClick(e, 'how-it-works')}>Clinical Workflow</a>
            <a href="#five-roles" className="nav-link" onClick={(e) => handleLinkClick(e, 'five-roles')}>The 5 Roles</a>
          </div>
        )}

        {/* User Info / Auth Action */}
        <div className="nav-user">
          {user ? (
            <>
              <div className="user-badge">
                <div className="user-avatar">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-meta">
                  <div className="user-name">{user.fullName}</div>
                  <div className="user-role-label">
                    {activeOrg ? `${activeOrg.name} (${activeOrg.city})` : getRoleLabel(getDashboardRole())}
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={logout}
                title="Log out of current workspace"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="nav-auth-buttons">
              <button
                type="button"
                className={`btn-nav-outline ${currentView === 'REGISTER' ? 'active' : ''}`}
                onClick={onOpenRegister}
              >
                Register Facility
              </button>
              <button
                type="button"
                className={`btn-nav-solid ${currentView === 'LOGIN' ? 'active' : ''}`}
                onClick={onOpenLogin}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In to Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
