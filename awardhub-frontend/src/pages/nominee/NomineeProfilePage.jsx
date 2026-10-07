import React, { useState, useEffect } from 'react';
import { User, Mail, Building, FileText, Upload, Save, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { profilesApi } from '../../api/profiles';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

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
      const docs = await profilesApi.getMyDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'PORTFOLIO');

    setUploading(true);
    try {
      await profilesApi.uploadDocument(formData);
      toast.success('Document uploaded successfully!');
      const docs = await profilesApi.getMyDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    try {
      await profilesApi.deleteDocument(id);
      toast.success('Document deleted');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading nominee profile dossier..." />;
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Nominee Profile Dossier</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Maintain verified credentials, biography, and credentials attached to your nominations
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

      {/* Supporting Documents Section */}
      <Card
        title="Supporting Documentation & Evidence Dossier"
        subtitle="Upload certificates, publications, patents, or letters of endorsement (PDF, DOCX, ZIP)"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
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
              Upload Evidence Document
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Maximum file size: 15MB
            </p>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--accent-primary)',
                color: 'var(--text-on-accent)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              <span>{uploading ? 'Uploading...' : 'Browse Computer'}</span>
              <input
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {documents.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                Uploaded Documents ({documents.length})
              </h4>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {doc.fileName || doc.documentName || `Document #${doc.id}`}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : 'Verified attachment'}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Trash2}
                    onClick={() => handleDeleteDoc(doc.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
