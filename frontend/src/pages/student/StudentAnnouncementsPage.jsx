import React, { useState, useEffect, useMemo } from 'react';
import { platformApi } from '../../api/platformApi';
import {
  Megaphone,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  BellRing,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

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

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await platformApi.getActiveAnnouncements();
      if (res && res.success) {
        setAnnouncements(res.data || []);
      } else if (Array.isArray(res)) {
        setAnnouncements(res);
      } else if (res && res.data) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.error('Failed to load announcements for student:', err);
      setError(err.message || 'Unable to load campus announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch =
        (ann.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ann.content || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (priorityFilter === 'URGENT') return ann.priority === 'URGENT';
      if (priorityFilter === 'HIGH') return ann.priority === 'HIGH';
      return true;
    });
  }, [announcements, searchQuery, priorityFilter]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-12 text-[#F8FAFC]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#202934] bg-gradient-to-b from-[#151B22] via-[#10161C] to-[#0A0E13] p-6 md:p-8 text-white shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B22] text-[#E8C982] text-xs font-semibold border border-[#202934] mb-2">
            <Megaphone className="w-3.5 h-3.5 text-[#E8C982]" />
            <span>Campus Placement Notice Board</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Placement Announcements</h1>
          <p className="text-xs md:text-sm text-[#8B949E] mt-1 max-w-xl">
            Official recruitment drives, eligibility criteria, interview schedules, and placement office circulars for your cohort.
          </p>
        </div>

        <button
          onClick={fetchAnnouncements}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151B22] hover:bg-[#1E252E] text-[#C5CCD5] hover:text-[#E8C982] text-xs font-semibold border border-[#202934] hover:border-[#E8C982]/30 transition-all duration-150 self-start sm:self-auto cursor-pointer active:scale-95 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Notices</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#11171D] border border-[#FF5A5F]/30 rounded-2xl flex items-center justify-between gap-3 text-[#FF5A5F] text-xs font-semibold">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF5A5F] flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchAnnouncements} className="underline text-xs cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#10161C] rounded-2xl border border-[#202934] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6F7783] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campus notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#11171D] border border-[#202934] rounded-xl text-xs font-medium text-white placeholder-[#6F7783] focus:outline-none focus:border-[#E8C982] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: 'ALL', label: 'All Notices' },
            { key: 'URGENT', label: '⚡ Urgent Only' },
            { key: 'HIGH', label: 'High Priority' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPriorityFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                priorityFilter === tab.key
                  ? 'bg-[#E8C982] text-[#05070A] font-bold shadow-xs'
                  : 'bg-[#151B22] text-[#8B949E] border border-[#202934] hover:text-white hover:bg-[#1E252E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-[#10161C] rounded-3xl border border-[#202934] p-16 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
            <div className="w-8 h-8 border-2 border-[#202934] border-t-[#E8C982] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-[#8B949E] font-medium">Checking institutional broadcast server...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-[#10161C] rounded-3xl border border-[#202934] p-12 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#151B22] border border-[#202934] text-[#E8C982] flex items-center justify-center mx-auto">
              <Megaphone className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">No Announcements at this Time</h3>
            <p className="text-xs text-[#8B949E] max-w-sm mx-auto">
              {searchQuery || priorityFilter !== 'ALL'
                ? 'No circulars match your current filter.'
                : 'All current placement notices have been reviewed. New broadcasts from the placement cell will appear here automatically.'}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] text-xs font-bold rounded-xl transition-all duration-150 active:scale-95 shadow-sm"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const isUrgent = ann.priority === 'URGENT';
            const isHigh = ann.priority === 'HIGH';

            return (
              <div
                key={ann.id}
                className={`bg-[#10161C] rounded-3xl border p-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-0.5 ${
                  isUrgent
                    ? 'border-[#FF5A5F]/50 ring-1 ring-[#FF5A5F]/20'
                    : isHigh
                    ? 'border-[#F2B84B]/50'
                    : 'border-[#202934] hover:border-[#E8C982]/35'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider ${
                          isUrgent
                            ? 'bg-[#FF5A5F]/15 text-[#FF5A5F] border border-[#FF5A5F]/30 animate-pulse'
                            : isHigh
                            ? 'bg-[#F2B84B]/15 text-[#F2B84B] border border-[#F2B84B]/30'
                            : 'bg-[#20D3C2]/15 text-[#20D3C2] border border-[#20D3C2]/30'
                        }`}
                      >
                        {ann.priority || 'NORMAL'}
                      </span>

                      <span className="px-2 py-0.5 bg-[#151B22] border border-[#202934] text-[#8B949E] rounded text-[10px] font-semibold font-mono">
                        Target: {ann.targetAudience || 'ALL_STUDENTS'}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white tracking-tight pt-1">
                      {ann.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#8B949E] self-start sm:self-auto bg-[#151B22] px-3 py-1 rounded-full border border-[#202934] flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-[#6F7783]" />
                    <span>{formatAnnouncementDate(ann.createdAt)}</span>
                  </div>
                </div>

                <div className="text-xs md:text-sm text-[#C5CCD5] leading-relaxed whitespace-pre-line border-t border-[#202934] pt-3">
                  {ann.content}
                </div>

                <div className="mt-4 pt-3 border-t border-[#202934] flex flex-wrap items-center justify-between text-[11px] text-[#8B949E] gap-2">
                  <div className="flex items-center gap-1.5 font-medium text-[#C5CCD5]">
                    <Building2 className="w-3.5 h-3.5 text-[#E8C982]" />
                    <span>Issued by: {ann.authorName || 'Campus Placement Cell'}</span>
                  </div>

                  <span className="text-[#35D07F] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#35D07F]" />
                    Official Institutional Broadcast
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
