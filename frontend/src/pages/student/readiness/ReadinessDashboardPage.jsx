import React, { useState, useEffect } from 'react';
import { readinessApi } from '../../../api/readinessApi';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Award,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Compass,
  Layers,
  Code,
  FileText,
  Bot,
  BrainCircuit,
  MessageSquare,
  CheckCircle2,
  Building2,
  HelpCircle,
  Zap,
} from 'lucide-react';

export const ReadinessDashboardPage = () => {
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const res = await readinessApi.getLatestReadiness();
      if (res.success && res.data) {
        setReadiness(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load placement readiness data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    setError('');
    try {
      const res = await readinessApi.recalculateReadiness();
      if (res.success && res.data) {
        setReadiness(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to recalculate placement readiness score');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[460px] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white tracking-wide">Calibrating Placement Readiness...</p>
          <p className="text-xs text-zinc-500 mt-1">Aggregating evidence across all 6 diagnostic dimensions</p>
        </div>
      </div>
    );
  }

  const getBandBadge = (band) => {
    switch (band) {
      case 'EXCELLENT':
        return { label: 'EXCELLENT READINESS', color: 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/30' };
      case 'GOOD':
        return { label: 'GOOD READINESS', color: 'bg-[#E7C98A]/10 text-[#E7C98A] border-[#E7C98A]/30' };
      case 'DEVELOPING':
        return { label: 'DEVELOPING READINESS', color: 'bg-[#F2B84B]/10 text-[#F2B84B] border-[#F2B84B]/30' };
      default:
        return { label: 'NEEDS IMPROVEMENT', color: 'bg-[#FF5A5F]/10 text-[#FF5A5F] border-[#FF5A5F]/30' };
    }
  };

  const bandInfo = getBandBadge(readiness?.readinessBand);

  // Circular progress math
  const ringRadius = 38;
  const circumference = 2 * Math.PI * ringRadius;
  const prsScore = readiness?.prsScore != null ? Number(readiness.prsScore) : 0;
  const confidenceScore = readiness?.confidenceScore != null ? Number(readiness.confidenceScore) : 0;
  const prsOffset = circumference - (Math.min(100, Math.max(0, prsScore)) / 100) * circumference;
  const confidenceOffset = circumference - (Math.min(100, Math.max(0, confidenceScore)) / 100) * circumference;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 text-[#F7F7F5] animate-fadeIn">
      {/* Hero PRS Cockpit Header */}
      <div
        className="relative overflow-hidden rounded-[22px] border border-[#252D35] p-8 sm:p-10 shadow-[0_18px_50px_rgba(0,0,0,0.30)] transition-all hover:border-[#E8C982]/30"
        style={{
          background: 'linear-gradient(110deg, #10161B 0%, #0C1116 45%, #13120E 100%)'
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B22] border border-[#252C34] text-[11px] font-semibold tracking-wider uppercase text-[#A9B0BA]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8C982] shadow-[0_0_6px_#E8C982]" />
              <span>PLACEMENT READINESS METRICS • PRS_{readiness?.scoringVersion || 'v1.0.0'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold -tracking-[0.02em] text-[#F7F7F5] leading-tight">
              Placement Readiness Overview
            </h1>
            <p className="text-sm text-[#A9B0BA] font-normal leading-relaxed">
              Targeting <strong className="text-white">{readiness?.targetRole || 'SDE I'}</strong> at{' '}
              <strong className="text-white">{readiness?.targetCompany || 'General Industry'}</strong>. Evaluated across 6 standardized performance dimensions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="inline-flex items-center gap-2 h-[44px] px-5 rounded-[12px] bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] text-xs font-bold shadow-[0_2px_16px_rgba(232,201,130,0.25)] transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-[#05070A] ${recalculating ? 'animate-spin' : ''}`} />
              <span>{recalculating ? 'Recalculating...' : 'Recalculate PRS'}</span>
            </button>

            <Link
              to="/readiness/history"
              className="inline-flex items-center gap-2 h-[44px] px-4 rounded-[12px] bg-[#11171D] hover:bg-[#151B22] text-[#A9B0BA] hover:text-[#F7F7F5] text-xs font-semibold border border-[#252C34] hover:border-[#E8C982]/40 transition-all transform hover:-translate-y-0.5"
            >
              <Clock className="w-3.5 h-3.5 text-[#E8C982]" />
              <span>History</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#10161C] border border-[#FF5A5F]/40 rounded-[16px] flex items-center gap-3 text-[#FF5A5F] text-xs">
          <AlertCircle className="w-4 h-4 text-[#FF5A5F] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Metric Cards: Interactive PRS, Confidence, Target Benchmark */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: PRS Gauge with Circular Progress */}
        <div className="bg-[#10161C] rounded-[18px] border border-[#252D35] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.30)] flex flex-col justify-between hover:border-[#E8C982]/40 hover:-translate-y-1 transition-all duration-200 group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-[11px] font-semibold text-[#68717D] uppercase tracking-wider">PLACEMENT READINESS SCORE</span>
              <Award className="w-4 h-4 text-[#E8C982]" />
            </div>

            <div className="flex items-center justify-between mt-5 gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#F7F7F5] tracking-tight">{prsScore}</span>
                  <span className="text-[#68717D] font-semibold text-sm">/ 100</span>
                </div>
                <div className="mt-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold border tracking-wider ${bandInfo.color}`}>
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
                    className="stroke-[#181E25]"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    stroke={prsScore < 40 ? '#FF5A5F' : prsScore < 70 ? '#F2B84B' : '#35D07F'}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={prsOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-extrabold text-[#F7F7F5]">{prsScore}%</span>
                  <span className="text-[9px] text-[#68717D]">INDEX</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#68717D] mt-5 pt-3 border-t border-white/[0.06] leading-relaxed">
            Composite readiness index computed deterministically from active assessment, resume, and interview evaluations.
          </p>
        </div>

        {/* Card 2: Assessment Confidence with Teal -> Green Ring */}
        <div className="bg-[#10161C] rounded-[18px] border border-[#252D35] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.30)] flex flex-col justify-between hover:border-[#E8C982]/40 hover:-translate-y-1 transition-all duration-200 group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-[11px] font-semibold text-[#68717D] uppercase tracking-wider">ASSESSMENT CONFIDENCE</span>
              <ShieldCheck className="w-4 h-4 text-[#20D3C2]" />
            </div>

            <div className="flex items-center justify-between mt-5 gap-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#F7F7F5] tracking-tight">{confidenceScore}%</span>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] text-[#20D3C2] font-bold bg-[#20D3C2]/10 px-2.5 py-0.5 rounded-full border border-[#20D3C2]/25">
                    VERIFIED RELIABILITY
                  </span>
                </div>
              </div>

              {/* Circular SVG Confidence Ring */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                  <defs>
                    <linearGradient id="readinessTealGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#20D3C2" />
                      <stop offset="100%" stopColor="#35D07F" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    className="stroke-[#181E25]"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    stroke="url(#readinessTealGreen)"
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
          </div>
          <p className="text-xs text-[#68717D] mt-5 pt-3 border-t border-white/[0.06] leading-relaxed">
            Reflects data coverage across {readiness?.availableEvidenceCount || 1}/6 dimensions, temporal recency, and profile depth.
          </p>
        </div>

        {/* Card 3: Target Company Benchmark */}
        <div className="bg-[#10161C] rounded-[18px] border border-[#252D35] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.30)] flex flex-col justify-between hover:border-[#E8C982]/40 hover:-translate-y-1 transition-all duration-200 group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-[11px] font-semibold text-[#68717D] uppercase tracking-wider">TARGET BENCHMARK</span>
              <Building2 className="w-4 h-4 text-[#35D07F]" />
            </div>

            <div className="flex items-baseline gap-2 mt-5">
              <span className="text-4xl sm:text-5xl font-extrabold text-[#F7F7F5] tracking-tight">
                {readiness?.companyReadinessScore != null ? readiness.companyReadinessScore : 'N/A'}
              </span>
              {readiness?.companyReadinessScore != null && <span className="text-[#68717D] font-bold text-sm">/ 100</span>}
            </div>
            <p className="text-xs font-semibold text-[#A9B0BA] mt-3">
              {readiness?.targetCompany || 'General Industry'}
            </p>
          </div>

          <Link
            to="/skill-gaps"
            className="mt-5 pt-3 border-t border-white/[0.06] inline-flex items-center justify-between text-xs font-semibold text-[#E8C982] hover:text-[#F5DFA8] transition-colors"
          >
            <span>Inspect Benchmark Gaps</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Transparent Explanation Banner */}
      <div className="bg-[#10161C] rounded-[18px] border border-[#252D35] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.25)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#E8C982] uppercase tracking-wider">
          <Zap className="w-4 h-4 text-[#E8C982]" />
          <span>Explainable Diagnostic Summary</span>
        </div>
        <p className="text-sm font-medium text-[#F7F7F5] leading-relaxed">
          {readiness?.explanationSummary}
        </p>

        {readiness?.availableEvidenceCount < 3 && (
          <div className="p-3.5 bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 rounded-xl flex items-start gap-3 text-[#FF5A5F] text-xs mt-2">
            <AlertCircle className="w-4 h-4 text-[#FF5A5F] shrink-0 mt-0.5" />
            <span>
              Your readiness score is based on limited assessment data. Complete remaining diagnostic MCQs, upload your latest resume, and conduct mock interviews to increase confidence and unlock deeper calibration.
            </span>
          </div>
        )}
      </div>

      {/* Component Dimensions Breakdown (0-100) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold text-[#F7F7F5]">Performance Dimension Breakdown</h2>
          <span className="text-xs text-[#68717D] font-mono">Normalized Weight Framework ({readiness?.scoringVersion || 'v1.0.0'})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Coding */}
          <Link
            to="/coding"
            className="bg-[#10161C] p-5 rounded-[16px] border border-[#252D35] shadow-xs hover:border-[#E8C982]/40 hover:-translate-y-1 transition-all duration-200 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#68717D] uppercase tracking-wider">Coding Sandbox (25%)</span>
              <Code className="w-4 h-4 text-[#68717D] group-hover:text-[#E8C982] transition-colors" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F7F7F5] group-hover:text-white">
                {readiness?.codingScore != null ? `${readiness.codingScore}%` : 'Unavailable'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#151B22] text-[#A9B0BA] rounded border border-[#252C34]">
                Sandbox
              </span>
            </div>
            <p className="text-[11px] text-[#68717D] mt-2">Algorithm implementation in isolated sandbox</p>
          </Link>

          {/* Technical Core */}
          <Link
            to="/assessments"
            className="bg-[#10161C] p-5 rounded-[16px] border border-[#252D35] shadow-xs hover:border-[#E8C982]/40 hover:-translate-y-1 transition-all duration-200 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#68717D] uppercase tracking-wider">Technical Core (20%)</span>
              <BrainCircuit className="w-4 h-4 text-[#68717D] group-hover:text-[#E8C982] transition-colors" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F7F7F5] group-hover:text-white">
                {readiness?.technicalScore != null ? `${readiness.technicalScore}%` : 'N/A'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#35D07F]/10 text-[#35D07F] rounded border border-[#35D07F]/25">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#68717D] mt-2">Core CS, OOP, DBMS, &amp; System Architecture</p>
          </Link>

          {/* Aptitude */}
          <Link
            to="/aptitude"
            className="bg-[#10161C] p-5 rounded-[16px] border border-[#252D35] shadow-xs hover:border-[#E8C982]/40 hover:-translate-y-1 transition-all duration-200 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#68717D] uppercase tracking-wider">Aptitude &amp; Logic (15%)</span>
              <TrendingUp className="w-4 h-4 text-[#68717D] group-hover:text-[#E8C982] transition-colors" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F7F7F5] group-hover:text-white">
                {readiness?.aptitudeScore != null ? `${readiness.aptitudeScore}%` : 'N/A'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#35D07F]/10 text-[#35D07F] rounded border border-[#35D07F]/25">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#68717D] mt-2">Quantitative, Logical Reasoning, &amp; Verbal</p>
          </Link>

          {/* Resume */}
          <Link
            to="/resume"
            className="bg-[#10161C] p-5 rounded-[16px] border border-[#252D35] shadow-xs hover:border-[#E8C982]/40 hover:-translate-y-1 transition-all duration-200 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#68717D] uppercase tracking-wider">Resume Readiness (15%)</span>
              <FileText className="w-4 h-4 text-[#68717D] group-hover:text-[#E8C982] transition-colors" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F7F7F5] group-hover:text-white">
                {readiness?.resumeScore != null ? `${readiness.resumeScore}%` : 'N/A'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#35D07F]/10 text-[#35D07F] rounded border border-[#35D07F]/25">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#68717D] mt-2">ATS Parsability, Skill Depth, &amp; Action Verbs</p>
          </Link>

          {/* Interview */}
          <Link
            to="/interview"
            className="bg-[#10161C] p-5 rounded-[16px] border border-[#252D35] shadow-xs hover:border-[#E8C982]/40 hover:-translate-y-1 transition-all duration-200 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#68717D] uppercase tracking-wider">Mock Interview (15%)</span>
              <Bot className="w-4 h-4 text-[#68717D] group-hover:text-[#E8C982] transition-colors" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F7F7F5] group-hover:text-white">
                {readiness?.interviewScore != null ? `${readiness.interviewScore}%` : 'N/A'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#35D07F]/10 text-[#35D07F] rounded border border-[#35D07F]/25">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#68717D] mt-2">Verbal Technical &amp; HR Behavioral Rounds</p>
          </Link>

          {/* Communication */}
          <Link
            to="/interview"
            className="bg-[#10161C] p-5 rounded-[16px] border border-[#252D35] shadow-xs hover:border-[#E8C982]/40 hover:-translate-y-1 transition-all duration-200 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#68717D] uppercase tracking-wider">Communication (10%)</span>
              <MessageSquare className="w-4 h-4 text-[#68717D] group-hover:text-[#E8C982] transition-colors" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F7F7F5] group-hover:text-white">
                {readiness?.communicationScore != null ? `${readiness.communicationScore}%` : 'N/A'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#35D07F]/10 text-[#35D07F] rounded border border-[#35D07F]/25">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#68717D] mt-2">Clarity, Structure, &amp; Conciseness</p>
          </Link>
        </div>
      </div>

      {/* Actionable Recommendations & Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#10161C] rounded-[18px] border border-[#252D35] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
          <h3 className="font-bold text-[#F7F7F5] text-sm mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#35D07F]" />
            <span>Targeted Improvement Recommendations</span>
          </h3>
          <ul className="space-y-3">
            {readiness?.recommendations?.map((rec, idx) => (
              <li key={idx} className="text-xs text-[#A9B0BA] flex items-start gap-2.5 bg-[#11171D] p-3.5 rounded-xl border border-[#252D35]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8C982] mt-1.5 shrink-0"></span>
                <span className="font-medium leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#10161C] rounded-[18px] border border-[#252D35] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.25)] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#F7F7F5] text-sm mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#E8C982]" />
              <span>Personalized Preparation Roadmap</span>
            </h3>
            <p className="text-xs text-[#A9B0BA] leading-relaxed">
              Your adaptive day-by-day study schedule prioritizes your largest detected skill gaps against configured target company benchmarks.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 h-[42px] px-5 rounded-[12px] bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] text-xs font-bold shadow-[0_2px_14px_rgba(232,201,130,0.25)] transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>Open Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#05070A]" />
            </Link>

            <Link
              to="/skill-gaps"
              className="inline-flex items-center gap-2 h-[42px] px-4 rounded-[12px] bg-[#11171D] hover:bg-[#151B22] text-[#A9B0BA] hover:text-[#F7F7F5] text-xs font-semibold border border-[#252C34] hover:border-[#E8C982]/40 transition-all transform hover:-translate-y-0.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#E8C982]" />
              <span>Inspect Skill Gaps</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
