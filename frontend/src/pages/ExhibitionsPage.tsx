import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Exhibition, Artifact } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Sparkles,
  Plus,
  Search,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  Eye,
  Boxes,
  Users,
  CheckSquare,
} from 'lucide-react';

export const ExhibitionsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const toast = useToast();

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const [selectedExhibitionDetail, setSelectedExhibitionDetail] = useState<{
    exhibition: Exhibition;
    artifacts: Artifact[];
    visitorRecords: any[];
  } | null>(null);
  const [exhibitionToDelete, setExhibitionToDelete] = useState<Exhibition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialFormData = {
    name: '',
    description: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    location: '',
    status: 'Planned' as Exhibition['status'],
    artifact_ids: [] as number[],
  };
  const [formData, setFormData] = useState(initialFormData);

  const canManage = hasRole('admin', 'curator', 'conservator', 'staff');
  const statuses = ['All', 'Planned', 'Active', 'Completed', 'Cancelled'];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [exhRes, artRes] = await Promise.all([
        api.getExhibitions({
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: search || undefined,
        }),
        api.getArtifacts(),
      ]);
      setExhibitions(exhRes.exhibitions);
      setArtifacts(artRes.artifacts);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load exhibitions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const handleOpenAdd = () => {
    setEditingExhibition(null);
    setFormData(initialFormData);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = async (exh: Exhibition) => {
    setEditingExhibition(exh);
    try {
      const detail = await api.getExhibitionById(exh.id);
      setFormData({
        name: exh.name,
        description: exh.description || '',
        start_date: exh.start_date ? exh.start_date.slice(0, 10) : '',
        end_date: exh.end_date ? exh.end_date.slice(0, 10) : '',
        location: exh.location,
        status: exh.status,
        artifact_ids: detail.artifacts.map((a) => a.id),
      });
      setIsFormModalOpen(true);
    } catch (err) {
      toast.error('Failed to load exhibition details for editing');
    }
  };

  const handleOpenDetail = async (exh: Exhibition) => {
    try {
      const detail = await api.getExhibitionById(exh.id);
      setSelectedExhibitionDetail(detail);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load exhibition showcase');
    }
  };

  const handleToggleArtifact = (artId: number) => {
    setFormData((prev) => {
      const exists = prev.artifact_ids.includes(artId);
      if (exists) {
        return { ...prev, artifact_ids: prev.artifact_ids.filter((id) => id !== artId) };
      } else {
        return { ...prev, artifact_ids: [...prev.artifact_ids, artId] };
      }
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Exhibition name is required');
      return;
    }
    if (!formData.start_date) {
      toast.error('Start date is required');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Gallery location is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingExhibition) {
        await api.updateExhibition(editingExhibition.id, formData);
        toast.success(`Updated "${formData.name}" successfully`);
      } else {
        await api.createExhibition(formData);
        toast.success(`Exhibition "${formData.name}" scheduled successfully`);
      }
      setIsFormModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save exhibition');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!exhibitionToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteExhibition(exhibitionToDelete.id);
      toast.success(`Deleted "${exhibitionToDelete.name}" exhibition record`);
      setIsDeleteOpen(false);
      setExhibitionToDelete(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete exhibition');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="module-page-container">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Curatorial Exhibitions Management</h1>
          <p className="module-subtitle">
            Curate temporary expositions, permanent galleries, and showcase itineraries
          </p>
        </div>

        {canManage && (
          <button className="btn btn-gold" onClick={handleOpenAdd}>
            <Plus size={18} /> Schedule Exhibition
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search exhibitions by title, description, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="select-wrapper">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exhibitions Grid / Cards */}
      {isLoading ? (
        <div className="page-loader-container">
          <div className="spinner" />
          <p>Loading exhibition program schedule...</p>
        </div>
      ) : exhibitions.length === 0 ? (
        <div className="empty-state-card">
          <Sparkles size={48} className="empty-state-icon" />
          <h3>No Exhibitions Scheduled</h3>
          <p>No exhibitions match your search or filter parameters.</p>
        </div>
      ) : (
        <div className="exhibitions-admin-grid">
          {exhibitions.map((exh) => (
            <div key={exh.id} className="exhibition-admin-card card">
              <div className="exh-card-top">
                <StatusBadge status={exh.status} type="exhibition" />
                <span className="exh-loc-badge">
                  <MapPin size={13} /> {exh.location}
                </span>
              </div>

              <h3 className="exh-card-title">{exh.name}</h3>
              <p className="exh-card-description">{exh.description || 'No description provided.'}</p>

              <div className="exh-stats-row">
                <div className="exh-stat">
                  <Boxes size={15} />
                  <span>{exh.artifact_count || 0} Linked Artifacts</span>
                </div>
                <div className="exh-stat">
                  <Users size={15} />
                  <span>{Number(exh.total_visitors || 0).toLocaleString()} Visitors</span>
                </div>
              </div>

              <div className="exh-card-footer">
                <div className="exh-date-range">
                  <Calendar size={14} />
                  <span>
                    {new Date(exh.start_date).toLocaleDateString()}
                    {exh.end_date ? ` – ${new Date(exh.end_date).toLocaleDateString()}` : ' (Ongoing)'}
                  </span>
                </div>

                <div className="action-buttons-group">
                  <button
                    className="btn-icon"
                    title="View Showcase"
                    onClick={() => handleOpenDetail(exh)}
                  >
                    <Eye size={16} />
                  </button>
                  {canManage && (
                    <>
                      <button
                        className="btn-icon btn-icon-edit"
                        title="Edit Exhibition"
                        onClick={() => handleOpenEdit(exh)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon btn-icon-delete"
                        title="Delete Exhibition"
                        onClick={() => {
                          setExhibitionToDelete(exh);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingExhibition ? 'Edit Exhibition Program' : 'Schedule New Exhibition'}
        subtitle="Government Museum Chennai Curatorial Wing"
        maxWidth="xl"
      >
        <form onSubmit={handleFormSubmit} className="modal-form-grid">
          <div className="form-group col-span-2">
            <label>Exhibition Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Splendours of the Chola Empire: Bronzes & Inscriptions"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>End Date (Optional for Permanent)</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Location / Hall *</label>
            <input
              type="text"
              required
              placeholder="e.g. Special Exhibition Pavilion A"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Status *</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as Exhibition['status'] })
              }
            >
              {statuses
                .filter((s) => s !== 'All')
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group col-span-2">
            <label>Exhibition Curatorial Statement / Description</label>
            <textarea
              rows={3}
              placeholder="Provide historical context, themes, and curated narrative..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Associate Artifacts Selector */}
          <div className="form-group col-span-2">
            <label>Link Artifacts from Vault ({formData.artifact_ids.length} selected)</label>
            <div className="artifact-selection-checklist">
              {artifacts.map((a) => {
                const isSelected = formData.artifact_ids.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={`artifact-checkbox-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleArtifact(a.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    <div className="chk-info">
                      <span className="chk-title">{a.name}</span>
                      <span className="chk-sub">{a.category} • {a.period}</span>
                    </div>
                  </div>
                );
              })}
            </div>
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
            <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : editingExhibition
                ? 'Update Exhibition'
                : 'Save Exhibition'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedExhibitionDetail && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedExhibitionDetail.exhibition.name}
          subtitle={`${selectedExhibitionDetail.exhibition.location} • ${selectedExhibitionDetail.exhibition.status}`}
          maxWidth="xl"
        >
          <div className="exhibition-detail-view">
            <div className="detail-meta-grid">
              <div className="meta-item">
                <span className="meta-label">Schedule Duration</span>
                <span className="meta-val">
                  {new Date(selectedExhibitionDetail.exhibition.start_date).toLocaleDateString()}
                  {selectedExhibitionDetail.exhibition.end_date
                    ? ` – ${new Date(selectedExhibitionDetail.exhibition.end_date).toLocaleDateString()}`
                    : ' (Ongoing)'}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Venue Location</span>
                <span className="meta-val">{selectedExhibitionDetail.exhibition.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Status</span>
                <span className="meta-val">
                  <StatusBadge
                    status={selectedExhibitionDetail.exhibition.status}
                    type="exhibition"
                  />
                </span>
              </div>
            </div>

            <div className="desc-box">
              <h4>Exhibition Overview</h4>
              <p>{selectedExhibitionDetail.exhibition.description || 'No description recorded.'}</p>
            </div>

            <div className="detail-section">
              <h4 className="detail-section-title">
                Exhibited Masterpieces ({selectedExhibitionDetail.artifacts.length})
              </h4>
              {selectedExhibitionDetail.artifacts.length > 0 ? (
                <div className="exhibited-artifacts-grid">
                  {selectedExhibitionDetail.artifacts.map((art) => (
                    <div key={art.id} className="exhibited-art-item card">
                      {art.image_url ? (
                        <img src={art.image_url} alt={art.name} />
                      ) : (
                        <div className="placeholder-art-icon">
                          <Boxes size={24} />
                        </div>
                      )}
                      <div className="exhibited-art-text">
                        <h5>{art.name}</h5>
                        <span>{art.category} • {art.period}</span>
                        <StatusBadge status={art.condition} type="condition" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm">No artifacts specifically linked to this exhibition yet.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Exhibition Record"
        message={`Are you sure you want to delete the exhibition "${exhibitionToDelete?.name}"?`}
        confirmLabel="Delete Exhibition"
        isLoading={isSubmitting}
      />
    </div>
  );
};
