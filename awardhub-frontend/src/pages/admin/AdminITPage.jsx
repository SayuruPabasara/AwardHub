import React, { useState } from 'react';
import { Key, Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AdminITPage() {
  const [userId, setUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [recentActions, setRecentActions] = useState([]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error('User ID is required');
      return;
    }
    setResetting(true);
    try {
      await adminApi.resetPassword(userId, newPassword ? { newPassword } : {});
      toast.success(`Password reset token generated for User #${userId}`);
      setRecentActions([
        {
          id: Date.now(),
          targetUser: `User #${userId}`,
          action: 'PASSWORD_RESET',
          timestamp: new Date().toLocaleTimeString(),
          status: 'SUCCESS',
        },
        ...recentActions,
      ]);
      setUserId('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Password reset failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          IT Coordinator Operations Console
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Execute emergency password resets, identity unlock procedures, and credentials rotation
        </p>
      </div>

      <Card title="Direct Account Password Reset">
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--status-warning-soft)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--status-warning)',
              fontSize: '0.8125rem',
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>
              All manual password resets are logged in the immutable system audit trail with your operator session ID.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Target User Account ID *
              </label>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 14"
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
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                New Temporary Password (Optional)
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank for auto-generated OTP"
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button type="submit" variant="primary" icon={Key} loading={resetting}>
              Issue Password Reset
            </Button>
          </div>
        </form>
      </Card>

      {recentActions.length > 0 && (
        <Card title="Operator Actions Log (Current Session)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActions.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={18} style={{ color: 'var(--status-success)' }} />
                  <span style={{ fontWeight: 600 }}>{item.targetUser}</span>
                  <span style={{ color: 'var(--text-muted)' }}>• {item.action}</span>
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
