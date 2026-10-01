import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

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
          background: 'var(--status-error-soft)',
          color: 'var(--status-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <AlertCircle size={40} />
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 450, marginBottom: '2rem' }}>
        The page you are looking for doesn't exist, has been moved, or you may not have
        permission to view it.
      </p>
      <Button icon={Home} onClick={() => navigate('/')}>
        Back to Home
      </Button>
    </div>
  );
}
