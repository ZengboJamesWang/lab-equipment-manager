import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import { remarksAPI, equipmentAPI } from '../services/api';
import { EquipmentRemark, Equipment } from '../types';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Remarks: React.FC = () => {
  const { isAdmin } = useAuth();
  const [remarks, setRemarks] = useState<EquipmentRemark[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  const [formData, setFormData] = useState({
    equipment_id: '',
    remark_type: 'general' as EquipmentRemark['remark_type'],
    description: '',
    severity: 'medium' as EquipmentRemark['severity'],
  });

  useEffect(() => {
    fetchData();
  }, [showResolved]);

  const fetchData = async () => {
    try {
      const [remarksRes, equipmentRes] = await Promise.all([
        remarksAPI.getAll({ resolved: showResolved ? undefined : false }),
        equipmentAPI.getAll(),
      ]);

      setRemarks(remarksRes.data.remarks);
      setEquipment(equipmentRes.data.equipment);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await remarksAPI.create(formData);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to create remark:', error);
      alert('Failed to create remark');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await remarksAPI.resolve(id);
      fetchData();
    } catch (error) {
      console.error('Failed to resolve remark:', error);
      alert('Failed to resolve remark');
    }
  };

  const resetForm = () => {
    setFormData({
      equipment_id: '',
      remark_type: 'general',
      description: '',
      severity: 'medium',
    });
  };

  const getSeverityBadge = (severity?: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      low: { bg: '#e0e7ff', text: '#3730a3' },
      medium: { bg: '#fef3c7', text: '#92400e' },
      high: { bg: '#fed7aa', text: '#9a3412' },
      critical: { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[severity || 'medium'];
    return (
      <span className="badge" style={{ backgroundColor: color.bg, color: color.text }}>
        {severity || 'medium'}
      </span>
    );
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Equipment Remarks & Issues</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Report Issue
          </button>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
            />
            <span>Show resolved issues</span>
          </label>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Type</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Reported By</th>
                <th>Date</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {remarks.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
                    No remarks found
                  </td>
                </tr>
              ) : (
                remarks.map((remark) => (
                  <tr key={remark.id}>
                    <td style={{ fontWeight: '600' }}>{remark.equipment_name}</td>
                    <td>
                      <span className="badge" style={{ textTransform: 'capitalize' }}>
                        {remark.remark_type}
                      </span>
                    </td>
                    <td>{remark.description}</td>
                    <td>{getSeverityBadge(remark.severity)}</td>
                    <td>{remark.reported_by_name || '-'}</td>
                    <td>{format(parseISO(remark.created_at), 'MMM dd, yyyy')}</td>
                    <td>
                      {remark.resolved ? (
                        <span className="badge-confirmed badge">Resolved</span>
                      ) : (
                        <span className="badge-pending badge">Open</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td>
                        {!remark.resolved && (
                          <button
                            onClick={() => handleResolve(remark.id)}
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            <CheckCircle size={14} />
                            Resolve
                          </button>
                        )}
                      </td>
                    )}
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
                <h2 className="modal-title">Report Equipment Issue</h2>
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
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select
                      className="form-select"
                      value={formData.remark_type}
                      onChange={(e) => setFormData({ ...formData, remark_type: e.target.value as EquipmentRemark['remark_type'] })}
                      required
                    >
                      <option value="general">General</option>
                      <option value="damage">Damage</option>
                      <option value="malfunction">Malfunction</option>
                      <option value="issue">Issue</option>
                      <option value="decommission">Decommission</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Severity *</label>
                    <select
                      className="form-select"
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value as EquipmentRemark['severity'] })}
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Describe the issue in detail..."
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Report
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

export default Remarks;
