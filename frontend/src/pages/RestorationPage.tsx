import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RestorationRecord, Artifact } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  IndianRupee,
  Activity,
} from 'lucide-react';

export const RestorationPage: React.FC = () => {
  const { hasRole, user } = useAuth();
  const toast = useToast();

  const [records, setRecords] = useState<RestorationRecord[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedArtifactId, setSelectedArtifactId] = useState('All');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RestorationRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<RestorationRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialFormData = {
    artifact_id: '',
    restoration_date: new Date().toISOString().slice(0, 10),
    restored_by: 'Heritage Artifacts Restoration Lab, Chennai',
    restoration_type: '',
    description: '',
    cost: 0,
    status: 'Planned' as RestorationRecord['status'],
  };
  const [formData, setFormData] = useState(initialFormData);

  const canManage = hasRole('admin', 'conservator', 'curator', 'staff');
  const statuses = ['All', 'Planned', 'In Progress', 'Completed', 'Cancelled'];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [restRes, artRes] = await Promise.all([
        api.getRestorationRecords({
          status: selectedStatus !== 'All' ? selectedStatus : undefined,
          artifact_id: selectedArtifactId !== 'All' ? selectedArtifactId : undefined,
        }),
        api.getArtifacts(),
      ]);
      setRecords(restRes.restorationRecords);
      setArtifacts(artRes.artifacts);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load restoration records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedArtifactId]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      ...initialFormData,
      artifact_id: artifacts[0]?.id?.toString() || '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (rec: RestorationRecord) => {
    setEditingRecord(rec);
    setFormData({
      artifact_id: rec.artifact_id.toString(),
      restoration_date: rec.restoration_date ? rec.restoration_date.slice(0, 10) : '',
      restored_by: rec.restored_by,
      restoration_type: rec.restoration_type,
      description: rec.description || '',
      cost: Number(rec.cost) || 0,
      status: rec.status,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.artifact_id) {
      toast.error('Please select an artifact');
      return;
    }
    if (!formData.restored_by.trim()) {
      toast.error('Restoration specialist / laboratory is required');
      return;
    }
    if (!formData.restoration_type.trim()) {
      toast.error('Restoration type / procedure title is required');
      return;
    }
    if (Number(formData.cost) < 0) {
      toast.error('Cost cannot be negative');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        artifact_id: parseInt(formData.artifact_id, 10),
        restoration_date: formData.restoration_date,
        restored_by: formData.restored_by.trim(),
        restoration_type: formData.restoration_type.trim(),
        description: formData.description.trim(),
        cost: Number(formData.cost),
        status: formData.status,
      };

      if (editingRecord) {
        await api.updateRestorationRecord(editingRecord.id, payload);
        toast.success('Restoration project record updated');
      } else {
        await api.createRestorationRecord(payload);
        toast.success('Restoration project logged successfully');
      }
      setIsFormModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteRestorationRecord(recordToDelete.id);
      toast.success('Restoration record deleted');
      setIsDeleteOpen(false);
      setRecordToDelete(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="module-page-container">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Artifact Restoration Projects</h1>
          <p className="module-subtitle">
            Major structural repairs, ceramic reassembly, passivation, and expenditure logs
          </p>
        </div>

        {canManage && (
          <button className="btn btn-gold" onClick={handleOpenAdd}>
            <Plus size={18} /> New Restoration Project
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
            <label>Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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

      {/* Table */}
      {isLoading ? (
        <div className="page-loader-container">
          <div className="spinner" />
          <p>Loading restoration project records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state-card">
          <Wrench size={48} className="empty-state-icon" />
          <h3>No Restoration Projects Found</h3>
          <p>No records match the selected status or artifact criteria.</p>
        </div>
      ) : (
        <div className="table-responsive-wrapper card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Artifact</th>
                <th>Restoration Type</th>
                <th>Restored By / Lab</th>
                <th>Date</th>
                <th>Status</th>
                <th>Cost (INR)</th>
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
                    <div className="table-text-stacked">
                      <span className="font-medium">{rec.restoration_type}</span>
                      <span className="text-muted text-xs truncate max-w-xs">{rec.description}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm">{rec.restored_by}</span>
                  </td>
                  <td>
                    <span className="text-sm">
                      <Calendar size={13} className="inline mr-1" />
                      {new Date(rec.restoration_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={rec.status} type="restoration" />
                  </td>
                  <td>
                    <span className="cost-tag">₹{Number(rec.cost).toLocaleString()}</span>
                  </td>
                  {canManage && (
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          className="btn-icon btn-icon-edit"
                          title="Edit Project"
                          onClick={() => handleOpenEdit(rec)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          title="Delete Project"
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
        title={editingRecord ? 'Edit Restoration Project' : 'New Restoration Project'}
        subtitle="Government Museum Chennai Specialist Restoration Division"
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="modal-form-grid">
          <div className="form-group col-span-2">
            <label>Target Artifact *</label>
            <select
              required
              value={formData.artifact_id}
              onChange={(e) => setFormData({ ...formData, artifact_id: e.target.value })}
            >
              <option value="" disabled>
                Select artifact...
              </option>
              {artifacts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category} • Location: {a.location})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Restoration Date *</label>
            <input
              type="date"
              required
              value={formData.restoration_date}
              onChange={(e) =>
                setFormData({ ...formData, restoration_date: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Restored By / Specialist Lab *</label>
            <input
              type="text"
              required
              placeholder="e.g. Metallurgical Conservation Wing"
              value={formData.restored_by}
              onChange={(e) => setFormData({ ...formData, restored_by: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Restoration Type / Procedure *</label>
            <input
              type="text"
              required
              placeholder="e.g. Structural Ceramic Reassembly & Loss Compensation"
              value={formData.restoration_type}
              onChange={(e) =>
                setFormData({ ...formData, restoration_type: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Status *</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as RestorationRecord['status'],
                })
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
            <label>Estimated / Approved Cost (INR ₹) *</label>
            <input
              type="number"
              min="0"
              step="100"
              required
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
            />
          </div>

          <div className="form-group col-span-2">
            <label>Detailed Technical Description & Scientific Analysis</label>
            <textarea
              rows={3}
              placeholder="Detail bonding agents (e.g. Paraloid B-72), infills, chemical inhibitors, or reconstructive steps..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                ? 'Saving...'
                : editingRecord
                ? 'Update Project'
                : 'Save Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Restoration Record"
        message={`Delete restoration record for "${recordToDelete?.artifact_name}" (${recordToDelete?.restoration_type})?`}
        confirmLabel="Delete Record"
        isLoading={isSubmitting}
      />
    </div>
  );
};
