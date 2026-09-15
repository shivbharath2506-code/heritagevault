import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { VisitorRecord, Exhibition } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Users,
  Plus,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  TrendingUp,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';

export const VisitorsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const toast = useToast();

  const [records, setRecords] = useState<VisitorRecord[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [summary, setSummary] = useState<{ totalVisitors: number; averageDaily: number; recordCount: number }>({
    totalVisitors: 0,
    averageDaily: 0,
    recordCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedExhibitionId, setSelectedExhibitionId] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VisitorRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<VisitorRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialFormData = {
    visit_date: new Date().toISOString().slice(0, 10),
    visitor_count: 350,
    exhibition_id: '' as string,
  };
  const [formData, setFormData] = useState(initialFormData);

  const canManage = hasRole('admin', 'curator', 'staff');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [visRes, exhRes] = await Promise.all([
        api.getVisitorRecords({
          exhibition_id: selectedExhibitionId !== 'All' ? selectedExhibitionId : undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        }),
        api.getExhibitions(),
      ]);
      setRecords(visRes.visitorRecords);
      setSummary(visRes.summary);
      setExhibitions(exhRes.exhibitions);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load visitor records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedExhibitionId, startDate, endDate]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData(initialFormData);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (rec: VisitorRecord) => {
    setEditingRecord(rec);
    setFormData({
      visit_date: rec.visit_date ? rec.visit_date.slice(0, 10) : '',
      visitor_count: Number(rec.visitor_count) || 0,
      exhibition_id: rec.exhibition_id ? rec.exhibition_id.toString() : '',
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visit_date) {
      toast.error('Visit date is required');
      return;
    }
    const count = parseInt(String(formData.visitor_count), 10);
    if (isNaN(count) || count < 0) {
      toast.error('Visitor count must be a positive integer');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        visit_date: formData.visit_date,
        visitor_count: count,
        exhibition_id: formData.exhibition_id ? parseInt(formData.exhibition_id, 10) : null,
      };

      if (editingRecord) {
        await api.updateVisitorRecord(editingRecord.id, payload);
        toast.success('Visitor entry updated successfully');
      } else {
        await api.createVisitorRecord(payload);
        toast.success('Visitor headcount recorded successfully');
      }
      setIsFormModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log visitors');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    setIsSubmitting(true);
    try {
      await api.deleteVisitorRecord(recordToDelete.id);
      toast.success('Visitor entry deleted');
      setIsDeleteOpen(false);
      setRecordToDelete(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="module-page-container">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Visitor Attendance & Admission Logs</h1>
          <p className="module-subtitle">
            Daily footfall tracking for galleries, exhibitions, and special events
          </p>
        </div>

        {canManage && (
          <button className="btn btn-gold" onClick={handleOpenAdd}>
            <Plus size={18} /> Record Daily Footfall
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="visitor-kpi-strip">
        <div className="v-stat-card card">
          <span className="v-stat-label">Total Filtered Visitors</span>
          <span className="v-stat-value text-amber-500">
            {(summary.totalVisitors || 0).toLocaleString()}
          </span>
        </div>
        <div className="v-stat-card card">
          <span className="v-stat-label">Average Daily Attendance</span>
          <span className="v-stat-value text-primary">
            {(summary.averageDaily || 0).toLocaleString()} / day
          </span>
        </div>
        <div className="v-stat-card card">
          <span className="v-stat-label">Recorded Days</span>
          <span className="v-stat-value text-emerald-500">{summary.recordCount} Days</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-card">
        <div className="filter-group">
          <div className="select-wrapper">
            <label>Exhibition / Gallery Filter</label>
            <select
              value={selectedExhibitionId}
              onChange={(e) => setSelectedExhibitionId(e.target.value)}
            >
              <option value="All">All Admissions (General & Special)</option>
              {exhibitions.map((exh) => (
                <option key={exh.id} value={exh.id}>
                  {exh.name}
                </option>
              ))}
            </select>
          </div>

          <div className="date-filter-item">
            <label>From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="date-filter-item">
            <label>To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {(startDate || endDate || selectedExhibitionId !== 'All') && (
            <button
              className="btn btn-secondary btn-sm self-end"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSelectedExhibitionId('All');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="page-loader-container">
          <div className="spinner" />
          <p>Calculating museum admission counts...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state-card">
          <Users size={48} className="empty-state-icon" />
          <h3>No Visitor Logs Found</h3>
          <p>No admission logs recorded for the selected dates.</p>
        </div>
      ) : (
        <div className="table-responsive-wrapper card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Visit Date</th>
                <th>Admission Scope / Program</th>
                <th>Daily Headcount</th>
                <th>Museum Code</th>
                {canManage && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <span className="font-semibold">
                      <Calendar size={13} className="inline mr-1 text-amber-500" />
                      {new Date(rec.visit_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-primary">
                      {rec.exhibition_name ? (
                        <>
                          <Sparkles size={12} className="inline mr-1" />
                          {rec.exhibition_name}
                        </>
                      ) : (
                        'General Permanent Gallery Admission'
                      )}
                    </span>
                  </td>
                  <td>
                    <span className="visitor-count-badge">
                      <Users size={14} />
                      {Number(rec.visitor_count).toLocaleString()} visitors
                    </span>
                  </td>
                  <td>
                    <span className="text-muted text-xs">CHN-MUS-001</span>
                  </td>
                  {canManage && (
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          className="btn-icon btn-icon-edit"
                          title="Edit Entry"
                          onClick={() => handleOpenEdit(rec)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          title="Delete Entry"
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
        title={editingRecord ? 'Edit Visitor Admission Record' : 'Record Daily Museum Headcount'}
        subtitle="Government Museum Chennai Admission Registry"
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="modal-form-grid">
          <div className="form-group col-span-2">
            <label>Date of Visit *</label>
            <input
              type="date"
              required
              value={formData.visit_date}
              onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
            />
          </div>

          <div className="form-group col-span-2">
            <label>Recorded Visitor Headcount *</label>
            <input
              type="number"
              min="0"
              required
              placeholder="e.g. 450"
              value={formData.visitor_count}
              onChange={(e) =>
                setFormData({ ...formData, visitor_count: Number(e.target.value) })
              }
            />
          </div>

          <div className="form-group col-span-2">
            <label>Attributed Exhibition / Gallery Program</label>
            <select
              value={formData.exhibition_id}
              onChange={(e) => setFormData({ ...formData, exhibition_id: e.target.value })}
            >
              <option value="">General Permanent Admission (All Galleries)</option>
              {exhibitions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.status})
                </option>
              ))}
            </select>
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
                ? 'Recording...'
                : editingRecord
                ? 'Update Count'
                : 'Save Visitor Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Visitor Headcount Entry"
        message={`Delete recorded entry for ${
          recordToDelete?.visit_date
            ? new Date(recordToDelete.visit_date).toLocaleDateString()
            : ''
        } (${recordToDelete?.visitor_count} visitors)?`}
        confirmLabel="Delete Entry"
        isLoading={isSubmitting}
      />
    </div>
  );
};
