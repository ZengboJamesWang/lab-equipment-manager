import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { maintenanceAPI, equipmentAPI } from '../services/api';
import { MaintenanceHistory, Equipment } from '../types';
import { format, parseISO } from 'date-fns';
import Layout from '../components/Layout';

const Maintenance: React.FC = () => {
  const [records, setRecords] = useState<MaintenanceHistory[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    equipment_id: '',
    maintenance_type: 'routine' as MaintenanceHistory['maintenance_type'],
    description: '',
    performed_date: format(new Date(), 'yyyy-MM-dd'),
    cost: '',
    next_maintenance_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recordsRes, equipmentRes] = await Promise.all([
        maintenanceAPI.getAll(),
        equipmentAPI.getAll(),
      ]);

      setRecords(recordsRes.data.maintenance_records);
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
      const data = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
      };
      await maintenanceAPI.create(data);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to create maintenance record:', error);
      alert('Failed to create maintenance record');
    }
  };

  const resetForm = () => {
    setFormData({
      equipment_id: '',
      maintenance_type: 'routine',
      description: '',
      performed_date: format(new Date(), 'yyyy-MM-dd'),
      cost: '',
      next_maintenance_date: '',
      notes: '',
    });
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Maintenance History</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Add Record
          </button>
        </div>

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
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
                    No maintenance records found
                  </td>
                </tr>
              ) : (
                records.map((record) => (
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

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Add Maintenance Record</h2>
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
                      value={formData.maintenance_type}
                      onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value as MaintenanceHistory['maintenance_type'] })}
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
                      value={formData.performed_date}
                      onChange={(e) => setFormData({ ...formData, performed_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Next Maintenance Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.next_maintenance_date}
                      onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ minHeight: '60px' }}
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
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
      </div>
    </Layout>
  );
};

export default Maintenance;
