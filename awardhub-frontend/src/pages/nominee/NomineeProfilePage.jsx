import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  Trophy,
  Users,
  FileText,
  Calendar,
  Shield,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Upload,
  Trash2,
  Download,
  Info,
  Award,
  Image,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { profilesApi } from '../../api/profiles';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  NomineeDocumentType,
  NOMINEE_DOCUMENT_LABELS,
  NOMINEE_DOCUMENT_OPTIONS,
  documentValidationContext,
} from '../../strategy';

const DOCUMENT_TYPE_META = {
  [NomineeDocumentType.CV]: {
    icon: FileText,
    hint: 'Text documents only (PDF, DOC, DOCX). Image files (.png, .jpg) are prohibited.',
    badgeColor: '#3b82f6',
  },
  [NomineeDocumentType.NIC_PASSPORT_COPY]: {
    icon: Shield,
    hint: 'Official national ID or passport scan/photo (PDF, JPG, PNG). Max 5MB.',
    badgeColor: '#8b5cf6',
  },
  [NomineeDocumentType.CERTIFICATE]: {
    icon: Award,
    hint: 'Official degree, award, or course certificate scan (PDF, JPG, PNG). Max 10MB.',
    badgeColor: '#10b981',
  },
  [NomineeDocumentType.ACHIEVEMENT_PROOF]: {
    icon: FileCheck,
    hint: 'Evidence, publication, or contest achievement verification (PDF, JPG, PNG). Max 10MB.',
    badgeColor: '#f59e0b',
  },
  [NomineeDocumentType.PROFILE_PHOTO]: {
    icon: Image,
    hint: 'High-resolution headshot photograph (JPG, PNG). PDFs are prohibited. Max 2MB.',
    badgeColor: '#ec4899',
  },
  [NomineeDocumentType.OTHER]: {
    icon: FileText,
    hint: 'General supporting documentation (PDF, DOC, DOCX, JPG, PNG). Max 10MB.',
    badgeColor: '#6b7280',
  },
};

const INITIAL_PROFILE = {
  fullName: '',
  email: '',
  contactNumber: '',
  website: '',
  nicPassport: '',
  dateOfBirth: '',
  gender: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  organization: '',
  jobTitle: '',
  biography: '',
  education: '',
  achievements: '',
  references: '',
  accountStatus: '',
};

export default function NomineeProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [initialData, setInitialData] = useState(INITIAL_PROFILE);
  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(NomineeDocumentType.CV);
  const fileInputRef = useRef(null);

  // Maximum allowed date of birth (must be at least 18 years ago from today)
  const maxDobString = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async (explicitFullName) => {
    setLoading(true);
    try {
      const res = await profilesApi.getMyProfile();
      // Handle ApiResponse envelope { success: true, data: { ... } }
      const data = res?.data || res;
      let authUser = user;
      if (!authUser?.fullName) {
        authUser = await authApi.getMe().catch(() => null);
      }
      const resolvedFullName =
        explicitFullName ||
        data?.fullName ||
        authUser?.fullName ||
        user?.fullName ||
        '';

      if (data) {
        const loaded = {
          fullName: resolvedFullName,
          email: data.email || authUser?.email || user?.email || '',
          contactNumber: data.contactNumber || '',
          website: data.website || authUser?.website || '',
          nicPassport: data.nicPassport || authUser?.nic || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip || '',
          organization: data.organization || '',
          jobTitle: data.jobTitle || '',
          biography: data.biography || data.bio || authUser?.bio || '',
          education: data.education || '',
          achievements: data.achievements || '',
          references: data.references || '',
          accountStatus: data.accountStatus || 'ACTIVE',
        };
        setProfile(loaded);
        setInitialData(loaded);
      }

      const docsRes = await profilesApi.getMyDocuments();
      const docsList = Array.isArray(docsRes)
        ? docsRes
        : Array.isArray(docsRes?.data)
        ? docsRes.data
        : [];
      setDocuments(docsList);
    } catch (err) {
      console.warn('Profile fetch note:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value || value.trim().length < 2) {
          return 'Full legal name is required (minimum 2 characters)';
        }
        if (value.length > 100) {
          return 'Full name must not exceed 100 characters';
        }
        return '';

      case 'nicPassport':
        if (value && value.trim()) {
          const val = value.trim();
          // Validates 5-20 characters: letters, numbers, hyphens (supports LK 9-digit+V/X, 12-digit, passports, NIC-XXX-XXX)
          if (!/^[A-Za-z0-9\-]{5,20}$/.test(val)) {
            return 'Invalid NIC/Passport. Must be 5-20 alphanumeric characters or hyphens (e.g. 198812345678, 123456789V, or NIC-NOM-005)';
          }
        }
        return '';

      case 'dateOfBirth':
        if (value) {
          const dob = new Date(value);
          const today = new Date();
          if (isNaN(dob.getTime())) {
            return 'Invalid date format';
          }
          if (dob >= today) {
            return 'Date of birth must be a past date';
          }
          const age = calculateAge(value);
          if (age !== null && age < 18) {
            return 'Candidate must be at least 18 years of age';
          }
          if (age !== null && age > 120) {
            return 'Please enter a valid date of birth';
          }
        }
        return '';

      case 'contactNumber':
        if (value && value.trim()) {
          if (!/^[0-9+()\-\s]{7,20}$/.test(value.trim())) {
            return 'Invalid phone format (7-20 digits with optional +, -, ())';
          }
        }
        return '';

      case 'website':
        if (value && value.trim()) {
          if (!/^https?:\/\/.+\..+/i.test(value.trim())) {
            return 'Website must be a valid URL starting with http:// or https://';
          }
        }
        return '';

      case 'zip':
        if (value && value.trim().length > 20) {
          return 'Postal code must not exceed 20 characters';
        }
        return '';

      default:
        return '';
    }
  };

  const handleInputChange = (field, val) => {
    setProfile((prev) => ({ ...prev, [field]: val }));
    const errorMsg = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const validateAll = () => {
    const newErrors = {};
    const fieldsToValidate = ['fullName', 'nicPassport', 'dateOfBirth', 'contactNumber', 'website', 'zip'];
    fieldsToValidate.forEach((f) => {
      const err = validateField(f, profile[f]);
      if (err) newErrors[f] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('Please resolve the validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: profile.fullName?.trim() || null,
        website: profile.website?.trim() || null,
        contactNumber: profile.contactNumber?.trim() || null,
        nicPassport: profile.nicPassport?.trim() || null,
        dateOfBirth: profile.dateOfBirth?.trim() || null,
        gender: profile.gender || null,
        street: profile.street?.trim() || null,
        city: profile.city?.trim() || null,
        state: profile.state?.trim() || null,
        zip: profile.zip?.trim() || null,
        organization: profile.organization?.trim() || null,
        jobTitle: profile.jobTitle?.trim() || null,
        biography: profile.biography?.trim() || null,
        education: profile.education?.trim() || null,
        achievements: profile.achievements?.trim() || null,
        references: profile.references?.trim() || null,
      };

      await profilesApi.updateMyProfile(payload);
      if (payload.fullName) {
        await authApi.updateProfile({ name: payload.fullName, website: payload.website }).catch(() => null);
        if (refreshUser) {
          await refreshUser();
        }
      }
      toast.success('Candidate profile dossier updated successfully!');
      setErrors({});
      await loadProfile(payload.fullName);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile dossier');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProfile(initialData);
    setErrors({});
    toast('Profile reset to last saved state', { icon: '🔄' });
  };

  const activeStrategy = documentValidationContext.getStrategy(selectedDocType);
  const activeMeta = DOCUMENT_TYPE_META[selectedDocType] || DOCUMENT_TYPE_META[NomineeDocumentType.OTHER];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strategy Pattern: validate client-side first
    const validation = documentValidationContext.validate(selectedDocType, file);
    if (!validation.valid) {
      toast.error(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', selectedDocType);

    setUploading(true);
    try {
      await profilesApi.uploadDocument(formData);
      toast.success(`${NOMINEE_DOCUMENT_LABELS[selectedDocType]} uploaded successfully!`);
      const docsRes = await profilesApi.getMyDocuments();
      const docsList = Array.isArray(docsRes)
        ? docsRes
        : Array.isArray(docsRes?.data)
        ? docsRes.data
        : [];
      setDocuments(docsList);
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (id) => {
    try {
      await profilesApi.deleteDocument(id);
      toast.success('Document deleted');
      setDocuments((prev) => prev.filter((d) => (d.documentId || d.id) !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  const handleDownloadDoc = async (doc) => {
    const docId = doc.documentId || doc.id;
    const docName = doc.originalFileName || doc.fileName || `document-${docId}`;
    setDownloadingId(docId);
    try {
      await profilesApi.downloadDocument(docId, docName);
      toast.success('Download started');
    } catch (err) {
      toast.error(err.message || 'Failed to download document');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return 'Verified file';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const calculatedAge = calculateAge(profile.dateOfBirth);

  if (loading) {
    return <LoadingSpinner message="Loading nominee profile dossier..." />;
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Dossier Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(30, 41, 59, 0.6) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
            }}
          >
            {profile.fullName || user?.fullName
              ? (profile.fullName || user?.fullName)
                  .split(' ')
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'NO'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {profile.fullName || user?.fullName || 'Nominee Profile Dossier'}
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                {profile.accountStatus || 'ACTIVE'}
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {profile.jobTitle && profile.organization
                ? `${profile.jobTitle} at ${profile.organization}`
                : profile.organization || 'Official Nominee Candidate Dossier'}
              {profile.email && ` &bull; ${profile.email}`}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* SECTION 1: Personal & Legal Identity */}
        <Card
          title="1. Personal & Legal Identity"
          subtitle="Official legal identity and demographic verification parameters"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <User size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Full Name / Legal Identity</span>
                <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="e.g. Dr. Alex Rivera"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${errors.fullName ? '#ef4444' : 'var(--border-color)'}`,
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              {errors.fullName && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                  <AlertCircle size={13} /> {errors.fullName}
                </span>
              )}
            </div>

            {/* NIC / Passport */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Shield size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>National ID / Passport Number</span>
              </label>
              <input
                type="text"
                value={profile.nicPassport}
                onChange={(e) => handleInputChange('nicPassport', e.target.value)}
                placeholder="e.g. 198804120000 or NIC-NOM-005"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${errors.nicPassport ? '#ef4444' : 'var(--border-color)'}`,
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              {errors.nicPassport ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                  <AlertCircle size={13} /> {errors.nicPassport}
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Format: 9 digits+V/X, 12 digits, Passport or NIC-XXX-XXX
                </span>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <Calendar size={15} style={{ color: 'var(--accent-primary)' }} />
                  <span>Date of Birth</span>
                </label>
                {calculatedAge !== null && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.5rem',
                      borderRadius: '10px',
                      background: calculatedAge >= 18 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: calculatedAge >= 18 ? '#34d399' : '#f87171',
                      fontWeight: 600,
                    }}
                  >
                    Age: {calculatedAge} {calculatedAge >= 18 ? '✓' : '(Under 18)'}
                  </span>
                )}
              </div>
              <input
                type="date"
                max={maxDobString}
                value={profile.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${errors.dateOfBirth ? '#ef4444' : 'var(--border-color)'}`,
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              {errors.dateOfBirth ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                  <AlertCircle size={13} /> {errors.dateOfBirth}
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Must be at least 18 years old
                </span>
              )}
            </div>

            {/* Gender */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Gender
              </label>
              <select
                value={profile.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </Card>

        {/* SECTION 2: Contact Information & Residential Address */}
        <Card
          title="2. Contact Details & Residential Address"
          subtitle="Official correspondence coordinates for awards notifications and verification"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {/* Contact Phone */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  <Phone size={15} style={{ color: 'var(--accent-primary)' }} />
                  <span>Contact Phone Number</span>
                </label>
                <input
                  type="text"
                  value={profile.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="e.g. +1-555-0104"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${errors.contactNumber ? '#ef4444' : 'var(--border-color)'}`,
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                {errors.contactNumber && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                    <AlertCircle size={13} /> {errors.contactNumber}
                  </span>
                )}
              </div>

              {/* Email (Readonly) */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  <Mail size={15} style={{ color: 'var(--accent-primary)' }} />
                  <span>Registered Account Email</span>
                </label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    cursor: 'not-allowed',
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Managed via account security credentials
                </span>
              </div>
            </div>

            {/* Address Composite Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  <MapPin size={15} style={{ color: 'var(--accent-primary)' }} />
                  <span>Street Address</span>
                </label>
                <input
                  type="text"
                  value={profile.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="e.g. 450 Innovation Way"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  City
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Austin"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  State / Province
                </label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="TX"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Zip / Postal Code
                </label>
                <input
                  type="text"
                  value={profile.zip}
                  onChange={(e) => handleInputChange('zip', e.target.value)}
                  placeholder="78701"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${errors.zip ? '#ef4444' : 'var(--border-color)'}`,
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                {errors.zip && (
                  <span style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.zip}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 3: Professional Affiliation & Online Presence */}
        <Card
          title="3. Professional Affiliation & Online Presence"
          subtitle="Institutional details, designation, and public verification links"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Organization */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Building size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Primary Organization / Institution</span>
              </label>
              <input
                type="text"
                value={profile.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                placeholder="NeuralFlow AI"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Job Title */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Briefcase size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Current Designation / Job Title</span>
              </label>
              <input
                type="text"
                value={profile.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="Chief Architect"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Official Website */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Globe size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Official Website / Portfolio Link</span>
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://neuralflow.io"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${errors.website ? '#ef4444' : 'var(--border-color)'}`,
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              {errors.website ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                  <AlertCircle size={13} /> {errors.website}
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Must start with http:// or https://
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* SECTION 4: Academic Background & Candidacy Dossier */}
        <Card
          title="4. Academic Qualifications, Honors & Dossier Summary"
          subtitle="Education, career milestones, awards, references and narrative summary"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Education */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <GraduationCap size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Education & Academic Credentials</span>
              </label>
              <textarea
                rows={3}
                value={profile.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="e.g. M.S. in Computer Science (Stanford University); B.S. in Mathematics (UC Berkeley)"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Achievements */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Trophy size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Key Achievements, Honors & Awards</span>
              </label>
              <textarea
                rows={3}
                value={profile.achievements}
                onChange={(e) => handleInputChange('achievements', e.target.value)}
                placeholder="e.g. Published 8 papers in NeurIPS; Recipient of 2024 AI Pioneer Award"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* References */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Users size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Professional References & Endorsements</span>
              </label>
              <textarea
                rows={2}
                value={profile.references}
                onChange={(e) => handleInputChange('references', e.target.value)}
                placeholder="e.g. Dr. Marcus Miller (MIT), Dr. Susan Lee (Stanford University)"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Biography */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <FileText size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Biography & Candidate Executive Summary</span>
              </label>
              <textarea
                rows={4}
                value={profile.biography}
                onChange={(e) => handleInputChange('biography', e.target.value)}
                placeholder="Executive biography highlighting leadership, career highlights, and impact on the nomination field..."
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <Button type="button" variant="outline" icon={RotateCcw} onClick={handleReset} disabled={saving}>
              Reset Values
            </Button>
            <Button type="submit" variant="primary" icon={Save} loading={saving}>
              Save Dossier Changes
            </Button>
          </div>
        </Card>
      </form>

      {/* SECTION 5: Supporting Documentation & Evidence Dossier (Strategy Pattern) */}
      <Card
        title="Supporting Documentation & Evidence Dossier"
        subtitle="Each document category validates and enforces dedicated type and size constraints via the Strategy Pattern"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Document Type Selector (Strategy Selection) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.6rem' }}>
              Select Document Category to Upload:
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                gap: '0.6rem',
              }}
            >
              {NOMINEE_DOCUMENT_OPTIONS.map((opt) => {
                const isSelected = selectedDocType === opt.value;
                const meta = DOCUMENT_TYPE_META[opt.value];
                const IconComponent = meta?.icon || FileText;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedDocType(opt.value)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.85rem 0.6rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? '2px solid var(--accent-primary)'
                        : '1px solid var(--border-color)',
                      background: isSelected
                        ? 'rgba(217, 119, 6, 0.12)'
                        : 'var(--bg-tertiary)',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    <IconComponent size={20} color={isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Strategy Rules Indicator */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <Info size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  Enforced Strategy: {activeStrategy.label}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    fontWeight: 600,
                  }}
                >
                  Allowed: {activeStrategy.getAllowedExtensionsFormatted()}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    fontWeight: 600,
                  }}
                >
                  Max size: {activeStrategy.getMaxSizeMB()}MB
                </span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                {activeMeta.hint}
              </p>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-tertiary)',
            }}
          >
            <Upload size={32} style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem' }} />
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>
              Upload {activeStrategy.label}
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Accepted formats: {activeStrategy.getAllowedExtensionsFormatted()} &bull; Max size: {activeStrategy.getMaxSizeMB()}MB
            </p>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--accent-primary)',
                color: 'var(--text-on-accent)',
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                opacity: uploading ? 0.7 : 1,
              }}
            >
              <span>{uploading ? 'Validating & Uploading...' : `Browse ${activeStrategy.label}`}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept={activeStrategy.getAcceptAttribute()}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Uploaded Documents List */}
          {documents.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                Uploaded Documents ({documents.length})
              </h4>
              {documents.map((doc) => {
                const docId = doc.documentId || doc.id;
                const docTypeKey = doc.documentType;
                const typeLabel = NOMINEE_DOCUMENT_LABELS[docTypeKey] || docTypeKey || 'Document';
                const meta = DOCUMENT_TYPE_META[docTypeKey] || DOCUMENT_TYPE_META[NomineeDocumentType.OTHER];
                const IconComponent = meta?.icon || FileText;

                return (
                  <div
                    key={docId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 200 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-sm)',
                          background: `${meta.badgeColor}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconComponent size={20} color={meta.badgeColor} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              maxWidth: 320,
                            }}
                          >
                            {doc.originalFileName || doc.fileName || doc.documentName || `Document #${docId}`}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.1rem 0.5rem',
                              borderRadius: '4px',
                              background: `${meta.badgeColor}25`,
                              color: meta.badgeColor,
                              fontWeight: 600,
                            }}
                          >
                            {typeLabel}
                          </span>
                          {doc.verificationStatus && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.5rem',
                                borderRadius: '4px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                fontWeight: 500,
                              }}
                            >
                              {doc.verificationStatus}
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.15rem',
                          }}
                        >
                          {formatFileSize(doc.size || doc.fileSize)}
                          {doc.uploadDate ? ` &bull; Uploaded ${new Date(doc.uploadDate).toLocaleDateString()}` : ''}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Download}
                        loading={downloadingId === docId}
                        onClick={() => handleDownloadDoc(doc)}
                      >
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Trash2}
                        onClick={() => handleDeleteDoc(docId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
