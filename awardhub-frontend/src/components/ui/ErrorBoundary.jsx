import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--bg-primary, #F7F4EC)',
            color: 'var(--text-primary, #16182A)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--status-error-soft, rgba(178, 58, 58, 0.1))',
              color: 'var(--status-error, #B23A3A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700 }}>
            Something went wrong
          </h2>
          <p
            style={{
              color: 'var(--text-muted, #5F6375)',
              maxWidth: 500,
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            {this.state.error?.message || 'An unexpected runtime error occurred.'}
          </p>
          <Button
            variant="primary"
            icon={RefreshCw}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
