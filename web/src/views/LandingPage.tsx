import React from 'react';
import {
  Building2,
  Warehouse,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Smartphone,
  ShieldCheck,
  Search,
  Users,
  Flame,
  Lock,
  Heart,
  FileText,
  Droplet,
  Clock,
  Activity,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: 'HOSPITAL_STAFF' | 'BLOOD_BANK_OFFICER' | 'SYSTEM_ADMINISTRATOR') => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRole,
  onOpenLogin,
  onOpenRegister,
}) => {
  return (
    <div className="landing-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section" id="about">
        <div className="hero-glow-blob hero-glow-blob-1" />
        <div className="hero-glow-blob hero-glow-blob-2" />
        <div className="hero-content">
          <div className="hero-split-layout">
            {/* Left: Donor Hero Illustration */}
            <div className="hero-image-col">
              <div className="hero-illustration-container">
                <div className="hero-illustration-glow" />
                <img
                  src="/donor-hero.png"
                  alt="Voluntary Blood Donor"
                  className="hero-donor-img"
                />
              </div>
            </div>

            {/* Right: Text Content */}
            <div className="hero-text-col">
              <h1 className="hero-title hero-title-left">
                Find Blood. <span className="gradient-text">Save Lives.</span>
              </h1>

              <p className="hero-subtitle hero-subtitle-left">
                Connect blood donors, hospitals, and blood banks to help people get the blood they need when every second counts. Find eligible donors, request blood, check availability, and track requests from submission to fulfillment—<strong className="hero-highlight">all in one place</strong>.
              </p>

              <div className="hero-feature-tags">
                <span className="hero-feature-tag">
                  <span className="tag-check">✓</span> Real-Time Blood Request Tracking
                </span>
                <span className="hero-feature-tag">
                  <span className="tag-check">✓</span> Blood Availability at Hospitals &amp; Blood Banks
                </span>
                <span className="hero-feature-tag">
                  <span className="tag-check">✓</span> Smart Donor Matching by Blood Group &amp; Location
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Micro-Cards Grid */}
          <div className="hero-metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-box rose">
                <Droplet className="w-5 h-5" />
              </div>
              <div className="metric-content">
                <div className="metric-val">8 Groups</div>
                <div className="metric-lbl">ABO & Rh Classified</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box blue">
                <Clock className="w-5 h-5" />
              </div>
              <div className="metric-content">
                <div className="metric-val">100% FEFO</div>
                <div className="metric-lbl">Cold-Chain Expiration Control</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box purple">
                <Users className="w-5 h-5" />
              </div>
              <div className="metric-content">
                <div className="metric-val">5 Roles</div>
                <div className="metric-lbl">Integrated Healthcare Network</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box emerald">
                <Activity className="w-5 h-5" />
              </div>
              <div className="metric-content">
                <div className="metric-val">Instant Sync</div>
                <div className="metric-lbl">Atomic Unit Allocation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SYSTEM CAPABILITIES & LOGISTICS */}
      <section className="system-overview-section" style={{ marginBottom: '4.5rem' }}>
        <div className="section-header">
          <div className="section-eyebrow">SYSTEM CAPABILITIES</div>
          <h2 className="section-title">Unified Healthcare Solution for Blood Logistics</h2>
          <p className="section-desc">
            Traditional blood sourcing is often hindered by fragmented communications and manual logs. 
            LifeFlow integrates every clinical stakeholder into a secure, automated, and auditable digital pipeline:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="feature-highlight-card">
            <div className="highlight-icon red">
              <Flame className="w-6 h-6" />
            </div>
            <h3>Emergency Requisitions</h3>
            <p>
              When emergency surgery or trauma requires immediate blood units, clinical staff submit instant requests specifying blood group, volume, and urgency level.
            </p>
          </div>

          <div className="feature-highlight-card">
            <div className="highlight-icon blue">
              <Search className="w-6 h-6" />
            </div>
            <h3>Intelligent Multi-Channel Sourcing</h3>
            <p>
              The platform concurrently assesses inventory at accredited blood banks and alerts compatible registered voluntary donors within geographic proximity.
            </p>
          </div>

          <div className="feature-highlight-card">
            <div className="highlight-icon green">
              <Warehouse className="w-6 h-6" />
            </div>
            <h3>Atomic Inventory Allocation</h3>
            <p>
              Blood bank officers review requisitions and issue verified batches. Units are deducted atomically in the central database to prevent duplicate allocation.
            </p>
          </div>

          <div className="feature-highlight-card">
            <div className="highlight-icon purple">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3>Institutional Accreditation & Compliance</h3>
            <p>
              Participating hospitals and blood banks must be verified and authorized by a System Administrator, guaranteeing strict healthcare data security.
            </p>
          </div>
        </div>
      </section>

      {/* 3. THE 5 USER ROLES EXPLAINED */}
      <section className="roles-explanation-section" id="five-roles" style={{ marginBottom: '4.5rem' }}>
        <div className="section-header">
          <div className="section-eyebrow">STAKEHOLDER ARCHITECTURE</div>
          <h2 className="section-title">Designed for Dedicated Healthcare Roles</h2>
          <p className="section-desc">
            The platform is organized across 5 specialized roles: 2 mobile roles for community voluntary donors and emergency requesters, and 3 clinical web workspaces.
          </p>
        </div>

        {/* Mobile Community Roles */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span className="badge badge-blue" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <Smartphone className="w-4 h-4" /> MOBILE APP USERS
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="role-explainer-card mobile">
              <div className="role-explainer-header">
                <div className="role-avatar donor">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h4>1. Blood Donor</h4>
                  <span className="role-sub">Mobile Android Application</span>
                </div>
              </div>
              <p>
                Voluntary donors who record their ABO and Rh blood group. Donors can manage availability, receive urgent notifications for nearby matching requisitions, and accept donation appointments.
              </p>
              <div className="role-capabilities">
                <span>✓ Profile & Blood Classification Record</span>
                <span>✓ Real-Time Availability Switch</span>
                <span>✓ Emergency Requisition Matching Alerts</span>
                <span>✓ Transfusion Donation History</span>
              </div>
            </div>

            <div className="role-explainer-card mobile">
              <div className="role-explainer-header">
                <div className="role-avatar requester">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4>2. Blood Requester</h4>
                  <span className="role-sub">Mobile Android Application</span>
                </div>
              </div>
              <p>
                Patients, families, or authorized emergency contacts who require urgent blood. They create requisitions with hospital location details and coordinate directly with responding donors.
              </p>
              <div className="role-capabilities">
                <span>✓ Rapid Blood Requisition Submission</span>
                <span>✓ Geographic Donor Compatibility Filter</span>
                <span>✓ Live Status Progression Monitoring</span>
                <span>✓ Direct Coordination with Verified Donors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Web Clinical Dashboards */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span className="badge badge-red" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <Building2 className="w-4 h-4" /> CLINICAL WEB DASHBOARDS
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Hospital Staff */}
            <div className="role-explainer-card web hospital">
              <div className="role-explainer-header">
                <div className="role-avatar hospital">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4>3. Hospital Staff</h4>
                  <span className="role-sub">Protected Clinical Dashboard</span>
                </div>
              </div>
              <p>
                Physicians, surgical teams, and transfusion nurses. They place immediate and scheduled surgical blood requisitions, inspect regional blood bank stock, and coordinate emergency procedures.
              </p>
              <div className="role-capabilities">
                <span>✓ Emergency & Scheduled Transfusion Requisitions</span>
                <span>✓ Coordinate with Responding Donors</span>
                <span>✓ Live Query of Regional Blood Bank Reserves</span>
                <span>✓ Clinical Verification & Order Fulfillment</span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={onOpenLogin}
              >
                Sign In to Hospital Workspace
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Blood Bank Officer */}
            <div className="role-explainer-card web bloodbank">
              <div className="role-explainer-header">
                <div className="role-avatar bloodbank">
                  <Warehouse className="w-6 h-6" />
                </div>
                <div>
                  <h4>4. Blood Bank Officer</h4>
                  <span className="role-sub">Protected Inventory Dashboard</span>
                </div>
              </div>
              <p>
                Laboratory specialists and inventory controllers. They log verified blood collection batches, monitor expiration dates following FEFO standards, and dispense units directly to hospitals.
              </p>
              <div className="role-capabilities">
                <span>✓ 8 Blood Group Inventory Matrix</span>
                <span>✓ Batch Intake Logging (+35-Day Expiration)</span>
                <span>✓ First-Expired First-Out (FEFO) Cold-Chain Tracking</span>
                <span>✓ Atomic Stock Issuance & Hospital Transfer</span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={onOpenLogin}
              >
                Sign In to Blood Bank Workspace
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* System Administrator */}
            <div className="role-explainer-card web admin">
              <div className="role-explainer-header">
                <div className="role-avatar admin">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4>5. System Administrator</h4>
                  <span className="role-sub">Protected Administrative Portal</span>
                </div>
              </div>
              <p>
                Network oversight authorities. They review and verify pending healthcare facility registrations, manage user permissions, and monitor comprehensive security audit trails.
              </p>
              <div className="role-capabilities">
                <span>✓ Institutional Accreditation & Facility Approval</span>
                <span>✓ User Account Administration & Access Control</span>
                <span>✓ Master Organizations Directory</span>
                <span>✓ Immutable System Security Audit Logs</span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={onOpenLogin}
              >
                Sign In to Admin Workspace
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EMERGENCY WORKFLOW LIFECYCLE */}
      <section className="workflow-section" id="how-it-works" style={{ marginBottom: '4.5rem' }}>
        <div className="section-header">
          <div className="section-eyebrow">CLINICAL WORKFLOW</div>
          <h2 className="section-title">Emergency Blood Requisition Lifecycle</h2>
          <p className="section-desc">
            How emergency blood requisitions move seamlessly from placement to verified transfusion across the clinical network.
          </p>
        </div>

        <div className="workflow-steps">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon-box">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h4>Requisition Placement</h4>
            <p>
              Hospital clinical staff submit an urgent requisition detailing blood classification, required units, patient department, and urgency tier.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon-box">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <h4>Automated Sourcing</h4>
            <p>
              The system scans inventory across certified regional blood banks and alerts verified voluntary donors within travel distance.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon-box">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
            </div>
            <h4>Batch Dispensing & Coordination</h4>
            <p>
              Blood bank officers allocate tested batches using FEFO priority, while compatible voluntary donors confirm availability.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">04</div>
            <div className="step-icon-box">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <h4>Fulfillment & Audit</h4>
            <p>
              The requisition is marked as fulfilled, central inventory records update atomically, and an immutable audit entry is logged.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION / INSTITUTIONAL WORKSPACE ACCESS (WHITE BACKGROUND) */}
      <section
        style={{
          background: '#ffffff',
          border: '1px solid var(--slate-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          color: 'var(--slate-900)',
          marginTop: '4rem',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h2 style={{ fontSize: '2rem', fontWeight: 850, color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
          Access Your Clinical Workspace
        </h2>
        <p style={{ color: 'var(--slate-600)', maxWidth: '620px', margin: '0 auto 2rem', fontSize: '1rem', lineHeight: 1.6 }}>
          Sign in with your verified clinical credentials to access your organization dashboard, or register a new healthcare facility.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-lg" onClick={onOpenLogin}>
            <Lock className="w-4 h-4" />
            Sign In to Workspace
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={onOpenRegister}>
            <Building2 className="w-4 h-4 text-primary" />
            Register Healthcare Organization
          </button>
        </div>
      </section>
    </div>
  );
};
