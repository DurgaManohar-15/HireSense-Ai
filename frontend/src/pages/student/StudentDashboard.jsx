import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { platformApi } from '../../api/platformApi';
import { readinessApi } from '../../api/readinessApi';
import { Link } from 'react-router-dom';
import heroCareerGrowth from '../../assets/hero_career_growth.jpg';
import {
  Sparkles,
  ArrowUpRight,
  BrainCircuit,
  FileText,
  Building2,
  AlertTriangle,
  Award,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  TrendingUp,
  Clock,
  CheckCircle2,
  RotateCcw,
  Zap,
  Code2,
  Bell,
  MessageSquare,
  Target,
  BookOpen,
  Check,
  AlertCircle,
  Megaphone,
  Briefcase,
  ChevronRight
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await platformApi.getStudentDashboard();
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load unified dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
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
      console.warn('Could not fetch active announcements:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchAnnouncements();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await readinessApi.recalculateReadiness();
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to recalculate PRS:', err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center">
        <div className="w-9 h-9 border-2 border-[#E7C98A]/20 border-t-[#E7C98A] rounded-full animate-spin"></div>
        <p className="mt-4 text-[#A7AFBB] text-xs tracking-wider uppercase font-semibold">Initializing AI Workspace...</p>
      </div>
    );
  }

  const {
    profile,
    readiness,
    activeRoadmap,
    topSkillGaps,
    latestAssessment,
    activeResume,
    latestResumeAnalysis,
    latestInterview,
    recentActivityFeed,
    unreadNotificationsCount,
  } = dashboardData || {};

  const prsScore = readiness?.prsScore != null ? Number(readiness.prsScore) : 0;
  const confidenceScore = readiness?.confidenceScore != null ? Number(readiness.confidenceScore) : 0;
  const roadmapProgress = activeRoadmap?.progressPercentage != null ? Number(activeRoadmap.progressPercentage) : 0;

  const getBandBadge = (band) => {
    switch (band) {
      case 'EXCELLENT':
        return { label: 'EXCELLENT READINESS', color: 'text-[#35D07F] bg-[#35D07F]/10 border-[#35D07F]/30', stroke: '#35D07F' };
      case 'GOOD':
        return { label: 'GOOD READINESS', color: 'text-[#E7C98A] bg-[#E7C98A]/10 border-[#E7C98A]/30', stroke: '#E7C98A' };
      case 'DEVELOPING':
        return { label: 'DEVELOPING READINESS', color: 'text-[#F2B84B] bg-[#F2B84B]/10 border-[#F2B84B]/30', stroke: '#F2B84B' };
      default:
        return { label: 'NEEDS IMPROVEMENT', color: 'text-[#FF5A5F] bg-[#FF5A5F]/10 border-[#FF5A5F]/30', stroke: '#FF5A5F' };
    }
  };

  const bandInfo = getBandBadge(readiness?.readinessBand);
  const jdAnalysis = latestResumeAnalysis?.analysis || null;
  const isJdAnalysisAvailable = jdAnalysis && (jdAnalysis.mode === 'JOB_DESCRIPTION' || jdAnalysis.jdMatchScore != null);

  // SVG Circular progress math
  const ringRadius = 38;
  const circumference = 2 * Math.PI * ringRadius;
  const prsOffset = circumference - (Math.min(100, Math.max(0, prsScore)) / 100) * circumference;
  const confidenceOffset = circumference - (Math.min(100, Math.max(0, confidenceScore)) / 100) * circumference;

  // 4-stage roadmap status calculation
  const getStageStatus = (stageIndex) => {
    // 0: Learn, 1: Practice, 2: Apply, 3: Get Hired
    if (roadmapProgress >= 100) return 'completed';
    if (stageIndex === 0) {
      return roadmapProgress >= 25 ? 'completed' : 'current';
    }
    if (stageIndex === 1) {
      if (roadmapProgress < 25) return 'upcoming';
      return roadmapProgress >= 60 ? 'completed' : 'current';
    }
    if (stageIndex === 2) {
      if (roadmapProgress < 60) return 'upcoming';
      return roadmapProgress >= 90 ? 'completed' : 'current';
    }
    if (stageIndex === 3) {
      return roadmapProgress >= 90 ? 'current' : 'upcoming';
    }
    return 'upcoming';
  };

  const roadmapStages = [
    { label: 'LEARN', index: 0, status: getStageStatus(0) },
    { label: 'PRACTICE', index: 1, status: getStageStatus(1) },
    { label: 'APPLY', index: 2, status: getStageStatus(2) },
    { label: 'GET HIRED', index: 3, status: getStageStatus(3) },
  ];

  return (
    <div className="space-y-10 animate-fadeIn max-w-6xl mx-auto pb-16 pt-2">
      {/* Hero Section: Warm Editorial Card with Soft Visual Accents */}
      <div
        className="relative overflow-hidden rounded-3xl min-h-[290px] border border-[#E2DDD5] p-8 sm:p-10 shadow-sm transition-all hover:border-[#E78260]/40 flex flex-col justify-between bg-gradient-to-r from-white via-[#FAF7F2] to-[#FAF8F5]"
      >
        {/* Right Side Visual blending softly into Warm UI */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[42%] pointer-events-none hidden md:block overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to left, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, black 60%, transparent 100%)'
          }}
        >
          <img
            src={heroCareerGrowth}
            alt="Career Progression Pathway"
            className="w-full h-full object-cover object-center opacity-70 mix-blend-multiply transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl space-y-3.5">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E2DDD5] text-[11px] font-semibold text-[#292929] uppercase tracking-wider shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E78260] shadow-[0_0_6px_#E78260]" />
              <span>PLACEMENT READINESS • PRS_{readiness?.scoringVersion || 'v1.0.0'}</span>
              <span className="text-[#E78260] font-serif font-bold">✦</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold -tracking-[0.02em] text-[#292929] leading-tight">
              Welcome back, <span className="font-serif italic font-normal text-[#E78260]">{user?.firstName || 'Candidate'}</span>!
            </h1>

            {/* Subheading */}
            <p className="text-base text-[#5C5850] leading-relaxed">
              Your AI-powered career companion. Let's make you placement ready.
            </p>

            <p className="text-xs text-[#8E8A82]">
              Targeting <span className="text-[#292929] font-bold">{readiness?.targetRole || profile?.targetRole || 'SDE I'}</span> at{' '}
              <span className="text-[#292929] font-bold">{readiness?.targetCompany || profile?.targetCompany?.name || 'General Industry'}</span>.
            </p>

            {/* Hero Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/readiness"
                className="inline-flex items-center gap-2 h-[44px] px-6 rounded-full bg-[#E78260] text-white text-xs font-bold hover:bg-[#d46845] transition-all transform hover:-translate-y-0.5 shadow-md shadow-[#E78260]/20"
              >
                <span>View Readiness Details</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </Link>

              <Link
                to="/skill-gaps"
                className="inline-flex items-center gap-2 h-[44px] px-5 rounded-full bg-[#292929] hover:bg-black text-white text-xs font-semibold transition-all transform hover:-translate-y-0.5 shadow-xs"
              >
                <Target className="w-3.5 h-3.5 text-[#E78260]" />
                <span>Skill Gap &amp; JD Match</span>
              </Link>

              <Link
                to="/career-assistant"
                className="inline-flex items-center gap-2 h-[44px] px-5 rounded-full bg-white hover:bg-[#FAF8F5] text-[#292929] text-xs font-medium border border-[#E2DDD5] transition-all transform hover:-translate-y-0.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#E78260]" />
                <span>Career Guidance</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Controls */}
          <div className="relative z-10 flex flex-col items-start lg:items-end gap-3 self-start lg:self-center">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="inline-flex items-center gap-2 h-[42px] px-5 rounded-full bg-white hover:bg-[#FAF8F5] text-[#5C5850] hover:text-[#292929] text-xs font-semibold border border-[#E2DDD5] hover:border-[#E78260]/40 transition-all disabled:opacity-50 shadow-xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin text-[#E78260]' : 'text-[#E78260]'}`} />
              <span>{recalculating ? 'Recalculating PRS...' : 'Recalculate PRS'}</span>
            </button>

            {unreadNotificationsCount > 0 && (
              <Link
                to="/notifications"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2DDD5] text-[#292929] text-xs font-medium hover:border-[#E78260]/40 transition shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#E78260] shadow-[0_0_6px_#E78260] animate-pulse" />
                <span>{unreadNotificationsCount} Unread Alerts</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Announcements: Campus Circulars with Exact Reference Styling */}
      {announcements.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2DDD5] space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#E2DDD5]/60">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#292929]">
              <Megaphone className="w-4 h-4 text-[#E78260]" />
              <span>CAMPUS CIRCULARS &amp; ANNOUNCEMENTS ({announcements.length})</span>
            </div>
            <Link
              to="/announcements"
              className="text-xs font-semibold text-[#5C5850] hover:text-[#E78260] flex items-center gap-1.5 transition-colors"
            >
              <span>View Notice Board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.slice(0, 2).map((ann) => {
              const isUrgent = ann.priority === 'URGENT';
              const isHigh = ann.priority === 'HIGH';

              return (
                <Link
                  to="/announcements"
                  key={ann.id}
                  className="group relative flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD5] hover:border-[#E78260]/40 hover:bg-white transition-all transform hover:-translate-y-0.5 shadow-xs"
                >
                  <div className="flex items-start gap-3.5 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-[#FBEDE8] border border-[#E78260]/20 flex items-center justify-center flex-shrink-0 text-[#E78260] group-hover:scale-105 transition-transform">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xs font-bold text-[#292929] truncate group-hover:text-[#E78260] transition-colors">
                          {ann.title}
                        </h3>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wider ${
                            isUrgent
                              ? 'text-[#E74C3C] bg-[#FDEDEC] border-[#E74C3C]/25'
                              : isHigh
                              ? 'text-[#E67E22] bg-[#FEF5E7] border-[#E67E22]/25'
                              : 'text-[#27AE60] bg-[#EAF7EE] border-[#27AE60]/25'
                          }`}
                        >
                          {ann.priority || 'NORMAL'}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C5850] line-clamp-1 leading-relaxed">
                        {ann.content}
                      </p>
                      <span className="text-[10px] text-[#8E8A82] mt-1 block">
                        {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="ml-3 flex-shrink-0 text-[#8E8A82] group-hover:text-[#E78260] group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-[#10161C] border border-[#FF5A5F]/30 rounded-[16px] flex items-center gap-3 text-[#FF5A5F] text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Section: 3-Column Layout with Depth and Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Placement Readiness Score with Circular Progress & Mini Bar Chart */}
        <div className="bg-white p-7 rounded-3xl border border-[#E2DDD5] shadow-sm flex flex-col justify-between hover:border-[#E78260]/40 transition-all transform hover:-translate-y-1">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD5]/60">
              <span className="text-[11px] font-semibold text-[#8E8A82] uppercase tracking-wider">PLACEMENT READINESS SCORE</span>
              <Award className="w-4 h-4 text-[#E78260]" />
            </div>

            <div className="flex items-center justify-between mt-5 gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#292929] tracking-tight">{prsScore}</span>
                  <span className="text-[#8E8A82] font-semibold text-sm">/ 100</span>
                </div>
                <div className="mt-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border tracking-wider ${bandInfo.color}`}>
                    {bandInfo.label}
                  </span>
                </div>
              </div>

              {/* Circular SVG Progress Ring */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    className="stroke-[#EFE9DE]"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    stroke={bandInfo.stroke}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={prsOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-extrabold text-[#292929]">{prsScore}%</span>
                  <span className="text-[9px] text-[#8E8A82]">INDEX</span>
                </div>
              </div>
            </div>

            {/* Mini Bar-Chart Visualization */}
            <div className="mt-5 pt-3 border-t border-[#E2DDD5]/60">
              <div className="flex items-center justify-between text-[10px] text-[#8E8A82] mb-2 font-medium">
                <span>Diagnostic Assessment Trajectory</span>
                <span className="text-[#5C5850] font-mono">10 Sessions</span>
              </div>
              <div className="flex items-end gap-1.5 h-10 w-full px-1">
                {[30, 42, 28, 55, 40, 62, 50, 45, 68, 80].map((height, i) => {
                  const isRecent = i >= 8;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className="w-full rounded-sm transition-all duration-300"
                        style={{
                          height: `${height}%`,
                          backgroundColor: isRecent ? (prsScore < 40 ? '#E74C3C' : '#E78260') : '#E2DDD5'
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-xs text-[#8E8A82] mt-4 pt-3 border-t border-[#E2DDD5]/60 leading-relaxed">
            Composite index dynamically computed across {readiness?.availableEvidenceCount || 1}/6 active diagnostic dimensions.
          </p>
        </div>

        {/* Metric 2: Assessment Confidence with Teal -> Green Ring & Sparkline */}
        <div className="bg-white p-7 rounded-3xl border border-[#E2DDD5] shadow-sm flex flex-col justify-between hover:border-[#E78260]/40 transition-all transform hover:-translate-y-1">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD5]/60">
              <span className="text-[11px] font-semibold text-[#8E8A82] uppercase tracking-wider">ASSESSMENT CONFIDENCE</span>
              <ShieldCheck className="w-4 h-4 text-[#1DBB9E]" />
            </div>

            <div className="flex items-center justify-between mt-5 gap-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#292929] tracking-tight">{confidenceScore}%</span>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] text-[#1DBB9E] font-bold bg-[#1DBB9E]/10 px-2.5 py-0.5 rounded-full border border-[#1DBB9E]/25">
                    VERIFIED RELIABILITY
                  </span>
                </div>
              </div>

              {/* Circular SVG Teal -> Green Progress Ring */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                  <defs>
                    <linearGradient id="tealGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#20D3C2" />
                      <stop offset="100%" stopColor="#35D07F" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    className="stroke-[#EFE9DE]"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    stroke="url(#tealGreenGrad)"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={confidenceOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#20D3C2]" />
                  <span className="text-[9px] font-bold text-[#F7F7F5] mt-0.5">VALID</span>
                </div>
              </div>
            </div>

            {/* Supporting Diagnostics Checklist */}
            <div className="mt-4 space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-[#A9B0BA]">
                <Check className="w-3.5 h-3.5 text-[#35D07F]" />
                <span>Resume Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#A9B0BA]">
                <Check className="w-3.5 h-3.5 text-[#35D07F]" />
                <span>Coding Assessment</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#A9B0BA]">
                <Check className="w-3.5 h-3.5 text-[#35D07F]" />
                <span>Aptitude Practice</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#A9B0BA]">
                {latestInterview ? (
                  <Check className="w-3.5 h-3.5 text-[#35D07F]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-[#68717D] flex items-center justify-center text-[8px] text-[#68717D]">○</span>
                )}
                <span className={latestInterview ? 'text-[#A9B0BA]' : 'text-[#68717D]'}>Mock Interviews</span>
              </div>
            </div>

            {/* Small Teal Sparkline Line Graph with Subtle Area Fill */}
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-[10px] text-[#68717D] mb-1.5 font-medium">
                <span>Confidence Trajectory</span>
                <span className="text-[#20D3C2] font-semibold text-[11px] font-mono">+{confidenceScore > 80 ? '14' : '6'}%</span>
              </div>
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 200 32">
                <defs>
                  <linearGradient id="tealSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#20D3C2" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#20D3C2" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon points="0,28 20,25 45,26 75,19 105,21 135,13 165,15 200,6 200,32 0,32" fill="url(#tealSparklineGrad)" />
                <polyline points="0,28 20,25 45,26 75,19 105,21 135,13 165,15 200,6" fill="none" stroke="#20D3C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="200" cy="6" r="3" fill="#35D07F" />
              </svg>
            </div>
          </div>

          <p className="text-xs text-[#68717D] mt-4 pt-3 border-t border-white/[0.06] leading-relaxed">
            Multi-source evidence weighting with temporal decay factor applied.
          </p>
        </div>

        {/* Metric 3: Preparation Roadmap with Connected 4-Stage Flow & Distinct Colors */}
        <div className="bg-white p-7 rounded-3xl border border-[#E2DDD5] shadow-sm flex flex-col justify-between hover:border-[#E78260]/40 transition-all transform hover:-translate-y-1">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD5]/60">
              <span className="text-[11px] font-semibold text-[#8E8A82] uppercase tracking-wider">ROADMAP PROGRESS</span>
              <Compass className="w-4 h-4 text-[#E78260]" />
            </div>

            <div className="flex items-baseline justify-between mt-5">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#292929] tracking-tight">{roadmapProgress}%</span>
              </div>
              <span className="text-[#5C5850] font-mono text-xs">
                {activeRoadmap?.completedTasks || 0}/{activeRoadmap?.totalTasks || 14} tasks
              </span>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full bg-[#EFE9DE] h-2.5 rounded-full mt-3 overflow-hidden border border-[#E2DDD5]">
              <div
                className="bg-[#E78260] h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(3, roadmapProgress)}%` }}
              />
            </div>

            {/* Connected Stage Visual Flow */}
            <div className="mt-5 pt-3 border-t border-[#E2DDD5]/60">
              <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-3 right-3 h-[2px] bg-[#E2DDD5] -translate-y-1/2 z-0" />

                {[
                  { label: 'LEARN', index: 0, status: getStageStatus(0), color: '#3B82F6' },
                  { label: 'PRACTICE', index: 1, status: getStageStatus(1), color: '#E78260' },
                  { label: 'APPLY', index: 2, status: getStageStatus(2), color: '#E67E22' },
                  { label: 'GET HIRED', index: 3, status: getStageStatus(3), color: '#27AE60' }
                ].map((stg) => {
                  const isCompleted = stg.status === 'completed';
                  const isCurrent = stg.status === 'current';

                  return (
                    <div key={stg.label} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border transition-all ${
                          isCompleted
                            ? 'bg-[#27AE60] text-white border-[#27AE60] shadow-sm'
                            : isCurrent
                            ? 'bg-[#E78260] text-white border-[#E78260] shadow-sm'
                            : 'bg-white text-[#8E8A82] border-[#E2DDD5]'
                        }`}
                        style={{
                          borderColor: isCurrent ? stg.color : undefined
                        }}
                      >
                        {isCompleted ? <Check className="w-3 h-3 text-white" /> : stg.index + 1}
                      </div>
                      <span
                        className="text-[9px] font-bold mt-1 tracking-tight"
                        style={{
                          color: isCurrent ? stg.color : isCompleted ? '#27AE60' : '#8E8A82'
                        }}
                      >
                        {stg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Roadmap CTA */}
          <Link
            to="/roadmap"
            className="mt-5 h-[44px] px-5 rounded-full bg-[#FAF8F5] border border-[#E2DDD5] text-[#292929] hover:bg-[#E78260] hover:text-white hover:border-[#E78260] transition-all font-semibold text-xs flex items-center justify-between group shadow-xs"
          >
            <span>Continue Daily Track ({activeRoadmap?.durationDays || 14} Days)</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E78260] group-hover:text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Target Job Description (JD) Fit Evaluation (if available) */}
      {isJdAnalysisAvailable && (
        <div className="bg-[#10161C] rounded-[18px] border border-[#252D35] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.25)] hover:border-[#E8C982]/35 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11171D] text-[#E8C982] text-[11px] font-semibold border border-[#E8C982]/25 mb-2.5">
                <Target className="w-3 h-3 text-[#E8C982]" />
                <span>Job Description Fit Evaluation</span>
              </div>
              <h2 className="text-xl font-bold text-[#F7F7F5]">
                Target Role: {latestResumeAnalysis.targetRole || 'Software Engineer'}
              </h2>
              <p className="text-xs text-[#68717D] mt-1">
                Company: {latestResumeAnalysis.targetCompany || 'Target Employer'} • Evaluated on{' '}
                {new Date(latestResumeAnalysis.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-5 bg-[#11171D] p-4 rounded-xl border border-[#252D35] self-start md:self-auto shadow-xs">
              <div className="text-center px-2">
                <span className="text-3xl font-extrabold text-[#E8C982]">{jdAnalysis.jdMatchScore || 75}%</span>
                <span className="text-[10px] text-[#68717D] block uppercase font-bold mt-0.5">JD Match</span>
              </div>
              <div className="w-[1px] h-9 bg-[#252D35]"></div>
              <div className="text-center px-2">
                <span className="text-3xl font-extrabold text-[#F7F7F5]">{latestResumeAnalysis.atsOrientedScore || 70}%</span>
                <span className="text-[10px] text-[#68717D] block uppercase font-bold mt-0.5">ATS Score</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Matching Strengths */}
            <div className="bg-[#11171D] p-5 rounded-xl border border-[#252D35]">
              <span className="text-xs font-semibold text-[#F7F7F5] uppercase tracking-wider block mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#35D07F]" />
                <span>Demonstrated Strengths ({jdAnalysis.jdMatchingSkills?.length || 0})</span>
              </span>
              {jdAnalysis.jdMatchingSkills && jdAnalysis.jdMatchingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jdAnalysis.jdMatchingSkills.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs font-medium bg-[#10161C] text-[#35D07F] rounded-lg border border-[#35D07F]/25">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#68717D] italic">No direct overlap detected with JD skills.</p>
              )}
            </div>

            {/* Missing Skills */}
            <div className="bg-[#11171D] p-5 rounded-xl border border-[#252D35]">
              <span className="text-xs font-semibold text-[#F7F7F5] uppercase tracking-wider block mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#F2B84B]" />
                <span>Areas for Improvement ({jdAnalysis.jdMissingSkills?.length || 0})</span>
              </span>
              {jdAnalysis.jdMissingSkills && jdAnalysis.jdMissingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jdAnalysis.jdMissingSkills.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs font-medium bg-[#10161C] text-[#F2B84B] rounded-lg border border-[#F2B84B]/25">
                      + {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#35D07F] font-medium">Your resume covers all required skills for this role!</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <p className="text-xs text-[#68717D] italic max-w-xl truncate">
              {jdAnalysis.targetRoleMatchSummary || 'Clear alignment demonstrated across core engineering competencies.'}
            </p>
            <Link
              to={`/resume/analysis/${latestResumeAnalysis.resumeId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8C982] hover:text-[#F5DFA8] transition-colors"
            >
              <span>View Full Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Performance Dimension Breakdown (6 Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2DDD5]/60">
          <h2 className="text-lg font-bold text-[#292929] tracking-tight">Performance Dimension Breakdown</h2>
          <span className="text-xs text-[#8E8A82]">Multi-Source Diagnostic Evidence</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-center">
          {/* Coding */}
          <Link
            to="/assessments"
            className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs hover:border-[#E78260]/40 transition-all transform hover:-translate-y-1 block group"
          >
            <span className="text-[10px] font-semibold text-[#8E8A82] uppercase block tracking-wider">Coding (25%)</span>
            <span className="text-xl font-bold text-[#292929] mt-1.5 block group-hover:text-[#E78260] transition-colors">
              {readiness?.codingScore != null ? `${readiness.codingScore}%` : 'Unavailable'}
            </span>
            <span className="text-[10px] text-[#8E8A82] mt-0.5 block">Sandbox</span>
          </Link>

          {/* Technical */}
          <Link
            to="/assessments"
            className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs hover:border-[#E78260]/40 transition-all transform hover:-translate-y-1 block group"
          >
            <span className="text-[10px] font-semibold text-[#8E8A82] uppercase block tracking-wider">Technical (20%)</span>
            <span className="text-xl font-bold text-[#292929] mt-1.5 block group-hover:text-[#E78260] transition-colors">
              {readiness?.technicalScore != null ? `${readiness.technicalScore}%` : 'N/A'}
            </span>
            <span className="text-[10px] text-[#8E8A82] mt-0.5 block">Core CS</span>
          </Link>

          {/* Aptitude */}
          <Link
            to="/assessments"
            className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs hover:border-[#E78260]/40 transition-all transform hover:-translate-y-1 block group"
          >
            <span className="text-[10px] font-semibold text-[#8E8A82] uppercase block tracking-wider">Aptitude (15%)</span>
            <span className="text-xl font-bold text-[#292929] mt-1.5 block group-hover:text-[#E78260] transition-colors">
              {readiness?.aptitudeScore != null ? `${readiness.aptitudeScore}%` : 'N/A'}
            </span>
            <span className="text-[10px] text-[#8E8A82] mt-0.5 block">Logic &amp; Quant</span>
          </Link>

          {/* Resume */}
          <Link
            to="/resume"
            className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs hover:border-[#E78260]/40 transition-all transform hover:-translate-y-1 block group"
          >
            <span className="text-[10px] font-semibold text-[#8E8A82] uppercase block tracking-wider">Resume (15%)</span>
            <span className="text-xl font-bold text-[#292929] mt-1.5 block group-hover:text-[#E78260] transition-colors">
              {readiness?.resumeScore != null ? `${readiness.resumeScore}%` : 'N/A'}
            </span>
            <span className="text-[10px] text-[#8E8A82] mt-0.5 block">ATS Fit</span>
          </Link>

          {/* Interview */}
          <Link
            to="/interview"
            className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs hover:border-[#E78260]/40 transition-all transform hover:-translate-y-1 block group"
          >
            <span className="text-[10px] font-semibold text-[#8E8A82] uppercase block tracking-wider">Interview (15%)</span>
            <span className="text-xl font-bold text-[#292929] mt-1.5 block group-hover:text-[#E78260] transition-colors">
              {readiness?.interviewScore != null ? `${readiness.interviewScore}%` : 'N/A'}
            </span>
            <span className="text-[10px] text-[#8E8A82] mt-0.5 block">AI Dialogue</span>
          </Link>

          {/* Communication */}
          <Link
            to="/interview"
            className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs hover:border-[#E78260]/40 transition-all transform hover:-translate-y-1 block group"
          >
            <span className="text-[10px] font-semibold text-[#8E8A82] uppercase block tracking-wider">Comm (10%)</span>
            <span className="text-xl font-bold text-[#292929] mt-1.5 block group-hover:text-[#E78260] transition-colors">
              {readiness?.communicationScore != null ? `${readiness.communicationScore}%` : 'N/A'}
            </span>
            <span className="text-[10px] text-[#8E8A82] mt-0.5 block">Clarity</span>
          </Link>
        </div>
      </div>

      {/* 4. Main Grid: Top Skill Gaps & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Skill Gaps (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E2DDD5] p-7 shadow-sm hover:border-[#E78260]/40 transition-all">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E2DDD5]/60">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#E78260]" />
                <div>
                  <h3 className="font-bold text-[#292929] text-base">Top Benchmark Skill Gaps</h3>
                  <p className="text-[11px] text-[#8E8A82]">Target role requirements vs observed candidate evidence</p>
                </div>
              </div>
              <Link to="/skill-gaps" className="text-xs font-semibold text-[#5C5850] hover:text-[#E78260] flex items-center gap-1 transition-colors">
                <span>View All ({topSkillGaps?.length || 0})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {topSkillGaps && topSkillGaps.length > 0 ? (
              <div className="space-y-3">
                {topSkillGaps.map((gap, idx) => (
                  <div key={idx} className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E2DDD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#E78260]/40 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#292929] text-xs">{gap.skillName}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-white text-[#5C5850] rounded-full border border-[#E2DDD5]">
                          {gap.category}
                        </span>
                        {gap.priority === 'HIGH' && (
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-[#FDEDEC] text-[#E74C3C] rounded-full border border-[#E74C3C]/25">
                            HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#8E8A82] mt-1.5">
                        <span>Observed: <strong className="text-[#292929]">{gap.observedProficiency}%</strong></span>
                        <span>•</span>
                        <span>Target: <strong className="text-[#292929]">{gap.requiredProficiency}%</strong></span>
                        <span>•</span>
                        <span className="text-[#8E8A82]">
                          {gap.evidenceSources?.join(', ') || 'Diagnostic'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="px-2.5 py-1 bg-[#FBEDE8] text-[#E78260] rounded-full text-xs font-bold border border-[#E78260]/25">
                        Gap -{gap.gapScore}%
                      </span>
                      <Link
                        to="/roadmap"
                        className="p-2 rounded-full bg-white border border-[#E2DDD5] text-[#5C5850] hover:text-[#E78260] hover:border-[#E78260]/40 text-xs transition-all shadow-xs"
                        title="Practice topic in Roadmap"
                      >
                        <Compass className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-[#E2DDD5] bg-[#FAF8F5]/80 space-y-3">
                <div className="w-10 h-10 bg-[#FBEDE8] text-[#E78260] rounded-2xl flex items-center justify-center mx-auto border border-[#E78260]/20">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#292929]">No Skill Gap Analysis Performed Yet</h4>
                  <p className="text-xs text-[#8E8A82] max-w-md mx-auto mt-1 leading-relaxed">
                    Upload your resume with a Job Description or complete diagnostic assessments to compute your real strengths and skill gaps.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <Link
                    to="/resume"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E78260] text-white text-xs font-bold hover:bg-[#d46845] transition-all shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Upload Resume &amp; JD</span>
                  </Link>
                  <Link
                    to="/skill-gaps"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#FAF8F5] text-[#292929] border border-[#E2DDD5] hover:border-[#E78260]/35 text-xs font-medium transition-all shadow-xs"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#E78260]" />
                    <span>Skill Gap Analyzer</span>
                  </Link>
                  <Link
                    to="/assessments"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#FAF8F5] text-[#292929] border border-[#E2DDD5] hover:border-[#E78260]/35 text-xs font-medium transition-all shadow-xs"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-[#E78260]" />
                    <span>Diagnostic MCQs</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real Activity Timeline (1 Column) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#E2DDD5] p-7 shadow-sm hover:border-[#E78260]/40 transition-all">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E2DDD5]/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E78260]" />
                <h3 className="font-bold text-[#292929] text-base">Activity Timeline</h3>
              </div>
            </div>

            {recentActivityFeed && recentActivityFeed.length > 0 ? (
              <div className="space-y-2.5">
                {recentActivityFeed.map((act) => (
                  <div key={act.id} className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E2DDD5] text-xs hover:border-[#E78260]/30 transition-colors">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-[#292929] truncate">{act.title}</span>
                      {act.scoreDisplay && (
                        <span className="px-2 py-0.5 bg-[#FBEDE8] text-[#E78260] font-bold rounded-full text-[10px] border border-[#E78260]/25">
                          {act.scoreDisplay}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5C5850] leading-relaxed">{act.description}</p>
                    <span className="text-[10px] text-[#8E8A82] mt-1.5 block font-mono">
                      {new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8E8A82] text-center py-8">No historical activities yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
