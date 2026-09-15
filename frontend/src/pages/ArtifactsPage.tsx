import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Artifact, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

export const ArtifactsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const toast = useToast();

  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [selectedArtifactDetail, setSelectedArtifactDetail] = useState<{
    artifact: Artifact;
    conservationRecords: any[];
    restorationRecords: any[];
    exhibitions: any[];
  } | null>(null);
  const [artifactToDelete, setArtifactToDelete] = useState<Artifact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialFormData = {
    name: '',
    category: 'Sculpture',
    period: '',
    origin: '',
    material: '',
    description: '',
    condition: 'Good' as Artifact['condition'],
    location: '',
    acquisition_date: '',
    image_url: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  const canManage = hasRole('admin', 'curator', 'conservator', 'staff');

  const categories = [
    'All',
    'Sculpture',
    'Archaeology',
    'Painting',
    'Numismatics & Trade Antiquities',
    'Arms & Armour',
    'Manuscripts',
    'Decorative Arts',
  ];

  const conditions = [
    'All',
    'Pristine',
    'Good',
    'Fair',
    'Fragile',
    'Critical',
    'Under Restoration',
  ];

  const loadArtifacts = async () => {
    setIsLoading(true);
    try {
      const res = await api.getArtifacts({
        search: search || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        condition: selectedCondition !== 'All' ? selectedCondition : undefined,
      });
      setArtifacts(res.artifacts);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load artifacts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadArtifacts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedCondition]);

  const handleOpenAdd = () => {
    setEditingArtifact(null);
    setFormData(initialFormData);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (art: Artifact) => {
    setEditingArtifact(art);
    setFormData({
      name: art.name || '',
      category: art.category || 'Sculpture',
      period: art.period || '',
      origin: art.origin || '',
      material: art.material || '',
      description: art.description || '',
      condition: art.condition || 'Good',
      location: art.location || '',
      acquisition_date: art.acquisition_date ? art.acquisition_date.slice(0, 10) : '',
      image_url: art.image_url || '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = async (art: Artifact) => {
    try {
      const res = await api.getArtifactById(art.id);
      setSelectedArtifactDetail(res);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch detailed artifact record');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Artifact name is required');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Display or storage location is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingArtifact) {
        await api.updateArtifact(editingArtifact.id, formData);
        toast.success(`Updated "${formData.name}" successfully`);
      } else {
        await api.createArtifact(formData);
        toast.success(`Created "${formData.name}" successfully`);
      }
      setIsFormModalOpen(false);
      loadArtifacts();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!artifactToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteArtifact(artifactToDelete.id);
      toast.success(`Deleted "${artifactToDelete.name}" from museum registry`);
      setIsDeleteOpen(false);
      setArtifactToDelete(null);
      loadArtifacts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete artifact');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="module-page-container">
      {/* Top Action Bar */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Artifacts & Collections Registry</h1>
          <p className="module-subtitle">
            Curatorial inventory and catalog for Government Museum Chennai
          </p>
        </div>

        {canManage && (
          <button className="btn btn-gold" onClick={handleOpenAdd}>
            <Plus size={18} /> Add New Artifact
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search artifacts by name, origin, material, or period..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>

        <div className="filter-group">
          <div className="select-wrapper">
            <label>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="select-wrapper">
            <label>Condition</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
            >
              {conditions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Artifacts Table & Card View */}
      {isLoading ? (
        <div className="page-loader-container">
          <div className="spinner" />
          <p>Querying museum vault database...</p>
        </div>
      ) : artifacts.length === 0 ? (
        <div className="empty-state-card">
          <Boxes size={48} className="empty-state-icon" />
          <h3>No Artifacts Found</h3>
          <p>No records match the active search criteria or filters.</p>
          {(search || selectedCategory !== 'All' || selectedCondition !== 'All') && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedCondition('All');
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive-wrapper card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Artifact</th>
                <th>Category</th>
                <th>Period & Origin</th>
                <th>Location</th>
                <th>Condition</th>
                <th>Acquired</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {artifacts.map((art) => (
                <tr key={art.id}>
                  <td>
                    <div className="table-item-primary">
                      {art.image_url ? (
                        <img
                          src={art.image_url}
                          alt={art.name}
                          className="table-thumbnail"
                        />
                      ) : (
                        <div className="table-thumbnail-placeholder">
                          <Boxes size={18} />
                        </div>
                      )}
                      <div>
                        <span className="table-item-title">{art.name}</span>
                        <span className="table-item-sub">{art.material || 'Various Materials'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{art.category}</span>
                  </td>
                  <td>
                    <div className="table-text-stacked">
                      <span>{art.period || 'Ancient Era'}</span>
                      <span className="text-muted text-xs">{art.origin || 'Tamil Nadu'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="table-location-text">
                      <MapPin size={13} /> {art.location}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={art.condition} type="condition" />
                  </td>
                  <td>
                    <span className="text-sm text-muted">
                      {art.acquisition_date
                        ? new Date(art.acquisition_date).toLocaleDateString()
                        : 'Historical Entry'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons-group">
                      <button
                        className="btn-icon"
                        title="View Details"
                        onClick={() => handleOpenDetail(art)}
                      >
                        <Eye size={16} />
                      </button>
                      {canManage && (
                        <>
                          <button
                            className="btn-icon btn-icon-edit"
                            title="Edit Artifact"
                            onClick={() => handleOpenEdit(art)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon btn-icon-delete"
                            title="Delete Artifact"
                            onClick={() => {
                              setArtifactToDelete(art);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Artifact Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingArtifact ? 'Edit Artifact Record' : 'Register New Artifact'}
        subtitle="Government Museum Chennai Collection Registry"
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="modal-form-grid">
          <div className="form-group col-span-2">
            <label>Artifact Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bronze Chola Nataraja"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories
                .filter((c) => c !== 'All')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Condition Status *</label>
            <select
              value={formData.condition}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  condition: e.target.value as Artifact['condition'],
                })
              }
            >
              {conditions
                .filter((c) => c !== 'All')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Historical Period / Era</label>
            <input
              type="text"
              placeholder="e.g. Chola Dynasty (11th Century CE)"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Geographic Origin / Discovery Site</label>
            <input
              type="text"
              placeholder="e.g. Thanjavur, Tamil Nadu, India"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Material Composition</label>
            <input
              type="text"
              placeholder="e.g. Bronze (Panchaloha), Granite, Teak Wood"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Museum Location / Gallery *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bronze Gallery - Display Case 01"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Acquisition Date</label>
            <input
              type="date"
              value={formData.acquisition_date}
              onChange={(e) =>
                setFormData({ ...formData, acquisition_date: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className="form-group col-span-2">
            <label>Curatorial Description & Significance</label>
            <textarea
              rows={3}
              placeholder="Enter detailed archaeological provenance, aesthetic attributes, and historical significance..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="modal-actions col-span-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFormModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-gold"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving Record...'
                : editingArtifact
                ? 'Update Artifact'
                : 'Save Artifact'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Artifact Details Modal */}
      {selectedArtifactDetail && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedArtifactDetail.artifact.name}
          subtitle={`Museum ID #${selectedArtifactDetail.artifact.id} • ${selectedArtifactDetail.artifact.category}`}
          maxWidth="xl"
        >
          <div className="artifact-detail-view">
            <div className="detail-top-grid">
              {selectedArtifactDetail.artifact.image_url && (
                <div className="detail-image-box">
                  <img
                    src={selectedArtifactDetail.artifact.image_url}
                    alt={selectedArtifactDetail.artifact.name}
                  />
                </div>
              )}
              <div className="detail-info-block">
                <div className="meta-pairs-grid">
                  <div>
                    <span className="label">Period:</span>
                    <span className="val">{selectedArtifactDetail.artifact.period || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="label">Origin:</span>
                    <span className="val">{selectedArtifactDetail.artifact.origin || 'Tamil Nadu'}</span>
                  </div>
                  <div>
                    <span className="label">Material:</span>
                    <span className="val">{selectedArtifactDetail.artifact.material || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="label">Condition:</span>
                    <span className="val">
                      <StatusBadge
                        status={selectedArtifactDetail.artifact.condition}
                        type="condition"
                      />
                    </span>
                  </div>
                  <div>
                    <span className="label">Gallery Location:</span>
                    <span className="val">{selectedArtifactDetail.artifact.location}</span>
                  </div>
                  <div>
                    <span className="label">Acquisition Date:</span>
                    <span className="val">
                      {selectedArtifactDetail.artifact.acquisition_date
                        ? new Date(
                            selectedArtifactDetail.artifact.acquisition_date
                          ).toLocaleDateString()
                        : 'Historical Archive'}
                    </span>
                  </div>
                </div>

                <div className="desc-box">
                  <h4>Curatorial Record</h4>
                  <p>{selectedArtifactDetail.artifact.description || 'No description entered.'}</p>
                </div>
              </div>
            </div>

            {/* Linked Conservation History */}
            <div className="detail-section">
              <h4 className="detail-section-title">Conservation History</h4>
              {selectedArtifactDetail.conservationRecords.length > 0 ? (
                <div className="timeline-list">
                  {selectedArtifactDetail.conservationRecords.map((c: any) => (
                    <div key={c.id} className="timeline-item">
                      <div className="timeline-meta">
                        <span className="timeline-date">
                          {new Date(c.conservation_date).toLocaleDateString()}
                        </span>
                        <span className="timeline-person">By {c.conservator}</span>
                        <span className="timeline-badge">
                          {c.condition_before} → {c.condition_after}
                        </span>
                      </div>
                      <p className="timeline-treatment">{c.treatment}</p>
                      {c.notes && <p className="timeline-notes">Notes: {c.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm">No conservation treatments logged for this artifact.</p>
              )}
            </div>

            {/* Linked Restoration History */}
            <div className="detail-section">
              <h4 className="detail-section-title">Restoration Projects</h4>
              {selectedArtifactDetail.restorationRecords.length > 0 ? (
                <div className="timeline-list">
                  {selectedArtifactDetail.restorationRecords.map((r: any) => (
                    <div key={r.id} className="timeline-item">
                      <div className="timeline-meta">
                        <span className="timeline-date">
                          {new Date(r.restoration_date).toLocaleDateString()}
                        </span>
                        <span className="timeline-person">{r.restored_by}</span>
                        <StatusBadge status={r.status} type="restoration" />
                        <span className="timeline-cost">₹{Number(r.cost).toLocaleString()}</span>
                      </div>
                      <p className="timeline-treatment">
                        <strong>{r.restoration_type}:</strong> {r.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm">No specialized restoration projects recorded.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Artifact Record"
        message={`Are you sure you want to permanently delete "${artifactToDelete?.name}" from Government Museum Chennai registry? This will also remove associated conservation and restoration logs.`}
        confirmLabel="Delete Artifact"
        isLoading={isSubmitting}
      />
    </div>
  );
};
