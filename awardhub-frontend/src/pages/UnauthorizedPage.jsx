import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user, getRoleDisplay } = useAuth();

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--status-warning-soft)',
          color: 'var(--status-warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <ShieldAlert size={40} />
      </div>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
        Access Restricted
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 460, marginBottom: '1.5rem' }}>
        Your account role ({getRoleDisplay() || 'Guest'}) does not have permission to
        access this area.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="primary" icon={Home} onClick={() => navigate('/')}>
          Home
        </Button>
      </div>
    </div>
  );
}
