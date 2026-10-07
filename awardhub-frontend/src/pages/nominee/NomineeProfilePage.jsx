import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Building,
  FileText,
  Upload,
  Save,
  CheckCircle,
  Trash2,
  Download,
  AlertCircle,
  Shield,
  Award,
  Image,
  FileCheck,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { profilesApi } from '../../api/profiles';
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

export default function NomineeProfilePage() {
  const [profile, setProfile] = useState({
    fullName: '',
    organization: '',
    bio: '',
    contactEmail: '',
    website: '',
    phone: '',
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(NomineeDocumentType.CV);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await profilesApi.getMyProfile();
      if (data) {
        setProfile({
          fullName: data.fullName || '',
          organization: data.organization || '',
          bio: data.bio || '',
          contactEmail: data.contactEmail || '',
          website: data.website || '',
          phone: data.phone || '',
        });
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profilesApi.updateMyProfile(profile);
      toast.success('Profile credentials updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return <LoadingSpinner message="Loading nominee profile dossier..." />;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Nominee Profile Dossier</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Maintain verified credentials, biography, and supporting documents attached to your nominations
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card title="Candidate Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Full Name / Legal Identity
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Dr. Jane Smith"
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
                  Primary Organization / Affiliation
                </label>
                <input
                  type="text"
                  value={profile.organization}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  placeholder="Apex Technologies Institute"
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Public Contact Email
                </label>
                <input
                  type="email"
                  value={profile.contactEmail}
                  onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                  placeholder="nominee@institution.org"
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
                  Official Website / Portfolio Link
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://research.org/candidate"
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
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Biography & Candidate Summary
              </label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Detailed career history, significant awards, academic background, or executive summary..."
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

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary" icon={Save} loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </form>

      {/* Supporting Documents Section with Strategy Pattern */}
      <Card
        title="Supporting Documentation & Evidence Dossier"
        subtitle="Each document type enforces its own validation strategy for format and size limits"
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.5rem',
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
                      padding: '0.75rem 0.5rem',
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
                  Validation Strategy: {activeStrategy.label}
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
