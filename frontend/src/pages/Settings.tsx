import React, { useEffect, useState } from 'react';
import { Save, User, Lock, Settings as SettingsIcon } from 'lucide-react';
import { settingsAPI } from '../services/api';
import { SiteSetting } from '../types';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'system'>('profile');

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.getAll();
      setSettings(res.data.settings);

      const siteNameSetting = res.data.settings.find(s => s.setting_key === 'site_name');
      if (siteNameSetting) {
        setSiteName(siteNameSetting.setting_value || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update('site_name', siteName);
      alert('Settings saved successfully! Please refresh the page to see the changes.');
      fetchSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

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
      setPasswordLoading(true);
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
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading"><div className="spinner"></div></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Settings</h1>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--gray-light)' }}>
          <button
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('profile')}
            style={{
              borderRadius: '0.375rem 0.375rem 0 0',
              borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : 'none',
              marginBottom: '-2px'
            }}
          >
            <User size={18} />
            Profile
          </button>
          {user?.role === 'admin' && (
            <button
              className={`btn ${activeTab === 'system' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('system')}
              style={{
                borderRadius: '0.375rem 0.375rem 0 0',
                borderBottom: activeTab === 'system' ? '2px solid var(--primary)' : 'none',
                marginBottom: '-2px'
              }}
            >
              <SettingsIcon size={18} />
              System
            </button>
          )}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
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
                    disabled={passwordLoading}
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
                    disabled={passwordLoading}
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
                    disabled={passwordLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordLoading}
                  style={{ opacity: passwordLoading ? 0.6 : 1 }}
                >
                  {passwordLoading ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            </div>
          </>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && user?.role === 'admin' && (
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Site Configuration
            </h2>

            <div className="form-group">
              <label className="form-label">Site Name</label>
              <input
                type="text"
                className="form-input"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Lab Manager"
              />
              <p style={{ fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
                This name will be displayed in the application header and footer.
              </p>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Settings;
