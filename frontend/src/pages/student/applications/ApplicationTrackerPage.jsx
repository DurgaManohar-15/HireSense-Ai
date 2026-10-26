import React, { useState, useEffect } from 'react';
import { applicationApi } from '../../../api/applicationApi';
import {
  Briefcase,
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  MoreVertical,
  Trash2,
  ExternalLink,
  Edit2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

export const ApplicationTrackerPage = () => {
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Application Form
  const [newApp, setNewApp] = useState({
    companyName: '',
    roleTitle: '',
    jobUrl: '',
    location: '',
    salaryOffered: '',
    status: 'APPLIED',
    notes: '',
  });

  const columns = [
    { id: 'SAVED', label: 'Saved', color: 'border-[#202934] bg-[#151B22] text-[#8B949E]' },
    { id: 'APPLIED', label: 'Applied', color: 'border-[#20D3C2]/30 bg-[#20D3C2]/10 text-[#20D3C2]' },
    { id: 'ASSESSMENT', label: 'OA / Test', color: 'border-[#E8C982]/30 bg-[#E8C982]/10 text-[#E8C982]' },
    { id: 'INTERVIEW', label: 'Interview', color: 'border-[#35D07F]/30 bg-[#35D07F]/10 text-[#35D07F]' },
    { id: 'OFFER', label: 'Offer Received', color: 'border-[#35D07F]/40 bg-[#35D07F]/15 text-[#35D07F]' },
    { id: 'REJECTED', label: 'Rejected', color: 'border-[#FF5A5F]/30 bg-[#FF5A5F]/10 text-[#FF5A5F]' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appList, stats] = await Promise.all([
        applicationApi.getMyApplications(),
        applicationApi.getAnalytics(),
      ]);
      setApplications(appList || []);
      setAnalytics(stats);
    } catch (err) {
      console.error('Failed to load application tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await applicationApi.createApplication(newApp);
      setApplications((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewApp({
        companyName: '',
        roleTitle: '',
        jobUrl: '',
        location: '',
        salaryOffered: '',
        status: 'APPLIED',
        notes: '',
      });
      // refresh stats
      const stats = await applicationApi.getAnalytics();
      setAnalytics(stats);
    } catch (err) {
      console.error('Failed to create application:', err);
    }
  };

  const handleMoveStage = async (id, newStatus) => {
    try {
      const updated = await applicationApi.updateStatus(id, newStatus, `Moved to ${newStatus}`);
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
      const stats = await applicationApi.getAnalytics();
      setAnalytics(stats);
    } catch (err) {
      console.error('Failed to move stage:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application record?')) return;
    try {
      await applicationApi.deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      const stats = await applicationApi.getAnalytics();
      setAnalytics(stats);
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-[#F8FAFC]">
      {/* Top Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#202934] bg-gradient-to-b from-[#151B22] via-[#10161C] to-[#0A0E13] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B22] border border-[#202934] text-[#E8C982] text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5 text-[#E8C982]" />
            <span>Placement Funnel Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Application Kanban Tracker</h1>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-1 max-w-xl">
            Visualize and manage your entire campus and off-campus recruitment pipeline.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] shadow-[0_2px_14px_rgba(232,201,130,0.25)] flex items-center gap-2 self-start sm:self-auto transition-all duration-150 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#05070A]" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Analytics Summary Ribbon */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#10161C] border border-[#202934] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <span className="text-xs text-[#8B949E] block mb-1 font-medium">Total Tracked</span>
            <div className="text-2xl font-bold text-white font-mono">{analytics.totalApplications}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#10161C] border border-[#202934] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <span className="text-xs text-[#8B949E] block mb-1 font-medium">Active in Pipeline</span>
            <div className="text-2xl font-bold text-[#20D3C2] font-mono">{analytics.activeApplications}</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#10161C] border border-[#202934] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <span className="text-xs text-[#8B949E] block mb-1 font-medium">Interview Rate</span>
            <div className="text-2xl font-bold text-[#E8C982] font-mono">{analytics.interviewConversionRate}%</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#10161C] border border-[#202934] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <span className="text-xs text-[#8B949E] block mb-1 font-medium">Placement Offers</span>
            <div className="text-2xl font-bold text-[#35D07F] font-mono">{analytics.offerCount}</div>
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8B949E] text-xs gap-3">
          <div className="w-8 h-8 border-2 border-[#202934] border-t-[#E8C982] rounded-full animate-spin"></div>
          <span>Loading recruitment pipeline...</span>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[520px]">
          {columns.map((col, colIdx) => {
            const colApps = applications.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl bg-[#0D1217] border border-[#202934] p-3.5 min-w-[250px] max-w-[280px] flex-1 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#202934]">
                  <span className={`text-xs font-bold ${col.color.split(' ')[2]}`}>{col.label}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#151B22] text-[#8B949E] border border-[#202934] font-mono">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colApps.length === 0 ? (
                    <div className="text-center py-10 text-[#6F7783] text-xs border border-dashed border-[#202934] rounded-xl">
                      No applications
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-xl bg-[#10161C] border border-[#202934] hover:border-[#E8C982]/40 transition-all duration-200 text-xs space-y-2 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-white group-hover:text-[#E8C982] transition-colors block">{app.companyName}</span>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="text-[#6F7783] hover:text-[#FF5A5F] p-1 rounded transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[11px] text-[#8B949E]">{app.roleTitle}</p>

                        {app.location && (
                          <span className="text-[10px] text-[#6F7783] block">{app.location}</span>
                        )}

                        {app.notes && (
                          <p className="text-[10px] text-[#8B949E] bg-[#11171D] p-2 rounded-lg border border-[#202934] italic">
                            "{app.notes}"
                          </p>
                        )}

                        {/* Move stage buttons */}
                        <div className="pt-2 border-t border-[#202934] flex items-center justify-between">
                          {colIdx > 0 ? (
                            <button
                              onClick={() => handleMoveStage(app.id, columns[colIdx - 1].id)}
                              className="text-[10px] text-[#8B949E] hover:text-white flex items-center gap-0.5 transition-colors cursor-pointer"
                              title={`Move to ${columns[colIdx - 1].label}`}
                            >
                              <ChevronLeft className="w-3 h-3" /> Back
                            </button>
                          ) : (
                            <div />
                          )}

                          {colIdx < columns.length - 1 && (
                            <button
                              onClick={() => handleMoveStage(app.id, columns[colIdx + 1].id)}
                              className="text-[10px] font-semibold text-[#E8C982] hover:text-[#F5DFA8] flex items-center gap-0.5 transition-colors cursor-pointer"
                              title={`Advance to ${columns[colIdx + 1].label}`}
                            >
                              Advance <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10161C] border border-[#202934] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#202934]">
              <h3 className="text-sm font-bold text-white">Add New Application</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#8B949E] hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8B949E] mb-1 font-medium">Company Name *</label>
                <input
                  required
                  type="text"
                  value={newApp.companyName}
                  onChange={(e) => setNewApp({ ...newApp, companyName: e.target.value })}
                  placeholder="e.g. Amazon, Deloitte, Infosys"
                  className="w-full px-3 py-2 rounded-xl bg-[#11171D] border border-[#202934] text-white focus:outline-none focus:border-[#E8C982]"
                />
              </div>

              <div>
                <label className="block text-[#8B949E] mb-1 font-medium">Role Title *</label>
                <input
                  required
                  type="text"
                  value={newApp.roleTitle}
                  onChange={(e) => setNewApp({ ...newApp, roleTitle: e.target.value })}
                  placeholder="e.g. SDE 1, Graduate Trainee"
                  className="w-full px-3 py-2 rounded-xl bg-[#11171D] border border-[#202934] text-white focus:outline-none focus:border-[#E8C982]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B949E] mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    value={newApp.location}
                    onChange={(e) => setNewApp({ ...newApp, location: e.target.value })}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3 py-2 rounded-xl bg-[#11171D] border border-[#202934] text-white focus:outline-none focus:border-[#E8C982]"
                  />
                </div>
                <div>
                  <label className="block text-[#8B949E] mb-1 font-medium">Current Stage</label>
                  <select
                    value={newApp.status}
                    onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#11171D] border border-[#202934] text-white focus:outline-none focus:border-[#E8C982]"
                  >
                    {columns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#8B949E] mb-1 font-medium">Job URL / Portal Link</label>
                <input
                  type="url"
                  value={newApp.jobUrl}
                  onChange={(e) => setNewApp({ ...newApp, jobUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-[#11171D] border border-[#202934] text-white focus:outline-none focus:border-[#E8C982]"
                />
              </div>

              <div>
                <label className="block text-[#8B949E] mb-1 font-medium">Notes / Referral Details</label>
                <textarea
                  rows={2}
                  value={newApp.notes}
                  onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                  placeholder="Applied with Master Resume; referred by senior alumnus..."
                  className="w-full px-3 py-2 rounded-xl bg-[#11171D] border border-[#202934] text-white focus:outline-none focus:border-[#E8C982]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202934]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-[#8B949E] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] font-bold shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
