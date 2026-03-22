import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { bookingsAPI, equipmentAPI } from '../services/api';
import { Booking, Equipment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import Layout from '../components/Layout';

type SortField = 'equipment_name' | 'user_name' | 'start_time' | 'end_time' | 'status';
type SortDirection = 'asc' | 'desc';

const Bookings: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my' | 'pending'>('my');
  const [sortField, setSortField] = useState<SortField>('start_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [formData, setFormData] = useState({
    equipment_id: '',
    start_time: '',
    end_time: '',
    purpose: '',
  });

  useEffect(() => {
    fetchData();
  }, [filter, user]);

  const fetchData = async () => {
    try {
      const params = filter === 'my' && user
        ? { user_id: user.id }
        : filter === 'pending'
        ? { status: 'pending' }
        : {};

      const [bookingsRes, equipmentRes] = await Promise.all([
        bookingsAPI.getAll(params),
        equipmentAPI.getAll({ status: 'active' }),
      ]);

      setBookings(bookingsRes.data.bookings);
      setEquipment(equipmentRes.data.equipment.filter(e => e.is_bookable));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedBookings = () => {
    return [...bookings].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Convert to comparable values
      if (sortField === 'start_time' || sortField === 'end_time') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return ' ↕';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await bookingsAPI.create(formData);
      setShowModal(false);
      resetForm();
      fetchData();
      alert('Booking created successfully! Waiting for admin approval.');
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      alert(error.response?.data?.error || 'Failed to create booking');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await bookingsAPI.updateStatus(id, 'confirmed');
      fetchData();
    } catch (error) {
      console.error('Failed to approve booking:', error);
      alert('Failed to approve booking');
    }
  };

  const handleReject = async (id: string) => {
    const notes = prompt('Rejection reason (optional):');
    try {
      await bookingsAPI.updateStatus(id, 'rejected', notes || undefined);
      fetchData();
    } catch (error) {
      console.error('Failed to reject booking:', error);
      alert('Failed to reject booking');
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Cancellation reason (optional):');
    try {
      await bookingsAPI.cancel(id, reason || undefined);
      fetchData();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const resetForm = () => {
    setFormData({
      equipment_id: '',
      start_time: '',
      end_time: '',
      purpose: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'badge-pending',
      confirmed: 'badge-confirmed',
      cancelled: 'badge-cancelled',
      completed: 'badge-completed',
      rejected: 'badge-cancelled',
    };
    return `badge ${classes[status] || ''}`;
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Equipment Bookings</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            New Booking
          </button>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFilter('my')}
              className={`btn ${filter === 'my' ? 'btn-primary' : 'btn-outline'}`}
            >
              My Bookings
            </button>
            {isAdmin && (
              <button
                onClick={() => setFilter('pending')}
                className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
              >
                Pending Approval
              </button>
            )}
            <button
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All Bookings
            </button>
          </div>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th onClick={() => handleSort('equipment_name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Equipment{getSortIcon('equipment_name')}
                </th>
                <th onClick={() => handleSort('user_name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  User{getSortIcon('user_name')}
                </th>
                <th onClick={() => handleSort('start_time')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Start Time{getSortIcon('start_time')}
                </th>
                <th onClick={() => handleSort('end_time')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  End Time{getSortIcon('end_time')}
                </th>
                <th>Purpose</th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Status{getSortIcon('status')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                getSortedBookings().map((booking) => (
                  <tr key={booking.id}>
                    <td style={{ fontWeight: '600' }}>{booking.equipment_name}</td>
                    <td>{booking.user_name}</td>
                    <td>{format(parseISO(booking.start_time), 'MMM dd, yyyy HH:mm')}</td>
                    <td>{format(parseISO(booking.end_time), 'MMM dd, yyyy HH:mm')}</td>
                    <td>{booking.purpose || '-'}</td>
                    <td>
                      <span className={getStatusBadge(booking.status)}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {isAdmin && booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(booking.id)}
                              className="btn btn-secondary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(booking.id)}
                              className="btn btn-danger"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(booking.user_id === user?.id || isAdmin) &&
                         ['pending', 'confirmed'].includes(booking.status) && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">New Booking Request</h2>
                <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Equipment *</label>
                  <select
                    className="form-select"
                    value={formData.equipment_id}
                    onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                    required
                  >
                    <option value="">Select Equipment</option>
                    {equipment.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.location || 'No location'}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Purpose</label>
                  <textarea
                    className="form-textarea"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Describe what you'll be using this equipment for..."
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bookings;
