import React, { useState, useEffect } from 'react';
import { platformApi } from '../../api/platformApi';
import { Link } from 'react-router-dom';
import {
  Users,
  BrainCircuit,
  TrendingUp,
  Award,
  ShieldCheck,
  Building2,
  Megaphone,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCohortData = async () => {
      try {
        const res = await platformApi.getCohortAnalyticsAdmin();
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load cohort analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchCohortData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="mt-4 text-[#71717A] text-xs uppercase tracking-wider">Loading Cohort Analytics...</p>
      </div>
    );
  }

  const bandCounts = analytics?.readinessBandCounts || {};
  const totalInBands = Object.values(bandCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-10 animate-fadeIn max-w-6xl mx-auto pb-16 pt-2">
      {/* Header Banner */}
      <div className="bg-[#101010] rounded-2xl p-7 sm:p-9 border border-[#222222] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.7)] flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:border-[#3A3A3A] transition-all">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] text-[#A1A1AA] text-xs font-semibold border border-[#292929]">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Placement Officer &amp; Institutional Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Cohort Placement Readiness</h1>
          <p className="text-sm text-[#A1A1AA] max-w-xl leading-relaxed">
            Real-time aggregate performance tracking across student diagnostic assessments, resume diagnostics, and mock interview calibrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E5E5E5] transition-all transform hover:-translate-y-0.5 shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Student Directory</span>
          </Link>

          <Link
            to="/admin/research"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161616] hover:bg-[#202020] text-white text-xs font-medium border border-[#292929] hover:border-[#3A3A3A] transition-all transform hover:-translate-y-0.5"
          >
            <Activity className="w-3.5 h-3.5 text-[#A1A1AA]" />
            <span>Thesis &amp; Research</span>
          </Link>

          <Link
            to="/admin/announcements"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161616] hover:bg-[#202020] text-white text-xs font-medium border border-[#292929] hover:border-[#3A3A3A] transition-all"
          >
            <Megaphone className="w-3.5 h-3.5 text-[#A1A1AA]" />
            <span>Broadcast</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#141414] border border-[#EF4444]/30 rounded-2xl flex items-center gap-3 text-[#EF4444] text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-[#101010] p-6 rounded-2xl border border-[#222222] shadow-sm hover:border-[#3A3A3A] transition-all transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="text-4xl font-extrabold text-white mt-3 block tracking-tight">{analytics?.totalStudents || 0}</span>
          <p className="text-[11px] text-[#71717A] mt-1.5">Active student candidates</p>
        </div>

        {/* Average PRS */}
        <div className="bg-[#101010] p-6 rounded-2xl border border-[#222222] shadow-sm hover:border-[#3A3A3A] transition-all transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cohort Mean PRS</span>
            <Award className="w-4 h-4 text-white" />
          </div>
          <span className="text-4xl font-extrabold text-white mt-3 block tracking-tight">{analytics?.averagePrs || 0}%</span>
          <p className="text-[11px] text-[#71717A] mt-1.5">Avg Confidence: {analytics?.averageConfidence || 0}%</p>
        </div>

        {/* Assessment Participation */}
        <div className="bg-[#101010] p-6 rounded-2xl border border-[#222222] shadow-sm hover:border-[#3A3A3A] transition-all transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">MCQ Assessed</span>
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="text-4xl font-extrabold text-white mt-3 block tracking-tight">{analytics?.assessmentParticipationRate || 0}%</span>
          <p className="text-[11px] text-[#71717A] mt-1.5">Diagnostic test coverage</p>
        </div>

        {/* Mock Interview Participation */}
        <div className="bg-[#101010] p-6 rounded-2xl border border-[#222222] shadow-sm hover:border-[#3A3A3A] transition-all transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Mock Interviewed</span>
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-4xl font-extrabold text-white mt-3 block tracking-tight">{analytics?.interviewParticipationRate || 0}%</span>
          <p className="text-[11px] text-[#71717A] mt-1.5">Interview session coverage</p>
        </div>
      </div>

      {/* Cohort Readiness Distribution */}
      <div className="bg-[#101010] rounded-2xl border border-[#222222] p-7 shadow-sm hover:border-[#3A3A3A] transition-all">
        <h3 className="text-lg font-bold text-white mb-5 tracking-tight">Cohort Placement Readiness Distribution</h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-[#141414] rounded-xl border border-[#222222]">
            <span className="text-xs font-semibold text-[#22C55E] uppercase tracking-wider block">Excellent (85-100)</span>
            <span className="text-3xl font-extrabold text-white mt-2 block">{bandCounts['EXCELLENT'] || 0}</span>
            <span className="text-[11px] text-[#71717A] mt-1 block">
              {Math.round(((bandCounts['EXCELLENT'] || 0) / totalInBands) * 100)}% of assessed
            </span>
          </div>

          <div className="p-5 bg-[#141414] rounded-xl border border-[#222222]">
            <span className="text-xs font-semibold text-white uppercase tracking-wider block">Good (70-84)</span>
            <span className="text-3xl font-extrabold text-white mt-2 block">{bandCounts['GOOD'] || 0}</span>
            <span className="text-[11px] text-[#71717A] mt-1 block">
              {Math.round(((bandCounts['GOOD'] || 0) / totalInBands) * 100)}% of assessed
            </span>
          </div>

          <div className="p-5 bg-[#141414] rounded-xl border border-[#222222]">
            <span className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider block">Developing (55-69)</span>
            <span className="text-3xl font-extrabold text-white mt-2 block">{bandCounts['DEVELOPING'] || 0}</span>
            <span className="text-[11px] text-[#71717A] mt-1 block">
              {Math.round(((bandCounts['DEVELOPING'] || 0) / totalInBands) * 100)}% of assessed
            </span>
          </div>

          <div className="p-5 bg-[#141414] rounded-xl border border-[#222222]">
            <span className="text-xs font-semibold text-[#EF4444] uppercase tracking-wider block">Needs Improvement (0-54)</span>
            <span className="text-3xl font-extrabold text-white mt-2 block">{bandCounts['NEEDS_IMPROVEMENT'] || 0}</span>
            <span className="text-[11px] text-[#71717A] mt-1 block">
              {Math.round(((bandCounts['NEEDS_IMPROVEMENT'] || 0) / totalInBands) * 100)}% of assessed
            </span>
          </div>
        </div>
      </div>

      {/* Common Cohort Skill Gaps */}
      <div className="bg-[#101010] rounded-2xl border border-[#222222] p-7 shadow-sm hover:border-[#3A3A3A] transition-all">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Highest Common Cohort Skill Gaps</h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Identifies curriculum topics requiring institutional reinforcement workshops.
            </p>
          </div>
          <span className="text-xs font-medium text-[#A1A1AA]">Platform Calibration</span>
        </div>

        <div className="space-y-3">
          {analytics?.commonSkillGaps?.map((gap, idx) => (
            <div key={idx} className="p-4 bg-[#141414] rounded-xl border border-[#222222] flex items-center justify-between gap-4 hover:border-[#2F2F2F] transition-colors">
              <div>
                <span className="text-xs font-semibold text-white block">{gap.skill}</span>
                <span className="text-[11px] text-[#71717A] mt-0.5 block">{gap.affectedStudentsPercent}% of students exhibit proficiency gaps</span>
              </div>

              <div className="w-36 bg-[#1F1F1F] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full rounded-full"
                  style={{ width: `${gap.affectedStudentsPercent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
