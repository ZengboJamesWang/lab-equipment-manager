import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Star, Plus, Edit2 } from 'lucide-react';
import { equipmentAPI, equipmentImagesAPI, equipmentSpecsAPI } from '../services/api';
import { Equipment as EquipmentType, EquipmentImage, EquipmentSpec } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [equipment, setEquipment] = useState<EquipmentType | null>(null);
  const [images, setImages] = useState<EquipmentImage[]>([]);
  const [specs, setSpecs] = useState<EquipmentSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [editingSpec, setEditingSpec] = useState<EquipmentSpec | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [imageFormData, setImageFormData] = useState({
    image_url: '',
    image_name: '',
    is_primary: false,
  });

  const [specFormData, setSpecFormData] = useState({
    spec_key: '',
    spec_value: '',
    spec_unit: '',
    display_order: 0,
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;

    try {
      const [equipmentRes, imagesRes, specsRes] = await Promise.all([
        equipmentAPI.getById(id),
        equipmentImagesAPI.getAll(id),
        equipmentSpecsAPI.getAll(id),
      ]);

      setEquipment(equipmentRes.data.equipment);
      setImages(imagesRes.data.images);
      setSpecs(specsRes.data.specs);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load equipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      if (uploadMethod === 'file') {
        if (!selectedFile) {
          alert('Please select a file to upload');
          return;
        }
        await equipmentImagesAPI.upload(id, selectedFile, imageFormData.is_primary);
      } else {
        if (!imageFormData.image_url) {
          alert('Please enter an image URL');
          return;
        }
        await equipmentImagesAPI.add(id, imageFormData);
      }

      setShowImageModal(false);
      setImageFormData({ image_url: '', image_name: '', is_primary: false });
      setSelectedFile(null);
      fetchData();
    } catch (error) {
      console.error('Failed to add image:', error);
      alert('Failed to add image');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await equipmentImagesAPI.delete(id, imageId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image');
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!id) return;

    try {
      await equipmentImagesAPI.setPrimary(id, imageId);
      fetchData();
    } catch (error) {
      console.error('Failed to set primary image:', error);
      alert('Failed to set primary image');
    }
  };

  const handleAddOrUpdateSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await equipmentSpecsAPI.addOrUpdate(id, specFormData);
      setShowSpecModal(false);
      setEditingSpec(null);
      setSpecFormData({ spec_key: '', spec_value: '', spec_unit: '', display_order: 0 });
      fetchData();
    } catch (error) {
      console.error('Failed to save spec:', error);
      alert('Failed to save spec');
    }
  };

  const handleDeleteSpec = async (specId: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this specification?')) return;

    try {
      await equipmentSpecsAPI.delete(id, specId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete spec:', error);
      alert('Failed to delete spec');
    }
  };

  const handleEditSpec = (spec: EquipmentSpec) => {
    setEditingSpec(spec);
    setSpecFormData({
      spec_key: spec.spec_key,
      spec_value: spec.spec_value || '',
      spec_unit: spec.spec_unit || '',
      display_order: spec.display_order,
    });
    setShowSpecModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading"><div className="spinner"></div></div>
      </Layout>
    );
  }

  if (!equipment) {
    return (
      <Layout>
        <div>Equipment not found</div>
      </Layout>
    );
  }

  const primaryImage = images.find(img => img.is_primary);

  // Helper function to get full image URL
  const getImageUrl = (imageUrl: string) => {
    // If it's a relative URL (uploaded file), prepend the server base URL
    if (imageUrl.startsWith('/uploads/')) {
      // Get the API URL and extract just the server base (remove /api suffix)
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      // Remove /api suffix if present to get the server root
      const serverBase = apiUrl.replace(/\/api\/?$/, '');
      // In production, if serverBase is empty, use the current origin
      const base = serverBase || window.location.origin;
      return `${base}${imageUrl}`;
    }
    // Otherwise, it's an external URL, return as is
    return imageUrl;
  };

  return (
    <Layout>
      <div>
        <button
          onClick={() => navigate('/equipment')}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
        >
          <ArrowLeft size={18} />
          Back to Equipment
        </button>

        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '2rem' }}>
          {equipment.name}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Equipment Info */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Equipment Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <strong>Category:</strong> {equipment.category_name || 'N/A'}
              </div>
              <div>
                <strong>Location:</strong> {equipment.location || 'N/A'}
              </div>
              <div>
                <strong>Model Number:</strong> {equipment.model_number || 'N/A'}
              </div>
              <div>
                <strong>Serial Number:</strong> {equipment.serial_number || 'N/A'}
              </div>
              <div>
                <strong>Purchase Year:</strong> {equipment.purchase_year || 'N/A'}
              </div>
              <div>
                <strong>Status:</strong> {equipment.status}
              </div>
              {equipment.operating_notes && (
                <div>
                  <strong>Operating Notes:</strong>
                  <p style={{ marginTop: '0.5rem', color: 'var(--gray)' }}>{equipment.operating_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Primary Image */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Primary Image
            </h2>
            {primaryImage ? (
              <img
                src={getImageUrl(primaryImage.image_url)}
                alt={equipment.name}
                style={{ width: '100%', height: 'auto', borderRadius: '0.5rem' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '200px',
                backgroundColor: 'var(--gray-light)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gray)',
              }}>
                No primary image set
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              Technical Specifications
            </h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingSpec(null);
                  setSpecFormData({ spec_key: '', spec_value: '', spec_unit: '', display_order: 0 });
                  setShowSpecModal(true);
                }}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} />
                Add Spec
              </button>
            )}
          </div>
          {specs.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>No specifications added yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Value</th>
                  <th>Unit</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.id}>
                    <td style={{ fontWeight: '600' }}>{spec.spec_key}</td>
                    <td>{spec.spec_value || '-'}</td>
                    <td>{spec.spec_unit || '-'}</td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEditSpec(spec)}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSpec(spec.id)}
                            className="btn btn-danger"
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Images Gallery */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              Image Gallery
            </h2>
            {isAdmin && (
              <button
                onClick={() => setShowImageModal(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Upload size={16} />
                Add Image
              </button>
            )}
          </div>
          {images.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>No images uploaded yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {images.map((image) => (
                <div key={image.id} style={{ position: 'relative' }}>
                  <img
                    src={getImageUrl(image.image_url)}
                    alt={image.image_name || equipment.name}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '0.5rem',
                      border: image.is_primary ? '3px solid var(--primary)' : 'none',
                    }}
                  />
                  {image.is_primary && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      left: '0.5rem',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}>
                      <Star size={12} fill="white" />
                      Primary
                    </div>
                  )}
                  {isAdmin && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      display: 'flex',
                      gap: '0.25rem',
                    }}>
                      {!image.is_primary && (
                        <button
                          onClick={() => handleSetPrimaryImage(image.id)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', backgroundColor: 'white' }}
                          title="Set as primary"
                        >
                          <Star size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  {image.image_name && (
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--gray)' }}>
                      {image.image_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Image Modal */}
        {showImageModal && (
          <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Add Image</h2>
                <button onClick={() => setShowImageModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleAddImage}>
                {/* Upload Method Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      borderBottom: uploadMethod === 'file' ? '2px solid var(--primary)' : '2px solid transparent',
                      color: uploadMethod === 'file' ? 'var(--primary)' : 'var(--gray)',
                      fontWeight: uploadMethod === 'file' ? '600' : '400',
                      marginBottom: '-2px',
                    }}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      borderBottom: uploadMethod === 'url' ? '2px solid var(--primary)' : '2px solid transparent',
                      color: uploadMethod === 'url' ? 'var(--primary)' : 'var(--gray)',
                      fontWeight: uploadMethod === 'url' ? '600' : '400',
                      marginBottom: '-2px',
                    }}
                  >
                    From URL
                  </button>
                </div>

                {uploadMethod === 'file' ? (
                  <div className="form-group">
                    <label className="form-label">Select Image File *</label>
                    <input
                      type="file"
                      className="form-input"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      required
                    />
                    {selectedFile && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--success)', marginTop: '0.5rem' }}>
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
                      Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Image URL *</label>
                      <input
                        type="url"
                        className="form-input"
                        value={imageFormData.image_url}
                        onChange={(e) => setImageFormData({ ...imageFormData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                      <p style={{ fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
                        Enter the URL of the image from hosting services like Imgur.
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Image Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={imageFormData.image_name}
                        onChange={(e) => setImageFormData({ ...imageFormData, image_name: e.target.value })}
                        placeholder="Front view, Side panel, etc."
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={imageFormData.is_primary}
                      onChange={(e) => setImageFormData({ ...imageFormData, is_primary: e.target.checked })}
                    />
                    <span>Set as primary image</span>
                  </label>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowImageModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Image
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Spec Modal */}
        {showSpecModal && (
          <div className="modal-overlay" onClick={() => setShowSpecModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{editingSpec ? 'Edit Specification' : 'Add Specification'}</h2>
                <button onClick={() => setShowSpecModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <form onSubmit={handleAddOrUpdateSpec}>
                <div className="form-group">
                  <label className="form-label">Specification Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={specFormData.spec_key}
                    onChange={(e) => setSpecFormData({ ...specFormData, spec_key: e.target.value })}
                    placeholder="e.g., Power, Weight, Dimensions"
                    required
                    disabled={!!editingSpec}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Value *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={specFormData.spec_value}
                    onChange={(e) => setSpecFormData({ ...specFormData, spec_value: e.target.value })}
                    placeholder="e.g., 220, 50, 100x50x30"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    className="form-input"
                    value={specFormData.spec_unit}
                    onChange={(e) => setSpecFormData({ ...specFormData, spec_unit: e.target.value })}
                    placeholder="e.g., V, kg, cm"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input
                    type="number"
                    className="form-input"
                    value={specFormData.display_order}
                    onChange={(e) => setSpecFormData({ ...specFormData, display_order: parseInt(e.target.value) })}
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowSpecModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingSpec ? 'Update' : 'Add'} Specification
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

export default EquipmentDetails;
