import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { equipmentAPI, categoriesAPI } from '../services/api';
import { Equipment as EquipmentType, EquipmentCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import EquipmentCalendar from '../components/EquipmentCalendar';

const Equipment: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentType | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    location: '',
    model_number: '',
    serial_number: '',
    purchase_year: new Date().getFullYear(),
    purchase_cost: '',
    status: 'active' as EquipmentType['status'],
    operating_notes: '',
    is_bookable: true,
    requires_approval: false,
  });

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedStatus, searchTerm]);

  const fetchData = async () => {
    try {
      const [equipmentRes, categoriesRes] = await Promise.all([
        equipmentAPI.getAll({
          category: selectedCategory || undefined,
          status: selectedStatus || undefined,
          search: searchTerm || undefined,
        }),
        categoriesAPI.getAll(),
      ]);

      setEquipment(equipmentRes.data.equipment);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        purchase_cost: formData.purchase_cost ? parseFloat(formData.purchase_cost) : undefined,
      };

      if (editingItem) {
        await equipmentAPI.update(editingItem.id, data);
      } else {
        await equipmentAPI.create(data);
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save equipment:', error);
      alert('Failed to save equipment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;

    try {
      await equipmentAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete equipment:', error);
      alert('Failed to delete equipment');
    }
  };

  const handleEdit = (item: EquipmentType) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id || '',
      location: item.location || '',
      model_number: item.model_number || '',
      serial_number: item.serial_number || '',
      purchase_year: item.purchase_year || new Date().getFullYear(),
      purchase_cost: item.purchase_cost?.toString() || '',
      status: item.status,
      operating_notes: item.operating_notes || '',
      is_bookable: item.is_bookable,
      requires_approval: item.requires_approval || false,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category_id: '',
      location: '',
      model_number: '',
      serial_number: '',
      purchase_year: new Date().getFullYear(),
      purchase_cost: '',
      status: 'active',
      operating_notes: '',
      is_bookable: true,
      requires_approval: false,
    });
  };

  const handleEquipmentClick = (item: EquipmentType) => {
    if (!item.is_bookable) {
      alert('This equipment is not available for booking');
      return;
    }
    setSelectedEquipment(item);
    setShowCalendarModal(true);
  };

  const handleBookingCreated = () => {
    // Callback when a booking is created from the calendar
    // No need to do anything specific here as the calendar handles refresh
  };

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      active: 'badge-active',
      under_maintenance: 'badge-maintenance',
      decommissioned: 'badge-decommissioned',
      reserved: 'badge-pending',
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Equipment Management</h1>
          {isAdmin && (
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="btn btn-primary"
            >
              <Plus size={18} />
              Add Equipment
            </button>
          )}
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="decommissioned">Decommissioned</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Serial Number</th>
                <th>Status</th>
                <th>Bookable</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
                    No equipment found
                  </td>
                </tr>
              ) : (
                equipment.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      cursor: item.is_bookable ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                      if (item.is_bookable) {
                        handleEquipmentClick(item);
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (item.is_bookable) {
                        e.currentTarget.style.backgroundColor = 'var(--gray-light)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {item.name}
                        {item.is_bookable && (
                          <Calendar size={14} color="var(--primary)" />
                        )}
                      </div>
                    </td>
                    <td>
                      {item.category_name && (
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          backgroundColor: `${item.category_color}20`,
                          color: item.category_color,
                          fontWeight: '600',
                        }}>
                          {item.category_name}
                        </span>
                      )}
                    </td>
                    <td>{item.location || '-'}</td>
                    <td>{item.serial_number || '-'}</td>
                    <td>
                      <span className={getStatusBadge(item.status)}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{item.is_bookable ? '✓' : '✗'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/equipment/${item.id}`);
                          }}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem' }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="btn btn-danger"
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
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
                <h2 className="modal-title">
                  {editingItem ? 'Edit Equipment' : 'Add New Equipment'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentType['status'] })}
                    >
                      <option value="active">Active</option>
                      <option value="under_maintenance">Under Maintenance</option>
                      <option value="decommissioned">Decommissioned</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Model Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.model_number}
                      onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Serial Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.serial_number}
                      onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Purchase Year</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.purchase_year}
                      onChange={(e) => setFormData({ ...formData, purchase_year: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Purchase Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.purchase_cost}
                      onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Operating Notes</label>
                  <textarea
                    className="form-textarea"
                    value={formData.operating_notes}
                    onChange={(e) => setFormData({ ...formData, operating_notes: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_bookable}
                      onChange={(e) => setFormData({ ...formData, is_bookable: e.target.checked })}
                    />
                    <span>Allow booking for this equipment</span>
                  </label>
                </div>

                {formData.is_bookable && (
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.requires_approval}
                        onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                      />
                      <span>Require admin approval for bookings</span>
                    </label>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.5rem', marginLeft: '1.75rem' }}>
                      When enabled, bookings will remain pending until an admin approves them.
                    </p>
                  </div>
                )}

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Calendar Modal */}
        {showCalendarModal && selectedEquipment && (
          <div className="modal-overlay" onClick={() => setShowCalendarModal(false)}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '900px', width: '90%' }}
            >
              <div className="modal-header">
                <h2 className="modal-title">Equipment Booking Calendar</h2>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <EquipmentCalendar
                  equipmentId={selectedEquipment.id}
                  equipmentName={selectedEquipment.name}
                  onBookingCreated={handleBookingCreated}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Equipment;
