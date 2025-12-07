import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import { FileText, Download, Trash2, Link as LinkIcon, Eye } from 'lucide-react';

interface Category {
  id: number;
  category_name: string;
  description: string | null;
  color: string;
  created_at: string;
}

interface Document {
  id: number;
  document_name: string;
  category_id: number;
  category_name: string;
  category_color: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  description: string;
  uploader_name: string;
  equipment_name: string;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;

type SortField = 'document_name' | 'category_name' | 'file_size' | 'uploader_name' | 'created_at';
type SortDirection = 'asc' | 'desc';

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Upload form state (inline, not modal)
  const [uploadForm, setUploadForm] = useState({
    category_id: '',
    description: '',
    file: null as File | null,
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchCategories();
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (selectedCategoryId === 'all') {
      setFilteredDocuments(documents);
    } else {
      setFilteredDocuments(documents.filter(doc => doc.category_id === parseInt(selectedCategoryId)));
    }
    setCurrentPage(1);
  }, [selectedCategoryId, documents]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/document-categories');
      setCategories(response.data.categories);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents');
      setDocuments(response.data.documents);
      setFilteredDocuments(response.data.documents);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.response?.data?.error || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.file) {
      alert('Please select a file');
      return;
    }

    if (!uploadForm.category_id) {
      alert('Please select a category');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('document_name', uploadForm.file.name);
      formData.append('category_id', uploadForm.category_id);
      formData.append('description', uploadForm.description);

      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Document uploaded successfully!');
      setUploadForm({
        category_id: '',
        description: '',
        file: null,
      });
      fetchDocuments();
    } catch (err: any) {
      console.error('Error uploading document:', err);
      alert(err.response?.data?.error || 'Failed to upload document');
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/documents/${documentId}`);
      alert('Document deleted successfully');
      fetchDocuments();
    } catch (err: any) {
      console.error('Error deleting document:', err);
      alert(err.response?.data?.error || 'Failed to delete document');
    }
  };

  const getFileUrl = (fileUrl: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const serverBase = apiUrl.replace(/\/api\/?$/, '') || window.location.origin;
    return `${serverBase}${fileUrl}`;
  };

  const handleCopyLink = (fileUrl: string) => {
    const fullUrl = getFileUrl(fileUrl);
    navigator.clipboard.writeText(fullUrl);
    alert('Link copied to clipboard!');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    return '📄';
  };

  const getColorClasses = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      red: 'bg-red-500 text-white',
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      purple: 'bg-purple-500 text-white',
      pink: 'bg-pink-500 text-white',
      orange: 'bg-orange-500 text-white',
      gray: 'bg-gray-500 text-white',
    };
    return colorMap[color] || 'bg-blue-500 text-white';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedDocuments = (docs: Document[]) => {
    return [...docs].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle description vs document_name for display
      if (sortField === 'document_name') {
        aValue = (a.description && a.description.trim()) ? a.description : a.document_name;
        bValue = (b.description && b.description.trim()) ? b.description : b.document_name;
      }

      // Convert to comparable values
      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'file_size') {
        aValue = Number(aValue);
        bValue = Number(bValue);
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

  // Pagination
  const sortedDocuments = getSortedDocuments(filteredDocuments);
  const totalPages = Math.ceil(sortedDocuments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDocuments = sortedDocuments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>Lab Documents</h1>
            <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>Organize and manage laboratory documents by category</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="form-select"
            >
              <option value="all">All Categories ({documents.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name} ({documents.filter(d => d.category_id === cat.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload Section */}
        {isAdmin && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Upload Files</h2>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="form-input"
                  placeholder="Add a description (optional)"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  value={uploadForm.category_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, category_id: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Choose Files</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', marginBottom: 0 }}>
                    Browse...
                    <input
                      type="file"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                  </label>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray)' }}>
                    {uploadForm.file ? `${uploadForm.file.name} (${formatFileSize(uploadForm.file.size)})` : 'No file chosen'}
                  </span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Upload
              </button>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--danger-light)', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {/* Documents List */}
        {currentDocuments.length > 0 ? (
          <>
            <div className="card">
              <div className="table-container">
                <table className="data-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                  <colgroup>
                    <col style={{ width: '40%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '8%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th
                        onClick={() => handleSort('document_name')}
                        style={{ textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                      >
                        Document / Description{getSortIcon('document_name')}
                      </th>
                      <th
                        onClick={() => handleSort('category_name')}
                        style={{ textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                      >
                        Category{getSortIcon('category_name')}
                      </th>
                      <th
                        onClick={() => handleSort('file_size')}
                        style={{ textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                      >
                        Size{getSortIcon('file_size')}
                      </th>
                      <th
                        onClick={() => handleSort('uploader_name')}
                        style={{ textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                      >
                        Uploaded By{getSortIcon('uploader_name')}
                      </th>
                      <th
                        onClick={() => handleSort('created_at')}
                        style={{ textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                      >
                        Date{getSortIcon('created_at')}
                      </th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontFamily: 'inherit' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{getFileIcon(doc.mime_type)}</span>
                            <div style={{ minWidth: 0 }}>
                              <a
                                href={getFileUrl(doc.file_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontWeight: '500',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block',
                                  color: 'var(--primary)',
                                  textDecoration: 'none'
                                }}
                              >
                                {doc.description && doc.description.trim() ? doc.description : doc.document_name}
                              </a>
                              {doc.description && doc.description.trim() && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {doc.document_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'inherit' }}>
                          <span className={`badge ${getColorClasses(doc.category_color)}`}>
                            {doc.category_name}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'inherit' }}>{formatFileSize(doc.file_size)}</td>
                        <td style={{ fontFamily: 'inherit' }}>{doc.uploader_name || 'Unknown'}</td>
                        <td style={{ fontFamily: 'inherit' }}>{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                            <a
                              href={getFileUrl(doc.file_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-icon btn-icon-view"
                              title="Open"
                            >
                              <Eye size={16} />
                            </a>
                            <a
                              href={getFileUrl(doc.file_url)}
                              download
                              className="btn-icon btn-icon-view"
                              title="Download"
                            >
                              <Download size={16} />
                            </a>
                            <button
                              onClick={() => handleCopyLink(doc.file_url)}
                              className="btn-icon btn-icon-view"
                              title="Copy Link"
                            >
                              <LinkIcon size={16} />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="btn-icon btn-icon-delete"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={currentPage === page ? 'btn btn-primary' : 'btn btn-secondary'}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', color: 'var(--gray)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.5rem' }}>No documents found</h3>
            <p style={{ color: 'var(--gray)' }}>
              {selectedCategoryId === 'all'
                ? 'Upload your first document to get started'
                : 'No documents in this category yet'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Documents;
