import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import { Check, X, Shield, ShieldOff, UserX, UserCheck, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { User } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.users);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await usersAPI.approve(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve user');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await usersAPI.reject(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject user');
    }
  };

  const handlePromote = async (userId: string) => {
    if (!confirm('Are you sure you want to promote this user to admin?')) return;

    try {
      await usersAPI.promote(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to promote user');
    }
  };

  const handleDemote = async (userId: string) => {
    if (!confirm('Are you sure you want to demote this admin to user?')) return;

    try {
      await usersAPI.demote(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to demote user');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await usersAPI.deactivate(userId);
      } else {
        await usersAPI.activate(userId);
      }
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to ${isActive ? 'deactivate' : 'activate'} user`);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, React.CSSProperties> = {
      pending: {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      },
      approved: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      },
      rejected: {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      },
    };

    const icons: Record<string, React.ReactNode> = {
      pending: <Clock size={12} />,
      approved: <Check size={12} />,
      rejected: <X size={12} />,
    };

    return (
      <span style={styles[status]}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    return user.approval_status === filter;
  });

  const pendingCount = users.filter((u) => u.approval_status === 'pending').length;

  if (currentUser?.role !== 'admin') {
    return (
      <Layout>
        <div className="error-message">You do not have permission to access this page.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-description">Manage user registrations and permissions</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {pendingCount > 0 && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#FEF3C7',
          border: '1px solid #FDE68A',
          borderRadius: '0.375rem',
          marginBottom: '1.5rem',
        }}>
          <strong>⚠️ {pendingCount} user{pendingCount > 1 ? 's' : ''} pending approval</strong>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('all')}
        >
          All Users ({users.length})
        </button>
        <button
          className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({users.filter((u) => u.approval_status === 'approved').length})
        </button>
        <button
          className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({users.filter((u) => u.approval_status === 'rejected').length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--gray)' }}>No users found</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gray-light)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Department</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Active</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--gray-light)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: '600' }}>{user.full_name}</div>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--gray)' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--gray)' }}>
                    {user.department || '-'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      backgroundColor: user.role === 'admin' ? '#DBEAFE' : '#F3F4F6',
                      color: user.role === 'admin' ? '#1E40AF' : '#374151',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}>
                      {user.role === 'admin' ? '👑 Admin' : 'User'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{getStatusBadge(user.approval_status || 'pending')}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {user.is_active ? (
                      <span style={{ color: '#059669' }}>✓ Active</span>
                    ) : (
                      <span style={{ color: '#DC2626' }}>✗ Inactive</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {user.approval_status === 'pending' && (
                        <>
                          <button
                            className="btn btn-success"
                            onClick={() => handleApprove(user.id)}
                            title="Approve user"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                          >
                            <Check size={16} /> Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleReject(user.id)}
                            title="Reject user"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                          >
                            <X size={16} /> Reject
                          </button>
                        </>
                      )}

                      {user.approval_status === 'approved' && user.id !== currentUser?.id && (
                        <>
                          {user.role === 'user' ? (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handlePromote(user.id)}
                              title="Promote to admin"
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                            >
                              <Shield size={16} /> Promote
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleDemote(user.id)}
                              title="Demote to user"
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                            >
                              <ShieldOff size={16} /> Demote
                            </button>
                          )}

                          <button
                            className={user.is_active ? 'btn btn-danger' : 'btn btn-success'}
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                            title={user.is_active ? 'Deactivate user' : 'Activate user'}
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                          >
                            {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                            {user.is_active ? ' Deactivate' : ' Activate'}
                          </button>
                        </>
                      )}

                      {user.approval_status === 'rejected' && (
                        <button
                          className="btn btn-success"
                          onClick={() => handleApprove(user.id)}
                          title="Approve user"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        >
                          <Check size={16} /> Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Users;
