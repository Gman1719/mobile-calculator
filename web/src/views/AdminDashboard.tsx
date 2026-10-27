import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClinicalAppShell } from '../components/ClinicalAppShell';
import { Organization, User, AuditLog, AdminStats } from '../types';
import {
  ShieldAlert,
  Building2,
  Warehouse,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  FileCheck,
  Search,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'approvals' | 'organizations' | 'users' | 'audit'>('approvals');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingOrgs, setPendingOrgs] = useState<Organization[]>([]);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, pendingData, allOrgsData, usersData, logsData] = await Promise.all([
        api.getAdminStats(),
        api.getPendingOrganizations(),
        api.getAllOrganizations(),
        api.getUsers(),
        api.getAuditLogs(),
      ]);
      setStats(statsData);
      setPendingOrgs(pendingData);
      setAllOrgs(allOrgsData);
      setUsersList(usersData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyOrg = async (orgId: string, isVerified: boolean) => {
    try {
      await api.verifyOrganization(orgId, isVerified);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update verification status');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateUserStatus(userId, newStatus);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch);
    const matchesRole =
      userRoleFilter === 'ALL' || u.roles.includes(userRoleFilter as any);
    return matchesSearch && matchesRole;
  });

  return (
    <ClinicalAppShell
      role="SYSTEM_ADMINISTRATOR"
      activeTab={activeTab}
      onTabChange={(t) => setActiveTab(t as any)}
      title="National Transfusion Regulatory Governance"
      subtitle="National Sourcing Network • Facility Accreditation, User Management & Compliance Audit"
    >
      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.pendingApprovals ?? pendingOrgs.length}</div>
            <div className="stat-label">Pending Org Approvals</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{(stats?.totalHospitals ?? 0) + (stats?.totalBloodBanks ?? 0)}</div>
            <div className="stat-label">Clinical Facilities</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Users className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalDonors ?? 0}</div>
            <div className="stat-label">Registered Donors</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Warehouse className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalStockUnits ?? 0}</div>
            <div className="stat-label">Total Units in Network</div>
          </div>
        </div>
      </div>

      {/* Tab 1: Pending Approvals */}
      {activeTab === 'approvals' && (
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <FileCheck className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
              Organization Verification Applications
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Approving a facility activates its officer account so they can immediately sign in
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Facility Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Contact Info</th>
                  <th>Representative / Staff</th>
                  <th>Submitted At</th>
                  <th>Decision Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--slate-400)' }}>
                      <CheckCircle className="w-8 h-8 text-green-500" style={{ margin: '0 auto 0.75rem', color: '#10b981' }} />
                      <div>All organization registration applications have been verified.</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        New hospital and blood bank submissions will appear here for review.
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingOrgs.map((org) => {
                    const repUser =
                      org.hospitalProfiles?.[0]?.user || org.bloodBankProfiles?.[0]?.user;
                    const license =
                      org.hospitalProfiles?.[0]?.employeeId ||
                      org.bloodBankProfiles?.[0]?.officerLicenseNo ||
                      'Submitted';

                    return (
                      <tr key={org.id}>
                        <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{org.name}</td>
                        <td>
                          <span
                            className={`badge ${
                              org.type === 'HOSPITAL' ? 'badge-blue' : 'badge-amber'
                            }`}
                          >
                            {org.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          {org.town}, {org.city}
                        </td>
                        <td>
                          <div>{org.phone}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{org.email}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{repUser?.fullName || 'Representative'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {repUser?.email} • ID: {license}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => handleVerifyOrg(org.id, true)}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleVerifyOrg(org.id, false)}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Organizations Directory */}
      {activeTab === 'organizations' && (
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <Building2 className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
              Registered Healthcare Facilities Directory
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Hospitals & Blood Banks registered across the network
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Facility Name</th>
                  <th>Facility Type</th>
                  <th>City / Address</th>
                  <th>Contact Details</th>
                  <th>Verification Status</th>
                  <th>Primary Representative</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allOrgs.map((org) => {
                  const rep = org.hospitalProfiles?.[0]?.user || org.bloodBankProfiles?.[0]?.user;
                  return (
                    <tr key={org.id}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{org.name}</td>
                      <td>
                        <span
                          className={`badge ${
                            org.type === 'HOSPITAL' ? 'badge-blue' : 'badge-amber'
                          }`}
                        >
                          {org.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div>{org.city}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{org.address}</div>
                      </td>
                      <td>
                        <div>{org.phone}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{org.email}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${org.isVerified ? 'badge-green' : 'badge-red'}`}
                        >
                          {org.isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </td>
                      <td>
                        {rep ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{rep.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{rep.email}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>None assigned</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleVerifyOrg(org.id, !org.isVerified)}
                        >
                          {org.isVerified ? 'Revoke Approval' : 'Approve Facility'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <Users className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
              User Accounts & Access Control
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-control"
                style={{ width: '220px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="DONOR">Blood Donors</option>
                <option value="REQUESTER">Requesters</option>
                <option value="HOSPITAL_STAFF">Hospital Staff</option>
                <option value="BLOOD_BANK_OFFICER">Blood Bank Officers</option>
                <option value="SYSTEM_ADMINISTRATOR">Administrators</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>User Full Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Assigned Roles</th>
                  <th>Account Status</th>
                  <th>Registered</th>
                  <th>Access Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {u.roles.map((r) => (
                          <span key={r} className="badge badge-gray" style={{ fontSize: '0.65rem' }}>
                            {r.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          u.status === 'ACTIVE'
                            ? 'badge-green'
                            : u.status === 'SUSPENDED'
                            ? 'badge-red'
                            : 'badge-amber'
                        }`}
                      >
                        {u.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                        disabled={u.roles.includes('SYSTEM_ADMINISTRATOR')}
                      >
                        {u.status === 'ACTIVE' ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <Activity className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
              System Security & Operation Audit Trail
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Immutable audit log of critical system events
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>User / Actor</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                      No audit records available.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge badge-blue">{log.action}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.targetEntity}</td>
                      <td>{log.user?.fullName || log.user?.email || 'System'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                        {log.details || log.entityId || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ClinicalAppShell>
  );
};
