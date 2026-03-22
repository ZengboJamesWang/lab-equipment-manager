import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle, Wrench, AlertCircle } from 'lucide-react';
import { maintenanceAPI, remarksAPI, equipmentAPI } from '../services/api';
import { MaintenanceHistory, EquipmentRemark, Equipment } from '../types';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const EquipmentRecords: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'maintenance' | 'remarks'>('maintenance');

  // Common state
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  // Maintenance state
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceHistory[]>([]);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    equipment_id: '',
    maintenance_type: 'routine' as MaintenanceHistory['maintenance_type'],
    description: '',
    performed_date: format(new Date(), 'yyyy-MM-dd'),
    cost: '',
    next_maintenance_date: '',
    notes: '',
  });

  // Remarks state
  const [remarks, setRemarks] = useState<EquipmentRemark[]>([]);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [remarksForm, setRemarksForm] = useState({
    equipment_id: '',
    remark_type: 'general' as EquipmentRemark['remark_type'],
    description: '',
    severity: 'medium' as EquipmentRemark['severity'],
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    if (activeTab === 'maintenance') {
      fetchMaintenance();
    } else {
      fetchRemarks();
    }
  }, [activeTab, showResolved]);

  const fetchEquipment = async () => {
    try {
      const res = await equipmentAPI.getAll();
      setEquipment(res.data.equipment);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  };

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const res = await maintenanceAPI.getAll();
      setMaintenanceRecords(res.data.maintenance_records);
    } catch (error) {
      console.error('Failed to fetch maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRemarks = async () => {
    try {
      setLoading(true);
      const res = await remarksAPI.getAll({ resolved: showResolved ? undefined : false });
      setRemarks(res.data.remarks);
    } catch (error) {
      console.error('Failed to fetch remarks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Maintenance handlers
  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...maintenanceForm,
        cost: maintenanceForm.cost ? parseFloat(maintenanceForm.cost) : undefined,
      };
      await maintenanceAPI.create(data);
      setShowMaintenanceModal(false);
      resetMaintenanceForm();
      fetchMaintenance();
    } catch (error) {
      console.error('Failed to create maintenance record:', error);
      alert('Failed to create maintenance record');
    }
  };

  const resetMaintenanceForm = () => {
    setMaintenanceForm({
      equipment_id: '',
      maintenance_type: 'routine',
      description: '',
      performed_date: format(new Date(), 'yyyy-MM-dd'),
      cost: '',
      next_maintenance_date: '',
      notes: '',
    });
  };

  // Remarks handlers
  const handleRemarksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await remarksAPI.create(remarksForm);
      setShowRemarksModal(false);
      resetRemarksForm();
      fetchRemarks();
    } catch (error) {
      console.error('Failed to create remark:', error);
      alert('Failed to create remark');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await remarksAPI.resolve(id);
      fetchRemarks();
    } catch (error) {
      console.error('Failed to resolve remark:', error);
      alert('Failed to resolve remark');
    }
  };

  const resetRemarksForm = () => {
    setRemarksForm({
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Equipment Records</h1>
          <button
            onClick={() => {
              if (activeTab === 'maintenance') {
                resetMaintenanceForm();
                setShowMaintenanceModal(true);
              } else {
                resetRemarksForm();
                setShowRemarksModal(true);
              }
            }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            {activeTab === 'maintenance' ? 'Add Record' : 'Report Issue'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--gray-light)' }}>
          <button
            className={`btn ${activeTab === 'maintenance' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('maintenance')}
            style={{
              borderRadius: '0.375rem 0.375rem 0 0',
              borderBottom: activeTab === 'maintenance' ? '2px solid var(--primary)' : 'none',
              marginBottom: '-2px'
            }}
          >
            <Wrench size={18} />
            Maintenance History
          </button>
          <button
            className={`btn ${activeTab === 'remarks' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('remarks')}
            style={{
              borderRadius: '0.375rem 0.375rem 0 0',
              borderBottom: activeTab === 'remarks' ? '2px solid var(--primary)' : 'none',
              marginBottom: '-2px'
            }}
          >
            <AlertCircle size={18} />
            Remarks & Issues
          </button>
        </div>

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Performed By</th>
                  <th>Cost</th>
                  <th>Next Maintenance</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
                      No maintenance records found
                    </td>
                  </tr>
                ) : (
                  maintenanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td style={{ fontWeight: '600' }}>{record.equipment_name}</td>
                      <td>
                        <span className="badge" style={{
                          backgroundColor: record.maintenance_type === 'routine' ? '#d1fae5' :
                            record.maintenance_type === 'repair' ? '#fee2e2' : '#fef3c7',
                          color: record.maintenance_type === 'routine' ? '#065f46' :
                            record.maintenance_type === 'repair' ? '#991b1b' : '#92400e',
                        }}>
                          {record.maintenance_type}
                        </span>
                      </td>
                      <td>{record.description}</td>
                      <td>{format(parseISO(record.performed_date), 'MMM dd, yyyy')}</td>
                      <td>{record.performed_by_name || '-'}</td>
                      <td>{record.cost ? `$${record.cost.toFixed(2)}` : '-'}</td>
                      <td>
                        {record.next_maintenance_date
                          ? format(parseISO(record.next_maintenance_date), 'MMM dd, yyyy')
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Remarks Tab */}
        {activeTab === 'remarks' && (
          <>
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
          </>
        )}

        {/* Maintenance Modal */}
        {showMaintenanceModal && (
          <div className="modal-overlay" onClick={() => setShowMaintenanceModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Add Maintenance Record</h2>
                <button onClick={() => setShowMaintenanceModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleMaintenanceSubmit}>
                <div className="form-group">
                  <label className="form-label">Equipment *</label>
                  <select
                    className="form-select"
                    value={maintenanceForm.equipment_id}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, equipment_id: e.target.value })}
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
                      value={maintenanceForm.maintenance_type}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenance_type: e.target.value as MaintenanceHistory['maintenance_type'] })}
                      required
                    >
                      <option value="routine">Routine</option>
                      <option value="repair">Repair</option>
                      <option value="calibration">Calibration</option>
                      <option value="inspection">Inspection</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={maintenanceForm.performed_date}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performed_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                    required
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={maintenanceForm.cost}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Next Maintenance Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={maintenanceForm.next_maintenance_date}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, next_maintenance_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    className="form-textarea"
                    value={maintenanceForm.notes}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
                    style={{ minHeight: '60px' }}
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowMaintenanceModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Remarks Modal */}
        {showRemarksModal && (
          <div className="modal-overlay" onClick={() => setShowRemarksModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Report Equipment Issue</h2>
                <button onClick={() => setShowRemarksModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleRemarksSubmit}>
                <div className="form-group">
                  <label className="form-label">Equipment *</label>
                  <select
                    className="form-select"
                    value={remarksForm.equipment_id}
                    onChange={(e) => setRemarksForm({ ...remarksForm, equipment_id: e.target.value })}
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
                      value={remarksForm.remark_type}
                      onChange={(e) => setRemarksForm({ ...remarksForm, remark_type: e.target.value as EquipmentRemark['remark_type'] })}
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
                      value={remarksForm.severity}
                      onChange={(e) => setRemarksForm({ ...remarksForm, severity: e.target.value as EquipmentRemark['severity'] })}
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
                    value={remarksForm.description}
                    onChange={(e) => setRemarksForm({ ...remarksForm, description: e.target.value })}
                    required
                    placeholder="Describe the issue in detail..."
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowRemarksModal(false)} className="btn btn-outline">
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

export default EquipmentRecords;
