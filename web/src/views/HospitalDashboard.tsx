import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClinicalAppShell } from '../components/ClinicalAppShell';
import {
  BloodRequest,
  BloodInventoryItem,
  DonorSearchResult,
  BloodGroup,
  RequestUrgency,
  RequestStatus,
} from '../types';
import {
  PlusCircle,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Search,
  Filter,
  User,
  HeartHandshake,
  Warehouse,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';

const BLOOD_GROUPS: { label: string; value: BloodGroup }[] = [
  { label: 'A+', value: 'A_POSITIVE' },
  { label: 'A-', value: 'A_NEGATIVE' },
  { label: 'B+', value: 'B_POSITIVE' },
  { label: 'B-', value: 'B_NEGATIVE' },
  { label: 'AB+', value: 'AB_POSITIVE' },
  { label: 'AB-', value: 'AB_NEGATIVE' },
  { label: 'O+', value: 'O_POSITIVE' },
  { label: 'O-', value: 'O_NEGATIVE' },
];

const formatBloodGroup = (bg: string) => {
  return bg
    .replace('_POSITIVE', '+')
    .replace('_NEGATIVE', '-')
    .replace('_', ' ');
};

export const HospitalDashboard: React.FC = () => {
  const { user, activeOrg } = useAuth();

  const [activeTab, setActiveTab] = useState<'requests' | 'inventory' | 'donors'>('requests');
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [donors, setDonors] = useState<DonorSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [bgFilter, setBgFilter] = useState<string>('');
  const [searchCity, setSearchCity] = useState<string>('Metropolis');

  // Modal for new request
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBg, setNewBg] = useState<BloodGroup>('O_POSITIVE');
  const [newUnits, setNewUnits] = useState<number>(2);
  const [newUrgency, setNewUrgency] = useState<RequestUrgency>('HIGH');
  const [newContactName, setNewContactName] = useState(user?.fullName || 'Dr. Sarah Connor');
  const [newContactPhone, setNewContactPhone] = useState(user?.phone || '+15550101');
  const [newHospitalName, setNewHospitalName] = useState(activeOrg?.name || 'City Central Hospital');
  const [newCity, setNewCity] = useState(activeOrg?.city || 'Metropolis');
  const [newTown, setNewTown] = useState(activeOrg?.town || 'Downtown');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqList, invList, donorList] = await Promise.all([
        api.getRequests({
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          bloodGroup: bgFilter || undefined,
        }),
        api.getInventory(),
        api.searchDonors({ city: searchCity || undefined }),
      ]);
      setRequests(reqList);
      setInventory(invList);
      setDonors(donorList);
    } catch (err) {
      console.error('Error fetching hospital dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, bgFilter, searchCity]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createRequest({
        bloodGroup: newBg,
        unitsRequired: Number(newUnits),
        urgency: newUrgency,
        hospitalName: newHospitalName,
        city: newCity,
        town: newTown,
        contactName: newContactName,
        contactPhone: newContactPhone,
        notes: newNotes,
        hospitalId: activeOrg?.id,
      });
      setIsModalOpen(false);
      setNewNotes('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: RequestStatus) => {
    try {
      await api.updateRequestStatus(requestId, status);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  // KPIs
  const totalRequestsCount = requests.length;
  const criticalCount = requests.filter((r) => r.urgency === 'CRITICAL' || r.urgency === 'HIGH').length;
  const fulfilledCount = requests.filter((r) => r.status === 'FULFILLED').length;
  const totalStockUnits = inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);

  return (
    <ClinicalAppShell
      role="HOSPITAL_STAFF"
      activeTab={activeTab}
      onTabChange={(t) => setActiveTab(t as any)}
      onPrimaryAction={() => setIsModalOpen(true)}
      primaryActionLabel="New Blood Request"
      primaryActionIcon={<PlusCircle className="w-4 h-4" />}
      title="Hospital Clinical Transfusion Desk"
      subtitle={`Active Facility: ${activeOrg ? `${activeOrg.name} (${activeOrg.city})` : 'City Central Hospital'} • Live Clinical Requisitions & Inventory Network`}
    >
      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{criticalCount}</div>
            <div className="stat-label">Urgent / Critical Needs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <FileText className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalRequestsCount}</div>
            <div className="stat-label">Total Blood Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{fulfilledCount}</div>
            <div className="stat-label">Fulfilled Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Warehouse className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalStockUnits}</div>
            <div className="stat-label">Units Available in Banks</div>
          </div>
        </div>
      </div>

      {/* Tab 1: Blood Requests */}
      {activeTab === 'requests' && (
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <FileText className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
              Active Clinical Blood Requests
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open (Searching)</option>
                <option value="RESPONSES_RECEIVED">Responses Received</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={bgFilter}
                onChange={(e) => setBgFilter(e.target.value)}
              >
                <option value="">All Blood Groups</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg.value} value={bg.value}>
                    {bg.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Hospital & Location</th>
                  <th>Contact Person</th>
                  <th>Donor Responses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                      No blood requests match your current filters. Click "+ New Blood Request" to submit one.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <React.Fragment key={req.id}>
                      <tr>
                        <td>
                          <span className="blood-badge">{formatBloodGroup(req.bloodGroup)}</span>
                        </td>
                        <td>
                          <strong>{req.unitsRequired}</strong> units
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              req.urgency === 'CRITICAL'
                                ? 'badge-red'
                                : req.urgency === 'HIGH'
                                ? 'badge-amber'
                                : 'badge-blue'
                            }`}
                          >
                            {req.urgency}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              req.status === 'FULFILLED'
                                ? 'badge-green'
                                : req.status === 'RESPONSES_RECEIVED'
                                ? 'badge-amber'
                                : req.status === 'CANCELLED'
                                ? 'badge-gray'
                                : 'badge-red'
                            }`}
                          >
                            {req.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{req.hospitalName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {req.town}, {req.city}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{req.contactName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{req.contactPhone}</div>
                        </td>
                        <td>
                          {req.responses && req.responses.length > 0 ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() =>
                                setExpandedRequestId(expandedRequestId === req.id ? null : req.id)
                              }
                            >
                              <HeartHandshake className="w-3.5 h-3.5 text-primary" style={{ color: 'var(--primary)' }} />
                              {req.responses.length} Donor(s)
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Searching donors...</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {req.status !== 'FULFILLED' && req.status !== 'CANCELLED' && (
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() => handleUpdateStatus(req.id, 'FULFILLED')}
                                title="Mark request as fulfilled"
                              >
                                Fulfilled
                              </button>
                            )}
                            {req.status === 'OPEN' && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleUpdateStatus(req.id, 'CANCELLED')}
                                title="Cancel this request"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Donor Responses details */}
                      {expandedRequestId === req.id && req.responses && (
                        <tr>
                          <td colSpan={8} style={{ background: '#f8fafc', padding: '1rem 1.5rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-800)' }}>
                              Voluntary Donors Responded to this Request:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                              {req.responses.map((resp) => (
                                <div
                                  key={resp.id}
                                  style={{
                                    background: '#ffffff',
                                    border: '1px solid var(--slate-200)',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{resp.donor.fullName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{resp.donor.phone}</div>
                                  </div>
                                  <span className="badge badge-green">Ready to Donate</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Blood Bank Stock Inquiry */}
      {activeTab === 'inventory' && (
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <Warehouse className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
              Live Blood Bank Stock Network
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Verified stock available for immediate hospital emergency requisition
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Units Available</th>
                  <th>Blood Bank Facility</th>
                  <th>Location</th>
                  <th>Coordination Phone</th>
                  <th>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                      No blood bank inventory recorded in the central database.
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="blood-badge">{formatBloodGroup(item.bloodGroup)}</span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>
                          {item.unitsAvailable}
                        </strong>{' '}
                        units
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.organization?.name || 'Metropolis Central Blood Bank'}</td>
                      <td>{item.organization?.city || 'Metropolis'}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600 }}>
                          <Phone className="w-3.5 h-3.5" />
                          {item.organization?.phone || '+1 555-0200'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.unitsAvailable < 5
                              ? 'badge-red'
                              : item.unitsAvailable < 10
                              ? 'badge-amber'
                              : 'badge-green'
                          }`}
                        >
                          {item.unitsAvailable < 5 ? 'Critical Stock' : item.unitsAvailable < 10 ? 'Moderate' : 'Healthy Stock'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Find Voluntary Donors */}
      {activeTab === 'donors' && (
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <HeartHandshake className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
              Locate Compatible Voluntary Donors
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                className="form-control"
                style={{ width: '200px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                placeholder="Search by City..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Donor Name</th>
                  <th>Blood Group</th>
                  <th>Location</th>
                  <th>Contact Phone</th>
                  <th>Email</th>
                  <th>Availability Status</th>
                </tr>
              </thead>
              <tbody>
                {donors.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                      No available voluntary donors located in {searchCity}.
                    </td>
                  </tr>
                ) : (
                  donors.map((donor) => (
                    <tr key={donor.userId}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{donor.fullName}</td>
                      <td>
                        <span className="blood-badge">{formatBloodGroup(donor.bloodGroup)}</span>
                      </td>
                      <td>
                        {donor.town}, {donor.city}
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600 }}>
                          <Phone className="w-3.5 h-3.5" />
                          {donor.phone}
                        </span>
                      </td>
                      <td style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>{donor.email}</td>
                      <td>
                        <span className="badge badge-green">Available to Donate</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Blood Request */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <PlusCircle className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
                Submit Hospital Blood Request
              </div>
              <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest}>
              <div className="modal-body">
                {/* Select Blood Group */}
                <div className="form-group">
                  <label className="form-label">Required Blood Group (ABO & Rh)</label>
                  <div className="bg-grid">
                    {BLOOD_GROUPS.map((bg) => (
                      <button
                        key={bg.value}
                        type="button"
                        className={`bg-pill ${newBg === bg.value ? 'selected' : ''}`}
                        onClick={() => setNewBg(bg.value)}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Units Required (Pints)</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      className="form-control"
                      value={newUnits}
                      onChange={(e) => setNewUnits(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clinical Urgency</label>
                    <select
                      className="form-control"
                      value={newUrgency}
                      onChange={(e) => setNewUrgency(e.target.value as RequestUrgency)}
                    >
                      <option value="CRITICAL">Critical (Immediate OR / Trauma)</option>
                      <option value="HIGH">High (Within 6 Hours)</option>
                      <option value="MEDIUM">Medium (Within 24 Hours)</option>
                      <option value="LOW">Low (Scheduled Elective Surgery)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Hospital Facility Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newHospitalName}
                      onChange={(e) => setNewHospitalName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Contact Person / Nurse</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Clinical Notes / Diagnosis</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Urgent need for emergency cesarean section or trauma patient in ICU"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting Request...' : 'Publish Blood Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ClinicalAppShell>
  );
};
