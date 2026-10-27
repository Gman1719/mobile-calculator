import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Building2, Warehouse, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface RegisterOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const RegisterOrgModal: React.FC<RegisterOrgModalProps> = ({ isOpen, onClose, onOpenLogin }) => {
  const [orgType, setOrgType] = useState<'HOSPITAL' | 'BLOOD_BANK'>('HOSPITAL');
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('+1555');
  const [city, setCity] = useState('Metropolis');
  const [town, setTown] = useState('Downtown');
  const [address, setAddress] = useState('');
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPhone, setRepPhone] = useState('+1555');
  const [password, setPassword] = useState('Password123!');
  const [licenseNo, setLicenseNo] = useState('');
  const [department, setDepartment] = useState('Emergency / Blood Transfusion');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await api.registerOrganization({
        orgType,
        orgName,
        orgEmail,
        orgPhone,
        city,
        town,
        address,
        repName,
        repEmail,
        repPhone,
        password,
        licenseNo: orgType === 'BLOOD_BANK' ? licenseNo || 'LIC-BB-' + Math.floor(1000 + Math.random() * 9000) : undefined,
        department: orgType === 'HOSPITAL' ? department : undefined,
      });

      setSuccessMessage(
        response.message || 'Registration submitted! Your organization account is now pending Administrator approval.'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Building2 className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
            Register Clinical Organization
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          {successMessage ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                Registration Submitted Successfully
              </h2>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
                Your organization registration application has been submitted successfully.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              {errorMessage && (
                <div
                  style={{
                    background: 'var(--danger-light)',
                    border: '1px solid var(--danger-border)',
                    color: '#b91c1c',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Organization Type Choice */}
              <div className="form-group">
                <label className="form-label">Organization Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className={`btn ${orgType === 'HOSPITAL' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center' }}
                    onClick={() => setOrgType('HOSPITAL')}
                  >
                    <Building2 className="w-4 h-4" />
                    Hospital Facility
                  </button>
                  <button
                    type="button"
                    className={`btn ${orgType === 'BLOOD_BANK' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center' }}
                    onClick={() => setOrgType('BLOOD_BANK')}
                  >
                    <Warehouse className="w-4 h-4" />
                    Blood Bank Facility
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Facility / Organization Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. St. Jude Regional Hospital"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Org Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. contact@stjude.org"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 555-0199"
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Metropolis"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Town / District</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Downtown"
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Physical Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 742 Evergreen Terrace"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--slate-200)', margin: '1.25rem 0 1rem', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '0.75rem' }}>
                  Primary Officer / Representative Account
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Representative Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dr. John Doe"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Representative Email (Login)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="johndoe@gmail.com"
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Representative Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 555-0188"
                    value={repPhone}
                    onChange={(e) => setRepPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Login Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {orgType === 'BLOOD_BANK' ? (
                <div className="form-group">
                  <label className="form-label">Blood Bank Officer License Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. LIC-BB-88392"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Clinical Department</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Emergency & Surgery"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting Application...' : 'Submit Registration Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
