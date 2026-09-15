import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ConservationRecord, Artifact } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

export const ConservationPage: React.FC = () => {
  const { hasRole, user } = useAuth();
  const toast = useToast();

  const [records, setRecords] = useState<ConservationRecord[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedArtifactId, setSelectedArtifactId] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ConservationRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<ConservationRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialFormData = {
    artifact_id: '',
    conservation_date: new Date().toISOString().slice(0, 10),
    conservator: user?.name || 'Arunmozhi Varman',
    condition_before: 'Fair',
    condition_after: 'Good',
    treatment: '',
    notes: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  const canManage = hasRole('admin', 'conservator', 'curator', 'staff');

  const conditions = ['All', 'Pristine', 'Good', 'Fair', 'Fragile', 'Critical', 'Under Restoration'];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [consRes, artRes] = await Promise.all([
        api.getConservationRecords({
          artifact_id: selectedArtifactId !== 'All' ? selectedArtifactId : undefined,
          condition: selectedCondition !== 'All' ? selectedCondition : undefined,
        }),
        api.getArtifacts(),
      ]);
      setRecords(consRes.conservationRecords);
      setArtifacts(artRes.artifacts);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load conservation records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedArtifactId, selectedCondition]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      ...initialFormData,
      artifact_id: artifacts[0]?.id?.toString() || '',
      conservator: user?.name || 'Arunmozhi Varman',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (rec: ConservationRecord) => {
    setEditingRecord(rec);
    setFormData({
      artifact_id: rec.artifact_id.toString(),
      conservation_date: rec.conservation_date ? rec.conservation_date.slice(0, 10) : '',
      conservator: rec.conservator,
      condition_before: rec.condition_before,
      condition_after: rec.condition_after,
      treatment: rec.treatment,
      notes: rec.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.artifact_id) {
      toast.error('Please select an artifact');
      return;
    }
    if (!formData.treatment.trim()) {
      toast.error('Treatment procedure is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        artifact_id: parseInt(formData.artifact_id, 10),
        conservation_date: formData.conservation_date,
        conservator: formData.conservator.trim(),
        condition_before: formData.condition_before,
        condition_after: formData.condition_after,
        treatment: formData.treatment.trim(),
        notes: formData.notes.trim() || undefined,
      };

      if (editingRecord) {
        await api.updateConservationRecord(editingRecord.id, payload);
        toast.success('Conservation record updated successfully');
      } else {
        await api.createConservationRecord(payload);
        toast.success('Conservation treatment logged successfully');
      }
      setIsFormModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save conservation record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteConservationRecord(recordToDelete.id);
      toast.success('Conservation log removed successfully');
      setIsDeleteOpen(false);
      setRecordToDelete(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete conservation record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="module-page-container">
      {/* Top Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Conservation & Preservation Wing</h1>
          <p className="module-subtitle">
            Scientific condition assessments, chemical stabilization, and treatments
          </p>
        </div>

        {canManage && (
          <button className="btn btn-gold" onClick={handleOpenAdd}>
            <Plus size={18} /> Log Conservation Treatment
          </button>
        )}
      </div>

      {/* Filter Card */}
      <div className="filter-card">
        <div className="filter-group">
          <div className="select-wrapper">
            <label>Filter by Artifact</label>
            <select
              value={selectedArtifactId}
              onChange={(e) => setSelectedArtifactId(e.target.value)}
            >
              <option value="All">All Artifacts</option>
              {artifacts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="select-wrapper">
            <label>Condition Status</label>
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

      {/* Table */}
      {isLoading ? (
        <div className="page-loader-container">
          <div className="spinner" />
          <p>Loading conservation registry records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state-card">
          <ShieldCheck size={48} className="empty-state-icon" />
          <h3>No Conservation Records</h3>
          <p>No treatments match the selected criteria.</p>
        </div>
      ) : (
        <div className="table-responsive-wrapper card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Artifact</th>
                <th>Treatment Date</th>
                <th>Conservator</th>
                <th>Condition Trajectory</th>
                <th>Treatment Performed</th>
                <th>Curatorial Notes</th>
                {canManage && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <div className="table-item-primary">
                      <div>
                        <span className="table-item-title">{rec.artifact_name}</span>
                        <span className="table-item-sub">{rec.category || 'Museum Collection'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm">
                      <Calendar size={13} className="inline mr-1" />
                      {new Date(rec.conservation_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm font-medium">{rec.conservator}</span>
                  </td>
                  <td>
                    <span className="condition-transition-pill">
                      <span className="before">{rec.condition_before}</span>
                      <span className="arrow">→</span>
                      <span className="after">{rec.condition_after}</span>
                    </span>
                  </td>
                  <td>
                    <p className="treatment-text-cell">{rec.treatment}</p>
                  </td>
                  <td>
                    <span className="notes-text-cell">{rec.notes || '—'}</span>
                  </td>
                  {canManage && (
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          className="btn-icon btn-icon-edit"
                          title="Edit Log"
                          onClick={() => handleOpenEdit(rec)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          title="Delete Log"
                          onClick={() => {
                            setRecordToDelete(rec);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingRecord ? 'Edit Conservation Record' : 'Log Conservation Treatment'}
        subtitle="Government Museum Chennai Conservation Division"
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="modal-form-grid">
          <div className="form-group col-span-2">
            <label>Artifact *</label>
            <select
              required
              value={formData.artifact_id}
              onChange={(e) => setFormData({ ...formData, artifact_id: e.target.value })}
            >
              <option value="" disabled>
                Select artifact from museum registry...
              </option>
              {artifacts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category} • Current Condition: {a.condition})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Treatment Date *</label>
            <input
              type="date"
              required
              value={formData.conservation_date}
              onChange={(e) =>
                setFormData({ ...formData, conservation_date: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Conservator Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Arunmozhi Varman"
              value={formData.conservator}
              onChange={(e) => setFormData({ ...formData, conservator: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Condition Before *</label>
            <select
              value={formData.condition_before}
              onChange={(e) =>
                setFormData({ ...formData, condition_before: e.target.value })
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
            <label>Condition After *</label>
            <select
              value={formData.condition_after}
              onChange={(e) =>
                setFormData({ ...formData, condition_after: e.target.value })
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

          <div className="form-group col-span-2">
            <label>Conservation Treatment Applied *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe cleaning methods, consolidants, microcrystalline waxes, poultices, or environmental stabilization..."
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
            />
          </div>

          <div className="form-group col-span-2">
            <label>Notes & Monitoring Recommendations</label>
            <textarea
              rows={2}
              placeholder="Relative humidity thresholds, UV illumination parameters, or follow-up inspection dates..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
              {isSubmitting
                ? 'Logging...'
                : editingRecord
                ? 'Update Record'
                : 'Save Conservation Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Conservation Record"
        message={`Delete conservation treatment log dated ${
          recordToDelete?.conservation_date
            ? new Date(recordToDelete.conservation_date).toLocaleDateString()
            : ''
        } for "${recordToDelete?.artifact_name}"?`}
        confirmLabel="Delete Log"
        isLoading={isSubmitting}
      />
    </div>
  );
};
