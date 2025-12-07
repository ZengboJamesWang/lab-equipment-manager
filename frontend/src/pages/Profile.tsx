import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import api from '../services/api';
import { User, Lock } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    // Validate password length
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    try {
      setLoading(true);
      await api.post('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to change password',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '2rem' }}>
          Profile Settings
        </h1>

        {/* User Information */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '600',
              }}
            >
              <User size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {user?.full_name}
              </h2>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>{user?.email}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--gray)', display: 'block', marginBottom: '0.25rem' }}>
                Role
              </label>
              <p style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                {user?.role}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--gray)', display: 'block', marginBottom: '0.25rem' }}>
                Department
              </label>
              <p style={{ fontWeight: '500' }}>
                {user?.department || 'Not specified'}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--gray)', display: 'block', marginBottom: '0.25rem' }}>
                Phone
              </label>
              <p style={{ fontWeight: '500' }}>
                {user?.phone || 'Not specified'}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--gray)', display: 'block', marginBottom: '0.25rem' }}>
                Account Status
              </label>
              <span className={`badge ${user?.approval_status === 'approved' ? 'badge-confirmed' : 'badge-pending'}`}>
                {user?.approval_status}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Lock size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Change Password</h2>
          </div>

          {message && (
            <div
              className="card"
              style={{
                marginBottom: '1rem',
                backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                borderColor: message.type === 'success' ? '#c3e6cb' : '#f5c6cb',
                color: message.type === 'success' ? '#155724' : '#721c24',
              }}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={6}
                disabled={loading}
              />
              <small style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                Must be at least 6 characters long
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
