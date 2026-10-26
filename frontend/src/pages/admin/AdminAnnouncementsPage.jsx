import React, { useState, useEffect, useMemo } from 'react';
import { platformApi } from '../../api/platformApi';
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Search,
  Filter,
  Users,
  BellRing,
  Sparkles,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';

export const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL_STUDENTS');
  const [priority, setPriority] = useState('NORMAL');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const formatAnnouncementDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) + ' at ' + d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateStr);
    }
  };

  const loadAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await platformApi.getAllAnnouncementsAdmin();
      if (res && res.success) {
        setAnnouncements(res.data || []);
      } else if (Array.isArray(res)) {
        setAnnouncements(res);
      } else if (res && res.data) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
      setError(err.message || 'Failed to load announcements from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both title and announcement details.');
      return;
    }

    setCreating(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await platformApi.createAnnouncementAdmin({
        title: title.trim(),
        content: content.trim(),
        targetAudience,
        priority,
      });

      if (res && (res.success || res.data)) {
        const newAnn = res.data || res;
        setAnnouncements((prev) => [newAnn, ...prev]);
        setShowCreateModal(false);
        setTitle('');
        setContent('');
        setSuccessMsg(`Announcement "${newAnn.title}" published! Broadcasted to all current candidate dashboards.`);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setError(err.message || 'Failed to broadcast announcement.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await platformApi.deactivateAnnouncementAdmin(id);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: false } : a))
      );
    } catch (err) {
      console.error('Failed to deactivate announcement:', err);
      setError('Failed to deactivate announcement. Please retry.');
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch =
        (ann.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ann.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ann.authorName || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'ACTIVE') return ann.active;
      if (selectedFilter === 'URGENT') return ann.priority === 'URGENT';
      if (selectedFilter === 'HIGH') return ann.priority === 'HIGH';
      if (selectedFilter === 'INACTIVE') return !ann.active;
      return true;
    });
  }, [announcements, searchQuery, selectedFilter]);

  const stats = useMemo(() => {
    const total = announcements.length;
    const active = announcements.filter((a) => a.active).length;
    const urgent = announcements.filter((a) => a.priority === 'URGENT' && a.active).length;
    return { total, active, urgent };
  }, [announcements]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/30 mb-2">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Institutional Broadcast Operations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Placement Announcements</h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Publish campus drives, assessment deadlines, and recruiter updates. Notices are instantly delivered to all candidate dashboards and notification centers.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={loadAnnouncements}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh announcements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Broadcast</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Broadcasts</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live On Student Dashboards</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{stats.active}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Urgent Alerts</p>
            <p className="text-2xl font-black text-rose-700 mt-0.5">{stats.urgent}</p>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-xs font-semibold animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadAnnouncements} className="underline hover:text-rose-900 text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search broadcasts by title, content, or recruiter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { key: 'ALL', label: 'All Notices' },
            { key: 'ACTIVE', label: 'Active Only' },
            { key: 'URGENT', label: 'Urgent' },
            { key: 'HIGH', label: 'High Priority' },
            { key: 'INACTIVE', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedFilter === tab.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium text-slate-500">Retrieving campus broadcast feed...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
              <Megaphone className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No Announcements Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {searchQuery || selectedFilter !== 'ALL'
                  ? 'No announcements match the chosen filter criteria.'
                  : 'No placement announcements have been broadcasted yet. Click "Create Broadcast" above to publish your first announcement.'}
              </p>
            </div>
            {!searchQuery && selectedFilter === 'ALL' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Announcement</span>
              </button>
            )}
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const isUrgent = ann.priority === 'URGENT';
            const isHigh = ann.priority === 'HIGH';

            return (
              <div
                key={ann.id}
                className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">{ann.title}</h3>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${
                        ann.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {ann.active ? 'ACTIVE BROADCAST' : 'INACTIVE'}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ann.priority || 'NORMAL'}
                    </span>

                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded">
                      Audience: {ann.targetAudience || 'ALL_STUDENTS'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed max-w-4xl whitespace-pre-line">
                    {ann.content}
                  </p>

                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                    <span className="font-medium text-slate-600">Broadcast by: {ann.authorName || 'System Administrator'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatAnnouncementDate(ann.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                  {ann.active && (
                    <button
                      onClick={() => handleDeactivate(ann.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 text-xs font-semibold transition-all shadow-sm"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-lg w-full shadow-2xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600">
                <Megaphone className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Broadcast Campus Announcement</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-indigo-950">
              <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Delivery Policy:</strong> This broadcast will immediately appear on the dashboard of every candidate currently registered. Candidates who sign up in the future will only receive future notices.
              </p>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Amazon Placement Drive Round 1 Scheduled"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Announcement Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter detailed broadcast instructions, eligibility criteria, CTC details, or venue/meeting links..."
                  rows={4}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Audience Target
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="ALL_STUDENTS">All Registered Students</option>
                    <option value="FINAL_YEAR">Final Year Candidates</option>
                    <option value="PRE_FINAL_YEAR">Pre-Final Year Candidates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Urgency Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent (Flash Alert)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {creating ? 'Broadcasting Notice...' : 'Publish Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
