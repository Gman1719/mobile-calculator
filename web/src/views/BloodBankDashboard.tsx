import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClinicalAppShell } from '../components/ClinicalAppShell';
import {
  BloodInventoryItem,
  InventoryBatch,
  InventoryTransaction,
  BloodRequest,
  Organization,
  BloodGroup,
} from '../types';
import {
  Warehouse,
  PlusCircle,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  History,
  X,
  Building2,
  Send,
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

export const BloodBankDashboard: React.FC = () => {
  const { user, activeOrg } = useAuth();

  const [activeTab, setActiveTab] = useState<'reserves' | 'batches' | 'hospitalRequests' | 'transactions'>('reserves');
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [hospitalRequests, setHospitalRequests] = useState<BloodRequest[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Add Receipt Form State
  const [receiptBg, setReceiptBg] = useState<BloodGroup>('O_POSITIVE');
  const [receiptUnits, setReceiptUnits] = useState<number>(5);
  const [receiptCollectionDate, setReceiptCollectionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [receiptExpiryDate, setReceiptExpiryDate] = useState<string>(
    new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [receiptDonorRef, setReceiptDonorRef] = useState<string>('DONOR-VOLUNTARY-CAMP');
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);

  // Issue Stock Form State
  const [issueBg, setIssueBg] = useState<BloodGroup>('O_POSITIVE');
  const [issueUnits, setIssueUnits] = useState<number>(1);
  const [issueHospitalId, setIssueHospitalId] = useState<string>('');
  const [issueReason, setIssueReason] = useState<string>('Emergency Trauma & Surgical Transfusion');
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invList, batchList, txList, reqList, orgList] = await Promise.all([
        api.getInventory(activeOrg?.id),
        api.getBatches(activeOrg?.id),
        api.getTransactions(activeOrg?.id),
        api.getRequests({ status: 'OPEN' }),
        api.getAllOrganizations().catch(() => []),
      ]);
      setInventory(invList);
      setBatches(batchList);
      setTransactions(txList);
      setHospitalRequests(reqList);
      setOrganizations(orgList.filter((o) => o.type === 'HOSPITAL'));
    } catch (err) {
      console.error('Error fetching blood bank dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeOrg]);

  const handleAddReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg?.id) {
      alert('Organization ID not found');
      return;
    }
    setIsSubmittingReceipt(true);
    try {
      await api.addReceipt({
        organizationId: activeOrg.id,
        bloodGroup: receiptBg,
        units: Number(receiptUnits),
        collectionDate: receiptCollectionDate,
        expiryDate: receiptExpiryDate,
        donorRef: receiptDonorRef,
      });
      setIsReceiptModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to log receipt');
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  const handleIssueStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg?.id) {
      alert('Organization ID not found');
      return;
    }
    setIsSubmittingIssue(true);
    try {
      await api.issueStock({
        organizationId: activeOrg.id,
        bloodGroup: issueBg,
        units: Number(issueUnits),
        recipientHospitalId: issueHospitalId || undefined,
        reason: issueReason,
      });
      setIsIssueModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to issue stock');
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const openIssueModalForRequest = (req: BloodRequest) => {
    setIssueBg(req.bloodGroup);
    setIssueUnits(req.unitsRequired);
    setIssueHospitalId(req.hospitalId || '');
    setIssueReason(`Fulfillment for Blood Request #${req.id.slice(0, 8)} (${req.hospitalName})`);
    setIsIssueModalOpen(true);
  };

  // KPIs
  const totalStockUnits = inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);
  const lowStockCount = inventory.filter((item) => item.unitsAvailable < 5).length;
  
  // Calculate expiring batches (< 14 days)
  const now = new Date().getTime();
  const expiringSoonCount = batches.filter((b) => {
    const diffDays = Math.ceil((new Date(b.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 14;
  }).length;

  return (
    <ClinicalAppShell
      role="BLOOD_BANK_OFFICER"
      activeTab={activeTab}
      onTabChange={(t) => setActiveTab(t as any)}
      onPrimaryAction={() => setIsReceiptModalOpen(true)}
      primaryActionLabel="Record Receipt"
      primaryActionIcon={<PlusCircle className="w-4 h-4" />}
      secondaryAction={() => setIsIssueModalOpen(true)}
      secondaryActionLabel="Issue Stock"
      secondaryActionIcon={<ArrowUpRight className="w-4 h-4 text-amber-500" />}
      title="Regional Blood Bank Logistics Desk"
      subtitle={`Active Facility: ${activeOrg ? `${activeOrg.name} (${activeOrg.city})` : 'Metropolis Central Blood Bank'} • Cold-Chain FEFO Management & Stock Ledger`}
    >
      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon red">
            <Warehouse className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalStockUnits}</div>
            <div className="stat-label">Total Units in Inventory</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{lowStockCount}</div>
            <div className="stat-label">Low Stock Blood Groups (&lt;5)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Clock className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{expiringSoonCount}</div>
            <div className="stat-label">Batches Expiring Soon (&lt;14d)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FileText className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{hospitalRequests.length}</div>
            <div className="stat-label">Active Hospital Requests</div>
          </div>
        </div>
      </div>

      {/* Tab 0: Blood Group Reserves */}
      {activeTab === 'reserves' && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Blood Group Reserves
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Real-time units across ABO and Rh groups
            </span>
          </div>

          <div className="inventory-grid">
            {BLOOD_GROUPS.map((bg) => {
              const item = inventory.find((i) => i.bloodGroup === bg.value);
              const units = item?.unitsAvailable || 0;
              const isLow = units < 5;
              const isAdequate = units >= 10;

              return (
                <div key={bg.value} className="inventory-card">
                  <div className="inventory-card-header">
                    <span className="blood-badge">{bg.label}</span>
                    <span
                      className={`badge ${
                        isLow ? 'badge-red' : isAdequate ? 'badge-green' : 'badge-amber'
                      }`}
                    >
                      {isLow ? 'Critical Low' : isAdequate ? 'Adequate' : 'Moderate'}
                    </span>
                  </div>
                  <div className="inventory-card-units">
                    {units} <span>units</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        setReceiptBg(bg.value);
                        setIsReceiptModalOpen(true);
                      }}
                    >
                      + Receipt
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        setIssueBg(bg.value);
                        setIsIssueModalOpen(true);
                      }}
                      disabled={units === 0}
                    >
                      - Issue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 1: Batch Expiry Tracker */}
      {activeTab === 'batches' && (
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <Calendar className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
              Cold-Chain Batch Monitoring
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Sorted by earliest expiry date to follow First-Expired, First-Out (FEFO) clinical standard
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Collection Date</th>
                  <th>Expiry Date</th>
                  <th>Days Remaining</th>
                  <th>Donor Reference</th>
                  <th>Batch Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                      No active blood batches recorded in inventory. Click "Record Blood Receipt" to add batches.
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => {
                    const expiryTime = new Date(batch.expiryDate).getTime();
                    const diffDays = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
                    const isExpired = diffDays <= 0;
                    const isExpiringSoon = diffDays > 0 && diffDays <= 14;

                    return (
                      <tr key={batch.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                          {batch.id.slice(0, 8)}...
                        </td>
                        <td>
                          <span className="blood-badge">{formatBloodGroup(batch.bloodGroup)}</span>
                        </td>
                        <td>
                          <strong>{batch.units}</strong> units
                        </td>
                        <td>{new Date(batch.collectionDate).toLocaleDateString()}</td>
                        <td>{new Date(batch.expiryDate).toLocaleDateString()}</td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: isExpired ? '#dc2626' : isExpiringSoon ? '#d97706' : '#059669',
                            }}
                          >
                            {isExpired ? 'EXPIRED' : `${diffDays} days`}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                          {batch.donorRef || 'N/A'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isExpired
                                ? 'badge-red'
                                : isExpiringSoon
                                ? 'badge-amber'
                                : 'badge-green'
                            }`}
                          >
                            {isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING SOON' : 'AVAILABLE'}
                          </span>
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

      {/* Tab 2: Hospital Requests Monitor */}
      {activeTab === 'hospitalRequests' && (
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <Building2 className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
              Urgent Hospital Emergency Requests
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Hospital facilities requesting blood supplies
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Hospital Facility</th>
                  <th>Blood Group</th>
                  <th>Units Needed</th>
                  <th>Urgency</th>
                  <th>Contact Person</th>
                  <th>City</th>
                  <th>Clinical Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {hospitalRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                      No active emergency hospital requests currently pending in your jurisdiction.
                    </td>
                  </tr>
                ) : (
                  hospitalRequests.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{req.hospitalName}</td>
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
                        <div>{req.contactName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{req.contactPhone}</div>
                      </td>
                      <td>{req.city}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--slate-600)', maxWidth: '200px' }}>
                        {req.notes || 'Emergency surgical reserve'}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => openIssueModalForRequest(req)}
                        >
                          <Send className="w-3.5 h-3.5" />
                          Issue Stock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Transaction Log */}
      {activeTab === 'transactions' && (
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <History className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
              Stock Movement & Dispensing Audit Trail
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Audited record of all stock receipts and hospital transfers
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Recipient / Entity</th>
                  <th>Officer</th>
                  <th>Reason / Clinical Purpose</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                      No inventory transactions logged yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            tx.transactionType === 'RECEIPT' ? 'badge-green' : 'badge-amber'
                          }`}
                        >
                          {tx.transactionType}
                        </span>
                      </td>
                      <td>
                        <span className="blood-badge">{formatBloodGroup(tx.bloodGroup)}</span>
                      </td>
                      <td>
                        <strong>{tx.units}</strong> units
                      </td>
                      <td>{tx.recipientHospital?.name || 'In-House Bank Inventory'}</td>
                      <td>{tx.performedByUser?.fullName || 'Blood Bank Officer'}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>{tx.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Record Blood Receipt */}
      {isReceiptModalOpen && (
        <div className="modal-overlay" onClick={() => setIsReceiptModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <PlusCircle className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
                Record Verified Blood Receipt (Batch)
              </div>
              <button type="button" className="modal-close" onClick={() => setIsReceiptModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReceipt}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <div className="bg-grid">
                    {BLOOD_GROUPS.map((bg) => (
                      <button
                        key={bg.value}
                        type="button"
                        className={`bg-pill ${receiptBg === bg.value ? 'selected' : ''}`}
                        onClick={() => setReceiptBg(bg.value)}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Units Received</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="form-control"
                      value={receiptUnits}
                      onChange={(e) => setReceiptUnits(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Donor Batch / Campaign Ref</label>
                    <input
                      type="text"
                      className="form-control"
                      value={receiptDonorRef}
                      onChange={(e) => setReceiptDonorRef(e.target.value)}
                      placeholder="e.g. CAMP-METRO-09"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Collection Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={receiptCollectionDate}
                      onChange={(e) => setReceiptCollectionDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date (Standard 35 Days)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={receiptExpiryDate}
                      onChange={(e) => setReceiptExpiryDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsReceiptModalOpen(false)}
                  disabled={isSubmittingReceipt}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingReceipt}>
                  {isSubmittingReceipt ? 'Recording Receipt...' : 'Record Receipt & Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Issue Blood Stock */}
      {isIssueModalOpen && (
        <div className="modal-overlay" onClick={() => setIsIssueModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <ArrowUpRight className="w-5 h-5 text-amber-600" />
                Issue Blood Stock (Hospital Transfer)
              </div>
              <button type="button" className="modal-close" onClick={() => setIsIssueModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueStock}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Blood Group to Issue</label>
                  <div className="bg-grid">
                    {BLOOD_GROUPS.map((bg) => (
                      <button
                        key={bg.value}
                        type="button"
                        className={`bg-pill ${issueBg === bg.value ? 'selected' : ''}`}
                        onClick={() => setIssueBg(bg.value)}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Units to Issue</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      className="form-control"
                      value={issueUnits}
                      onChange={(e) => setIssueUnits(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recipient Hospital Facility</label>
                    <select
                      className="form-control"
                      value={issueHospitalId}
                      onChange={(e) => setIssueHospitalId(e.target.value)}
                    >
                      <option value="">-- General Emergency Dispense --</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Dispense Reason / Clinical Request Details</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={issueReason}
                    onChange={(e) => setIssueReason(e.target.value)}
                    placeholder="e.g. Dispatched to Trauma Unit for urgent surgical cross-match"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsIssueModalOpen(false)}
                  disabled={isSubmittingIssue}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingIssue}>
                  {isSubmittingIssue ? 'Issuing Stock...' : 'Confirm Stock Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ClinicalAppShell>
  );
};
