import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Building2,
  Warehouse,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Droplet,
  ShieldCheck,
  Activity,
  FileCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  MapPin,
  User,
  ShieldAlert,
} from 'lucide-react';

interface RegisterPageProps {
  onBackToHome: () => void;
  onOpenLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onBackToHome, onOpenLogin }) => {
  const [orgType, setOrgType] = useState<'HOSPITAL' | 'BLOOD_BANK'>('HOSPITAL');
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [city, setCity] = useState('');
  const [town, setTown] = useState('');

  // Representative Credentials
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [complianceCertified, setComplianceCertified] = useState(false);

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email format regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Ethiopian Phone format: +2519, +2517, 09, 07 followed by 8 numerical digits
  const isValidEthiopianPhone = (phoneStr: string): boolean => {
    const clean = phoneStr.trim().replace(/[\s-()]/g, '');
    return /^(\+2519|\+2517|09|07)\d{8}$/.test(clean);
  };

  const validateSingleField = (name: string, val: string, currentOrgType = orgType) => {
    let err = '';
    const isHospital = currentOrgType === 'HOSPITAL';

    if (name === 'orgName') {
      if (!val.trim() || val.trim().length < 3) {
        err = `${isHospital ? 'Legal hospital name' : 'Legal blood bank name'} must be at least 3 characters.`;
      }
    } else if (name === 'orgEmail') {
      if (!val.trim()) {
        err = `${isHospital ? 'Hospital email' : 'Blood bank email'} is required.`;
      } else if (!emailRegex.test(val.trim())) {
        err = 'Please provide a valid email address (e.g. name@gmail.com).';
      }
    } else if (name === 'orgPhone') {
      if (!val.trim()) {
        err = `${isHospital ? 'Hospital telephone number' : 'Blood bank telephone number'} is required.`;
      } else if (!isValidEthiopianPhone(val)) {
        err = 'Telephone must start with +2519, +2517, 09, or 07 followed by 8 digits (e.g. +251911234567 or 0911234567).';
      }
    } else if (name === 'city') {
      if (!val.trim() || val.trim().length < 2) {
        err = `${isHospital ? 'City hospital found' : 'Blood bank city'} is required.`;
      }
    } else if (name === 'town') {
      if (!val.trim() || val.trim().length < 2) {
        err = `${isHospital ? 'Region hospital located' : 'Blood bank region'} is required.`;
      }
    } else if (name === 'repName') {
      if (!val.trim() || val.trim().length < 3) {
        err = 'Representative legal name must be at least 3 characters.';
      }
    } else if (name === 'repEmail') {
      if (!val.trim()) {
        err = 'Representative email is required.';
      } else if (!emailRegex.test(val.trim())) {
        err = 'Please enter a valid email address (e.g. name@gmail.com).';
      }
    } else if (name === 'repPhone') {
      if (!val.trim()) {
        err = 'Representative contact number is required.';
      } else if (!isValidEthiopianPhone(val)) {
        err = 'Contact number must start with +2519, +2517, 09, or 07 followed by 8 digits (e.g. +251911234567 or 0911234567).';
      }
    } else if (name === 'password') {
      if (!val) {
        err = 'Account password is required.';
      } else if (val.length < 8) {
        err = 'Password must contain at least 8 characters.';
      } else if (!/[A-Z]/.test(val)) {
        err = 'Password must include at least one uppercase letter (A-Z).';
      } else if (!/[0-9]/.test(val)) {
        err = 'Password must include at least one numerical digit (0-9).';
      }
    } else if (name === 'confirmPassword') {
      if (!val) {
        err = 'Confirm password is required.';
      } else if (val !== password) {
        err = 'Password confirmation does not match the entered password.';
      }
    }

    setErrors((prev) => {
      const copy = { ...prev };
      if (err) {
        copy[name] = err;
      } else {
        delete copy[name];
      }
      return copy;
    });
    return !err;
  };

  const markTouched = (fieldName: string, value?: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    if (value !== undefined) {
      validateSingleField(fieldName, value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const isHospital = orgType === 'HOSPITAL';

    // 1. Facility Information Validation
    if (!orgName.trim() || orgName.trim().length < 3) {
      newErrors.orgName = `${isHospital ? 'Legal hospital name' : 'Legal blood bank name'} must be at least 3 characters.`;
    }

    if (!orgEmail.trim()) {
      newErrors.orgEmail = `${isHospital ? 'Hospital email' : 'Blood bank email'} is required.`;
    } else if (!emailRegex.test(orgEmail.trim())) {
      newErrors.orgEmail = 'Please provide a valid email address (e.g. name@gmail.com).';
    }

    if (!orgPhone.trim()) {
      newErrors.orgPhone = `${isHospital ? 'Hospital telephone number' : 'Blood bank telephone number'} is required.`;
    } else if (!isValidEthiopianPhone(orgPhone)) {
      newErrors.orgPhone = 'Telephone must start with +2519, +2517, 09, or 07 followed by 8 digits (e.g. +251911234567 or 0911234567).';
    }

    if (!city.trim() || city.trim().length < 2) {
      newErrors.city = `${isHospital ? 'City hospital found' : 'Blood bank city'} is required.`;
    }

    if (!town.trim() || town.trim().length < 2) {
      newErrors.town = `${isHospital ? 'Region hospital located' : 'Blood bank region'} is required.`;
    }

    // 2. Representative Credentials Validation
    if (!repName.trim() || repName.trim().length < 3) {
      newErrors.repName = 'Representative legal name must be at least 3 characters.';
    }

    if (!repEmail.trim()) {
      newErrors.repEmail = 'Representative email is required.';
    } else if (!emailRegex.test(repEmail.trim())) {
      newErrors.repEmail = 'Please enter a valid email address (e.g. name@gmail.com).';
    }

    if (!repPhone.trim()) {
      newErrors.repPhone = 'Representative contact number is required.';
    } else if (!isValidEthiopianPhone(repPhone)) {
      newErrors.repPhone = 'Contact number must start with +2519, +2517, 09, or 07 followed by 8 digits (e.g. +251911234567 or 0911234567).';
    }

    // Password Validation (8+ chars, upper, lower, number)
    if (!password) {
      newErrors.password = 'Account password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must contain at least 8 characters.';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must include at least one uppercase letter (A-Z).';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must include at least one numerical digit (0-9).';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation does not match the entered password.';
    }

    // 3. Compliance Acceptance
    if (!complianceCertified) {
      newErrors.compliance = 'Please agree to the terms and policy of the system to proceed.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    if (!password) return { label: 'Not Entered', color: 'var(--slate-300)', width: '0%' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (score === 2) return { label: 'Moderate', color: '#f59e0b', width: '50%' };
    if (score === 3) return { label: 'Strong', color: '#0284c7', width: '75%' };
    return { label: 'Very Strong', color: '#10b981', width: '100%' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Mark all as touched
    const allTouched: Record<string, boolean> = {
      orgName: true,
      orgEmail: true,
      orgPhone: true,
      city: true,
      town: true,
      repName: true,
      repEmail: true,
      repPhone: true,
      password: true,
      confirmPassword: true,
      compliance: true,
    };
    setTouched(allTouched);

    if (!validateForm()) {
      setErrorMessage('Please review the form. Several required fields require your attention.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.registerOrganization({
        orgType,
        orgName: orgName.trim(),
        orgEmail: orgEmail.trim(),
        orgPhone: orgPhone.trim(),
        city: city.trim(),
        town: town.trim(),
        address: city.trim() + (town.trim() ? ', ' + town.trim() : ' Medical Campus'),
        repName: repName.trim(),
        repEmail: repEmail.trim(),
        repPhone: repPhone.trim(),
        password,
        licenseNo: orgType === 'BLOOD_BANK' ? 'LIC-BB-' + Math.floor(10000 + Math.random() * 90000) : undefined,
        department: orgType === 'HOSPITAL' ? 'Clinical Transfusion & Critical Care' : undefined,
      });

      setSuccessMessage(
        response.message || 'Institutional registration application submitted successfully.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Application submission failed. Please verify credentials and network status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pwdStrength = getPasswordStrength();

  return (
    <div className="auth-page-wrapper">
      <div className="auth-page-glow top-left" />
      <div className="auth-page-glow bottom-right" />

      <div className="auth-container" style={{ maxWidth: '860px' }}>
        {/* Navigation Bar */}
        <div className="auth-nav">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onBackToHome}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="auth-nav-brand" onClick={onBackToHome} style={{ cursor: 'pointer' }}>
            <div className="brand-icon small">
              <img src="/blood-drop-logo.png" alt="LifeFlow Logo" className="brand-logo-img" />
            </div>
            <span className="brand-title" style={{ fontSize: '1.05rem' }}>
              LifeFlow <span style={{ color: 'var(--primary)' }}>Clinical</span>
            </span>
          </div>
        </div>

        <div className="auth-card-single">
          <div className="auth-header" style={{ marginBottom: '1.75rem' }}>
            <div className="auth-icon-badge">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="auth-title">Healthcare Facility Onboarding</h1>
            <p className="auth-subtitle">
              Apply for institutional network access as an accredited Hospital or certified Blood Bank.
            </p>
          </div>

          {successMessage ? (
            <div className="register-success-box">
              <div className="success-icon-wrapper">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2>Application Successfully Recorded</h2>
              <p>
                Your facility accreditation application has been received and securely stored. 
                Following administrative verification of clinical credentials, your designated representative account will receive operational workspace activation.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={onOpenLogin}
                style={{ marginTop: '1rem' }}
              >
                Proceed to Institutional Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {errorMessage && (
                <div className="auth-error-banner">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Facility Classification Choice */}
              <div className="form-group">
                <label className="form-label">Facility Legal Classification</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <button
                    type="button"
                    className={`btn ${orgType === 'HOSPITAL' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', padding: '0.9rem', fontWeight: 700 }}
                    onClick={() => {
                      setOrgType('HOSPITAL');
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.licenseNo;
                        return copy;
                      });
                    }}
                  >
                    <Building2 className="w-4 h-4" />
                    Hospital Facility
                  </button>
                  <button
                    type="button"
                    className={`btn ${orgType === 'BLOOD_BANK' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', padding: '0.9rem', fontWeight: 700 }}
                    onClick={() => {
                      setOrgType('BLOOD_BANK');
                      setErrors({});
                    }}
                  >
                    <Warehouse className="w-4 h-4" />
                    Blood Bank Facility
                  </button>
                </div>
              </div>

              {/* SECTION 1: Institutional Profile */}
              <div style={{ margin: '1rem 0 0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-500)' }}>
                  1. Institutional Information
                </span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-org-name">
                    {orgType === 'HOSPITAL' ? 'Legal Hospital Name *' : 'Legal Blood Bank Name *'}
                  </label>
                  <div className="input-with-icon">
                    <Building2 className="input-icon" />
                    <input
                      id="reg-org-name"
                      type="text"
                      className={`form-control ${touched.orgName && errors.orgName ? 'input-error' : ''}`}
                      placeholder={orgType === 'HOSPITAL' ? 'e.g. City General Hospital' : 'e.g. Red Cross Blood Bank'}
                      value={orgName}
                      onChange={(e) => {
                        setOrgName(e.target.value);
                        if (touched.orgName) validateSingleField('orgName', e.target.value);
                      }}
                      onBlur={() => markTouched('orgName', orgName)}
                      required
                    />
                  </div>
                  {touched.orgName && errors.orgName && (
                    <span className="field-error-text">{errors.orgName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-org-email">
                    {orgType === 'HOSPITAL' ? 'Hospital Email *' : 'Blood Bank Email *'}
                  </label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" />
                    <input
                      id="reg-org-email"
                      type="email"
                      className={`form-control ${touched.orgEmail && errors.orgEmail ? 'input-error' : ''}`}
                      placeholder="name@gmail.com"
                      value={orgEmail}
                      onChange={(e) => {
                        setOrgEmail(e.target.value);
                        if (touched.orgEmail) validateSingleField('orgEmail', e.target.value);
                      }}
                      onBlur={() => markTouched('orgEmail', orgEmail)}
                      required
                    />
                  </div>
                  {touched.orgEmail && errors.orgEmail && (
                    <span className="field-error-text">{errors.orgEmail}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-org-phone">
                    {orgType === 'HOSPITAL' ? 'Hospital Telephone Number *' : 'Blood Bank Telephone Number *'}
                  </label>
                  <div className="input-with-icon">
                    <Phone className="input-icon" />
                    <input
                      id="reg-org-phone"
                      type="tel"
                      className={`form-control ${touched.orgPhone && errors.orgPhone ? 'input-error' : ''}`}
                      placeholder="e.g. +251911234567 or 0911234567"
                      value={orgPhone}
                      onChange={(e) => {
                        setOrgPhone(e.target.value);
                        if (touched.orgPhone) validateSingleField('orgPhone', e.target.value);
                      }}
                      onBlur={() => markTouched('orgPhone', orgPhone)}
                      required
                    />
                  </div>
                  {touched.orgPhone && errors.orgPhone && (
                    <span className="field-error-text">{errors.orgPhone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-city">
                    {orgType === 'HOSPITAL' ? 'City Hospital Found *' : 'Blood Bank City *'}
                  </label>
                  <div className="input-with-icon">
                    <MapPin className="input-icon" />
                    <input
                      id="reg-city"
                      type="text"
                      className={`form-control ${touched.city && errors.city ? 'input-error' : ''}`}
                      placeholder="e.g. Addis Ababa"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (touched.city) validateSingleField('city', e.target.value);
                      }}
                      onBlur={() => markTouched('city', city)}
                      required
                    />
                  </div>
                  {touched.city && errors.city && (
                    <span className="field-error-text">{errors.city}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-town">
                    {orgType === 'HOSPITAL' ? 'Region Hospital Located *' : 'Blood Bank Region *'}
                  </label>
                  <input
                    id="reg-town"
                    type="text"
                    className={`form-control ${touched.town && errors.town ? 'input-error' : ''}`}
                    placeholder="e.g. Oromia Region"
                    value={town}
                    onChange={(e) => {
                      setTown(e.target.value);
                      if (touched.town) validateSingleField('town', e.target.value);
                    }}
                    onBlur={() => markTouched('town', town)}
                    required
                  />
                  {touched.town && errors.town && (
                    <span className="field-error-text">{errors.town}</span>
                  )}
                </div>
              </div>

              {/* SECTION 2: Designated Representative Account */}
              <div style={{ borderTop: '1px solid var(--slate-200)', margin: '1.75rem 0 0.5rem', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-500)' }}>
                  2. Designated Clinical Representative Account
                </span>
                <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  This representative will serve as the primary administrator with operational access to the facility dashboard.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-rep-name">
                    Representative Full Legal Name *
                  </label>
                  <div className="input-with-icon">
                    <User className="input-icon" />
                    <input
                      id="reg-rep-name"
                      type="text"
                      className={`form-control ${touched.repName && errors.repName ? 'input-error' : ''}`}
                      placeholder="Dr. Alexander Wright, MD"
                      value={repName}
                      onChange={(e) => {
                        setRepName(e.target.value);
                        if (touched.repName) validateSingleField('repName', e.target.value);
                      }}
                      onBlur={() => markTouched('repName', repName)}
                      required
                    />
                  </div>
                  {touched.repName && errors.repName && (
                    <span className="field-error-text">{errors.repName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-rep-email">
                    Representative Professional Email *
                  </label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" />
                    <input
                      id="reg-rep-email"
                      type="email"
                      className={`form-control ${touched.repEmail && errors.repEmail ? 'input-error' : ''}`}
                      placeholder="name@gmail.com"
                      value={repEmail}
                      onChange={(e) => {
                        setRepEmail(e.target.value);
                        if (touched.repEmail) validateSingleField('repEmail', e.target.value);
                      }}
                      onBlur={() => markTouched('repEmail', repEmail)}
                      required
                    />
                  </div>
                  {touched.repEmail && errors.repEmail && (
                    <span className="field-error-text">{errors.repEmail}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-rep-phone">
                  Representative Contact Number *
                </label>
                <div className="input-with-icon">
                  <Phone className="input-icon" />
                  <input
                    id="reg-rep-phone"
                    type="tel"
                    className={`form-control ${touched.repPhone && errors.repPhone ? 'input-error' : ''}`}
                    placeholder="e.g. +251911234567 or 0911234567"
                    value={repPhone}
                    onChange={(e) => {
                      setRepPhone(e.target.value);
                      if (touched.repPhone) validateSingleField('repPhone', e.target.value);
                    }}
                    onBlur={() => markTouched('repPhone', repPhone)}
                    required
                  />
                </div>
                {touched.repPhone && errors.repPhone && (
                  <span className="field-error-text">{errors.repPhone}</span>
                )}
              </div>

              {/* Password and Confirmation */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">
                    Account Password *
                  </label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control ${touched.password && errors.password ? 'input-error' : ''}`}
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (touched.password) validateSingleField('password', e.target.value);
                        if (touched.confirmPassword && confirmPassword) {
                          if (confirmPassword !== e.target.value) {
                            setErrors((p) => ({ ...p, confirmPassword: 'Password confirmation does not match the entered password.' }));
                          } else {
                            setErrors((p) => { const c = { ...p }; delete c.confirmPassword; return c; });
                          }
                        }
                      }}
                      onBlur={() => markTouched('password', password)}
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
                  {touched.password && errors.password && (
                    <span className="field-error-text">{errors.password}</span>
                  )}

                  {/* Password Strength Indicator */}
                  {password && (
                    <div style={{ marginTop: '0.45rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--slate-500)', marginBottom: '0.2rem' }}>
                        <span>Password Strength:</span>
                        <strong style={{ color: pwdStrength.color }}>{pwdStrength.label}</strong>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'var(--slate-200)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: pwdStrength.width, height: '100%', background: pwdStrength.color, transition: 'all 0.25s ease' }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-confirm-password">
                    Confirm Password *
                  </label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" />
                    <input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (touched.confirmPassword) validateSingleField('confirmPassword', e.target.value);
                      }}
                      onBlur={() => markTouched('confirmPassword', confirmPassword)}
                      required
                    />
                    <button
                      type="button"
                      className="input-action-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <span className="field-error-text">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              {/* Terms and Policy Acceptance */}
              <div
                style={{
                  background: 'var(--slate-50)',
                  border: touched.compliance && errors.compliance ? '1px solid var(--danger)' : '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginTop: '1rem',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={complianceCertified}
                    onChange={(e) => {
                      setComplianceCertified(e.target.checked);
                      if (e.target.checked) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.compliance;
                          return copy;
                        });
                      }
                    }}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <div style={{ fontSize: '0.875rem', color: 'var(--slate-700)', fontWeight: 500, lineHeight: 1.5 }}>
                    I agree to the terms and policy of the system
                  </div>
                </label>
                {touched.compliance && errors.compliance && (
                  <div className="field-error-text" style={{ marginTop: '0.5rem', marginLeft: '1.75rem' }}>
                    {errors.compliance}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onBackToHome} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ padding: '0.85rem 1.75rem' }}>
                  {isSubmitting ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      Submitting Registration Enquiry...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      Submit Registration Enquiry
                    </>
                  )}
                </button>
              </div>

              <div className="auth-switch-prompt" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <span>Already possess verified clinical credentials?</span>{' '}
                <button type="button" className="auth-link-btn" onClick={onOpenLogin}>
                  Sign In to Workspace
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
