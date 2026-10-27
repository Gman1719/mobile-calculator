import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Warehouse,
  HeartHandshake,
  Calendar,
  Building2,
  History,
  ShieldAlert,
  Users,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface ClinicalAppShellProps {
  role: 'HOSPITAL_STAFF' | 'BLOOD_BANK_OFFICER' | 'SYSTEM_ADMINISTRATOR';
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  primaryActionIcon?: React.ReactNode;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionIcon?: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const ClinicalAppShell: React.FC<ClinicalAppShellProps> = ({
  role,
  activeTab,
  onTabChange,
  onPrimaryAction,
  primaryActionLabel,
  primaryActionIcon,
  secondaryAction,
  secondaryActionLabel,
  secondaryActionIcon,
  title,
  subtitle,
  children,
}) => {
  const { user, activeOrg, logout } = useAuth();

  const getNavItems = (): { section: string; items: NavItemConfig[] }[] => {
    if (role === 'HOSPITAL_STAFF') {
      return [
        {
          section: 'Clinical Transfusion Operations',
          items: [
            { id: 'requests', label: 'Blood Requisitions', icon: <FileText className="w-4 h-4" /> },
            { id: 'inventory', label: 'Regional Bank Stock', icon: <Warehouse className="w-4 h-4" /> },
            { id: 'donors', label: 'Voluntary Donors Match', icon: <HeartHandshake className="w-4 h-4" /> },
          ],
        },
      ];
    } else if (role === 'BLOOD_BANK_OFFICER') {
      return [
        {
          section: 'Blood Inventory & Logistics',
          items: [
            { id: 'reserves', label: 'Blood Group Reserves', icon: <Warehouse className="w-4 h-4" /> },
            { id: 'batches', label: 'Cold-Chain FEFO Tracker', icon: <Calendar className="w-4 h-4" /> },
            { id: 'hospitalRequests', label: 'Hospital Transfusion Orders', icon: <Building2 className="w-4 h-4" /> },
            { id: 'transactions', label: 'Stock Audit Ledger', icon: <History className="w-4 h-4" /> },
          ],
        },
      ];
    } else {
      return [
        {
          section: 'National Network Governance',
          items: [
            { id: 'approvals', label: 'Facility Approvals', icon: <ShieldAlert className="w-4 h-4" /> },
            { id: 'organizations', label: 'Registered Institutions', icon: <Building2 className="w-4 h-4" /> },
            { id: 'users', label: 'Clinical User Directory', icon: <Users className="w-4 h-4" /> },
            { id: 'audit', label: 'Master Audit Trail', icon: <History className="w-4 h-4" /> },
          ],
        },
      ];
    }
  };

  const navSections = getNavItems();

  const getRoleBadge = () => {
    switch (role) {
      case 'HOSPITAL_STAFF':
        return 'Hospital Clinical Workspace';
      case 'BLOOD_BANK_OFFICER':
        return 'Blood Bank Transfusion Center';
      case 'SYSTEM_ADMINISTRATOR':
        return 'National Regulatory Governance';
    }
  };

  return (
    <div className="clinical-app-layout">
      {/* 1. Left Persistent Clinical Sidebar */}
      <aside className="clinical-sidebar">
        <div>
          {/* Brand header */}
          <div className="clinical-sidebar-brand">
            <div className="sidebar-brand-icon">
              <img src="/blood-drop-logo.png" alt="LifeFlow Logo" className="sidebar-logo-img" />
            </div>
            <div>
              <div className="sidebar-brand-title">
                LifeFlow <span className="brand-highlight">Clinical</span>
              </div>
              <div className="sidebar-brand-tagline">Operating System v2.4</div>
            </div>
          </div>

          {/* Active Facility Context Box */}
          <div className="clinical-facility-card">
            <div className="facility-status-pill">
              <span className="pulse-dot-green" />
              <span>{getRoleBadge()}</span>
            </div>
            <div className="facility-card-name">
              {activeOrg ? activeOrg.name : 'Central Healthcare Facility'}
            </div>
            <div className="facility-card-location">
              {activeOrg?.city ? `${activeOrg.city}, ${activeOrg.town || 'Main Campus'}` : 'Integrated Regional Network'}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="clinical-sidebar-nav">
            {navSections.map((sec) => (
              <div key={sec.section} style={{ marginBottom: '1.25rem' }}>
                <div className="sidebar-nav-section-label">{sec.section}</div>
                {sec.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => onTabChange(item.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span className={`nav-icon-wrap ${isActive ? 'active' : ''}`}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="sidebar-nav-badge">{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with Clinician User Info and Logout */}
        <div className="clinical-sidebar-footer">
          <div className="clinician-profile-widget">
            <div className="clinician-avatar">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="clinician-info">
              <div className="clinician-name">{user?.fullName || 'Clinical Officer'}</div>
              <div className="clinician-role">{user?.email || 'verified@hospital.org'}</div>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={logout}
            title="Sign out of current workspace"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Right Main Working Console */}
      <div className="clinical-main-pane">
        {/* Top Application Command Bar */}
        <header className="clinical-topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumbs">
              <span>{getRoleBadge()}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="breadcrumb-active">{title}</span>
            </div>
            <h1 className="topbar-title">{title}</h1>
          </div>

          <div className="topbar-right">
            <div className="network-live-indicator">
              <span className="pulse-dot-green" />
              <span>Real-Time Clinical Sourcing Active</span>
            </div>

            {secondaryAction && secondaryActionLabel && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={secondaryAction}
                style={{ fontWeight: 650 }}
              >
                {secondaryActionIcon}
                <span>{secondaryActionLabel}</span>
              </button>
            )}

            {onPrimaryAction && primaryActionLabel && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onPrimaryAction}
                style={{ fontWeight: 700, padding: '0.55rem 1.15rem' }}
              >
                {primaryActionIcon}
                <span>{primaryActionLabel}</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="clinical-content-scroll">
          {children}
        </main>
      </div>
    </div>
  );
};
