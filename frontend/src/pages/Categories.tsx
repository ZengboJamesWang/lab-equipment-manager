import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, FileText } from 'lucide-react';
import { categoriesAPI } from '../services/api';
import api from '../services/api';
import { EquipmentCategory } from '../types';
import Layout from '../components/Layout';

interface DocumentCategory {
  id: number;
  category_name: string;
  description: string | null;
  color: string;
  created_at: string;
}

const Categories: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'documents'>('equipment');

  // Equipment Categories State
  const [equipmentCategories, setEquipmentCategories] = useState<EquipmentCategory[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentCategory | null>(null);
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  // Document Categories State
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentCategory | null>(null);
  const [documentForm, setDocumentForm] = useState({
    category_name: '',
    description: '',
    color: 'blue',
  });

  useEffect(() => {
    fetchEquipmentCategories();
    fetchDocumentCategories();
  }, []);

  // Equipment Categories Functions
  const fetchEquipmentCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setEquipmentCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch equipment categories:', error);
    } finally {
      setEquipmentLoading(false);
    }
  };

  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEquipment) {
        await categoriesAPI.update(editingEquipment.id, equipmentForm);
      } else {
        await categoriesAPI.create(equipmentForm);
      }

      setShowEquipmentModal(false);
      resetEquipmentForm();
      fetchEquipmentCategories();
    } catch (error: any) {
      console.error('Failed to save equipment category:', error);
      alert(error.response?.data?.error || 'Failed to save equipment category');
    }
  };

  const handleEquipmentDelete = async (id: string) => {
    if (!window.confirm('Are you sure? This will fail if there are equipment items in this category.')) return;

    try {
      await categoriesAPI.delete(id);
      fetchEquipmentCategories();
    } catch (error: any) {
      console.error('Failed to delete equipment category:', error);
      alert(error.response?.data?.error || 'Failed to delete equipment category');
    }
  };

  const handleEquipmentEdit = (item: EquipmentCategory) => {
    setEditingEquipment(item);
    setEquipmentForm({
      name: item.name,
      description: item.description || '',
      color: item.color || '#3b82f6',
    });
    setShowEquipmentModal(true);
  };

  const resetEquipmentForm = () => {
    setEditingEquipment(null);
    setEquipmentForm({
      name: '',
      description: '',
      color: '#3b82f6',
    });
  };

  // Document Categories Functions
  const fetchDocumentCategories = async () => {
    try {
      const response = await api.get('/document-categories');
      setDocumentCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch document categories:', error);
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDocument) {
        await api.put(`/document-categories/${editingDocument.id}`, documentForm);
      } else {
        await api.post('/document-categories', documentForm);
      }
      setShowDocumentModal(false);
      resetDocumentForm();
      fetchDocumentCategories();
    } catch (error: any) {
      console.error('Failed to save document category:', error);
      alert(error.response?.data?.error || 'Failed to save document category');
    }
  };

  const handleDocumentEdit = (category: DocumentCategory) => {
    setEditingDocument(category);
    setDocumentForm({
      category_name: category.category_name,
      description: category.description || '',
      color: category.color,
    });
    setShowDocumentModal(true);
  };

  const handleDocumentDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category? This will fail if there are documents in this category.')) return;

    try {
      await api.delete(`/document-categories/${id}`);
      fetchDocumentCategories();
    } catch (error: any) {
      console.error('Failed to delete document category:', error);
      alert(error.response?.data?.error || 'Failed to delete document category');
    }
  };

  const resetDocumentForm = () => {
    setEditingDocument(null);
    setDocumentForm({
      category_name: '',
      description: '',
      color: 'blue',
    });
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      green: '#10b981',
      red: '#ef4444',
      yellow: '#f59e0b',
      purple: '#8b5cf6',
      pink: '#ec4899',
      indigo: '#6366f1',
      gray: '#6b7280',
    };
    return colorMap[color] || color;
  };

  const loading = activeTab === 'equipment' ? equipmentLoading : documentLoading;

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
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Categories</h1>
          <button
            onClick={() => {
              if (activeTab === 'equipment') {
                resetEquipmentForm();
                setShowEquipmentModal(true);
              } else {
                resetDocumentForm();
                setShowDocumentModal(true);
              }
            }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--gray-light)' }}>
          <button
            className={`btn ${activeTab === 'equipment' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('equipment')}
            style={{
              borderRadius: '0.375rem 0.375rem 0 0',
              borderBottom: activeTab === 'equipment' ? '2px solid var(--primary)' : 'none',
              marginBottom: '-2px'
            }}
          >
            <Package size={18} />
            Equipment Categories
          </button>
          <button
            className={`btn ${activeTab === 'documents' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('documents')}
            style={{
              borderRadius: '0.375rem 0.375rem 0 0',
              borderBottom: activeTab === 'documents' ? '2px solid var(--primary)' : 'none',
              marginBottom: '-2px'
            }}
          >
            <FileText size={18} />
            Document Categories
          </button>
        </div>

        {/* Equipment Categories Tab */}
        {activeTab === 'equipment' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            {equipmentCategories.map((category) => (
              <div key={category.id} className="card">
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: category.color || 'var(--primary)',
                  marginBottom: '1rem',
                  borderRadius: '2px',
                }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {category.name}
                </h3>
                <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {category.description || 'No description'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEquipmentEdit(category)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleEquipmentDelete(category.id)}
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document Categories Tab */}
        {activeTab === 'documents' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            {documentCategories.map((category) => (
              <div key={category.id} className="card">
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: getColorClass(category.color),
                  marginBottom: '1rem',
                  borderRadius: '2px',
                }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {category.category_name}
                </h3>
                <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {category.description || 'No description'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleDocumentEdit(category)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDocumentDelete(category.id)}
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Equipment Category Modal */}
        {showEquipmentModal && (
          <div className="modal-overlay" onClick={() => setShowEquipmentModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingEquipment ? 'Edit Equipment Category' : 'Add New Equipment Category'}
                </h2>
                <button onClick={() => setShowEquipmentModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleEquipmentSubmit}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={equipmentForm.name}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={equipmentForm.description}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, description: e.target.value })}
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input
                    type="color"
                    className="form-input"
                    value={equipmentForm.color}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, color: e.target.value })}
                    style={{ height: '50px' }}
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowEquipmentModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingEquipment ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Document Category Modal */}
        {showDocumentModal && (
          <div className="modal-overlay" onClick={() => setShowDocumentModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingDocument ? 'Edit Document Category' : 'Add New Document Category'}
                </h2>
                <button onClick={() => setShowDocumentModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleDocumentSubmit}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={documentForm.category_name}
                    onChange={(e) => setDocumentForm({ ...documentForm, category_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={documentForm.description}
                    onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <select
                    className="form-input"
                    value={documentForm.color}
                    onChange={(e) => setDocumentForm({ ...documentForm, color: e.target.value })}
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                    <option value="purple">Purple</option>
                    <option value="pink">Pink</option>
                    <option value="indigo">Indigo</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowDocumentModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingDocument ? 'Update' : 'Create'}
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

export default Categories;
