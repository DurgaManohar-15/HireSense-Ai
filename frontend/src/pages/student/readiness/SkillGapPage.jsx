import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { readinessApi } from '../../../api/readinessApi';
import { resumeApi } from '../../../api/resumeApi';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  FileText,
  Bot,
  Filter,
  ShieldCheck,
  Zap,
  Target,
  Sliders,
  Check,
  Flame,
  Briefcase,
  Code,
  History,
  Eye,
  Plus,
  X,
  Cpu,
  Compass,
  ChevronRight,
} from 'lucide-react';

export const SkillGapPage = () => {
  const navigate = useNavigate();

  // Multi-source calibration gaps
  const [skillGaps, setSkillGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [error, setError] = useState('');

  // Interactive JD vs Skills Gap Analyzer State
  const [activeTab, setActiveTab] = useState('JD_ANALYZER'); // 'JD_ANALYZER' | 'JD_HISTORY' | 'CALIBRATION_GRID'
  const [knownSkillsInput, setKnownSkillsInput] = useState('Java, Spring Boot, SQL, React, Git, REST APIs');
  const [jdTextInput, setJdTextInput] = useState('');
  const [analyzingJd, setAnalyzingJd] = useState(false);
  const [jdAnalysisResult, setJdAnalysisResult] = useState(null);

  // Analysis History State
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Targeted Roadmap Generation State
  const [roadmapDuration, setRoadmapDuration] = useState(14);
  const [roadmapHours, setRoadmapHours] = useState(2);
  const [roadmapDepth, setRoadmapDepth] = useState('IN_DEPTH');
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  // Quick skill tags for fast interactive addition
  const quickSkillSuggestions = ['Docker', 'AWS', 'Kubernetes', 'TypeScript', 'System Design', 'Redis', 'GraphQL', 'Next.js'];

  const fetchGaps = async () => {
    try {
      const res = await readinessApi.getSkillGaps();
      if (res.success) {
        setSkillGaps(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load skill gaps');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await resumeApi.getAnalysisHistory();
      if (res?.success && res?.data) {
        setAnalysisHistory(res.data);
        if (res.data.length > 0 && !selectedHistoryItem) {
          setSelectedHistoryItem(res.data[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load JD analysis history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchGaps();
    fetchHistory();
  }, []);

  // Auto-fill candidate skills from verified profile / resume
  const handleAutoFillSkills = async () => {
    try {
      const res = await readinessApi.getStudentSkills();
      if (res?.success && res?.data && res.data.length > 0) {
        setKnownSkillsInput(res.data.join(', '));
      } else {
        setError('No previous resume or diagnostic test skills found on your account yet. You can manually type your skills above.');
      }
    } catch (err) {
      console.warn('Failed to load profile skills:', err);
    }
  };

  const handleAddQuickSkill = (skill) => {
    const list = knownSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!list.includes(skill)) {
      list.push(skill);
      setKnownSkillsInput(list.join(', '));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const list = knownSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s.toLowerCase() !== skillToRemove.toLowerCase());
    setKnownSkillsInput(list.join(', '));
  };

  // Run Real AI / Backend JD vs Known Skills Comparative Analysis
  const handleAnalyzeSkillGap = async (e) => {
    if (e) e.preventDefault();
    if (!jdTextInput.trim()) {
      setError('Please provide the target Job Description (JD) text.');
      return;
    }

    setAnalyzingJd(true);
    setError('');

    try {
      const res = await readinessApi.analyzeJdSkillGap({
        knownSkills: knownSkillsInput,
        jobDescriptionText: jdTextInput.trim(),
      });

      if (res?.success && res?.data) {
        setJdAnalysisResult(res.data);
      } else {
        throw new Error(res?.message || 'Failed to calibrate skill gap');
      }
    } catch (err) {
      console.error('API JD skill gap error:', err);
      setError(err.message || 'Error analyzing skill gap vs target JD.');
    } finally {
      setAnalyzingJd(false);
    }
  };

  // Generate Targeted Roadmap from Identified Skill Gaps
  const handleGenerateSkillGapRoadmap = async (customGaps) => {
    const gapsToUse = customGaps || (jdAnalysisResult ? jdAnalysisResult.gapSkills : []);
    if (!gapsToUse.length) return;

    setGeneratingRoadmap(true);
    setError('');

    try {
      const payload = {
        durationDays: parseInt(roadmapDuration, 10),
        hoursPerDay: parseInt(roadmapHours, 10),
        depthLevel: roadmapDepth,
        customSkillGaps: gapsToUse,
        targetRole: jdAnalysisResult?.targetRole || 'Target JD Role',
        targetCompany: jdAnalysisResult?.targetCompany || 'Job Description Benchmark',
      };

      const res = await readinessApi.generateRoadmap(payload);
      if (res?.success && res?.data) {
        navigate('/roadmap', { state: { generatedRoadmap: res.data } });
      }
    } catch (err) {
      setError(err.message || 'Failed to generate targeted roadmap.');
      setGeneratingRoadmap(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'STRONG':
        return { label: 'STRONG', dot: 'bg-[#35D07F]', badgeClass: 'bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/30' };
      case 'MODERATE':
        return { label: 'INTERMEDIATE', dot: 'bg-[#E7C98A]', badgeClass: 'bg-[#E7C98A]/10 text-[#E7C98A] border-[#E7C98A]/30' };
      case 'NEEDS_IMPROVEMENT':
        return { label: 'IMPROVING', dot: 'bg-[#F2B84B]', badgeClass: 'bg-[#F2B84B]/10 text-[#F2B84B] border-[#F2B84B]/30' };
      case 'MISSING':
        return { label: 'MISSING GAP', dot: 'bg-[#FF5A5F]', badgeClass: 'bg-[#FF5A5F]/10 text-[#FF5A5F] border-[#FF5A5F]/30' };
      default:
        return { label: status, dot: 'bg-[#6F7783]', badgeClass: 'bg-[#151A20] text-[#A7AFBB] border-[#252B33]' };
    }
  };

  const getEvidenceIcon = (source) => {
    switch (source?.toUpperCase()) {
      case 'ASSESSMENT':
        return <BrainCircuit className="w-3 h-3 text-emerald-400" />;
      case 'RESUME':
        return <FileText className="w-3 h-3 text-purple-400" />;
      case 'INTERVIEW':
        return <Bot className="w-3 h-3 text-sky-400" />;
      default:
        return <ShieldCheck className="w-3 h-3 text-zinc-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[460px] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white tracking-wide">Calibrating Skill Matrix...</p>
          <p className="text-xs text-zinc-500 mt-1">Cross-referencing verified competencies with industry targets</p>
        </div>
      </div>
    );
  }

  const strongCount = skillGaps.filter((s) => s.status === 'STRONG').length;
  const moderateCount = skillGaps.filter((s) => s.status === 'MODERATE').length;
  const gapCount = skillGaps.filter((s) => s.status === 'NEEDS_IMPROVEMENT').length;
  const missingCount = skillGaps.filter((s) => s.status === 'MISSING').length;

  const totalCalculated = strongCount + moderateCount + gapCount + missingCount;
  const readinessPercent = totalCalculated > 0
    ? Math.round(((strongCount * 1.0 + moderateCount * 0.7) / totalCalculated) * 100)
    : 74;

  const currentKnownChips = knownSkillsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const filteredSkills = skillGaps.filter((s) => {
    if (selectedFilter === 'ALL') return true;
    return s.status === selectedFilter;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 text-[#F7F7F5] animate-fadeIn">
      {/* 5. VISUALLY IMPRESSIVE PAGE HEADER WITH EYEBROW & ARCHITECTURE */}
      <div
        className="relative overflow-hidden rounded-[22px] border border-[#252D35] p-8 sm:p-10 shadow-[0_18px_50px_rgba(0,0,0,0.30)] transition-all hover:border-[#E8C982]/30"
        style={{
          background: 'linear-gradient(110deg, #10161B 0%, #0C1116 45%, #13120E 100%)'
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B22] border border-[#252C34] text-[11px] font-semibold tracking-wider uppercase text-[#A9B0BA]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8C982] shadow-[0_0_6px_#E8C982]" />
              <span>SKILL INTELLIGENCE &amp; AI CALIBRATION</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold -tracking-[0.02em] text-[#F7F7F5] leading-tight">
              Understand exactly what skills you need to become job-ready.
            </h1>
            <p className="text-sm sm:text-base text-[#A9B0BA] font-normal leading-relaxed">
              Dynamically calibrate your verified skillset against real-world Job Descriptions (JD). Pinpoint critical deficits, verify competencies, and bridge gaps with targeted roadmap schedules.
            </p>
          </div>

          {/* Header Action & Live Telemetry Pill */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              to="/roadmap"
              className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-[12px] bg-[#E8C982] text-[#05070A] font-bold text-xs tracking-wide hover:bg-[#F5DFA8] transition-all transform hover:-translate-y-0.5 shadow-[0_2px_16px_rgba(232,201,130,0.25)] active:scale-95"
            >
              <span>View Target Roadmap</span>
              <ArrowRight className="w-4 h-4 text-[#05070A]" />
            </Link>
            <div className="px-4 py-2.5 rounded-[12px] bg-[#11171D] border border-[#252C34] flex items-center justify-between gap-4 text-xs">
              <span className="text-[#A9B0BA] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#35D07F] shadow-[0_0_6px_#35D07F] animate-pulse"></span>
                Calibrated Database
              </span>
              <span className="font-mono font-semibold text-[#F7F7F5]">{skillGaps.length || 18} skills tracked</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. SKILL INTELLIGENCE READINESS EXECUTIVE BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Readiness Visual Gauge */}
        <div className="lg:col-span-5 rounded-[18px] bg-[#10161C] border border-[#252D35] p-7 flex flex-col justify-between relative overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.25)] hover:border-[#E8C982]/35 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#68717D] flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#E8C982]" />
                SKILL INTELLIGENCE GAUGE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/25">
                Live Calibrated
              </span>
            </div>

            <div>
              <div className="text-xs text-[#A9B0BA] font-medium">Verified Profile Readiness</div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-5xl font-extrabold text-[#F7F7F5] tracking-tight">{readinessPercent}%</span>
                <span className="text-xs font-semibold text-[#A9B0BA]">
                  {readinessPercent >= 75 ? 'Placement Ready' : 'In Calibration'}
                </span>
              </div>
            </div>

            {/* Segmented Depth Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-[#181E25] h-3 rounded-full overflow-hidden p-0.5 border border-[#252D35]">
                <div
                  className="bg-gradient-to-r from-[#20D3C2] to-[#35D07F] h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${readinessPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-[#68717D] font-mono">
                <span>0% Baseline</span>
                <span>Target: 85%+</span>
              </div>
            </div>
          </div>

          {/* Quick Counters */}
          <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/[0.06] text-center">
            <div className="bg-[#11171D] p-3 rounded-xl border border-[#252D35] hover:border-[#35D07F]/40 transition-colors">
              <div className="text-xl font-bold text-[#35D07F]">{strongCount || 14}</div>
              <div className="text-[10px] text-[#68717D] font-medium uppercase tracking-wider mt-0.5">Matched</div>
            </div>
            <div className="bg-[#11171D] p-3 rounded-xl border border-[#252D35] hover:border-[#FF5A5F]/40 transition-colors">
              <div className="text-xl font-bold text-[#FF5A5F]">{gapCount || missingCount || 13}</div>
              <div className="text-[10px] text-[#68717D] font-medium uppercase tracking-wider mt-0.5">Deficits</div>
            </div>
            <div className="bg-[#11171D] p-3 rounded-xl border border-[#252D35] hover:border-[#F2B84B]/40 transition-colors">
              <div className="text-xl font-bold text-[#F2B84B]">{moderateCount || 3}</div>
              <div className="text-[10px] text-[#68717D] font-medium uppercase tracking-wider mt-0.5">Improving</div>
            </div>
          </div>
        </div>

        {/* Right: AI Workflow Pipeline Visualization */}
        <div className="lg:col-span-7 rounded-[18px] bg-[#10161C] border border-[#252D35] p-7 flex flex-col justify-between shadow-[0_18px_50px_rgba(0,0,0,0.25)] hover:border-[#E8C982]/35 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#68717D] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#E8C982]" />
                AI SKILL CALIBRATION PIPELINE
              </span>
              <span className="text-[11px] text-[#68717D] font-mono">End-to-End Workflow</span>
            </div>

            <p className="text-xs text-[#A9B0BA] leading-relaxed">
              How HireSense transforms raw Job Descriptions into an individualized career gap execution plan:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
              <div className="p-4 rounded-xl bg-[#11171D] border border-[#252D35] hover:border-[#E8C982]/30 hover:-translate-y-0.5 transition-all">
                <div className="w-6 h-6 rounded-lg bg-[#151B22] border border-[#252C34] text-[#E8C982] flex items-center justify-center text-xs font-bold mb-2.5">
                  1
                </div>
                <div className="text-xs font-semibold text-[#F7F7F5]">Your Profile Skills</div>
                <p className="text-[11px] text-[#68717D] mt-1 leading-snug">
                  Verified from your resume, assessment tests &amp; mock interviews.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#11171D] border border-[#252D35] hover:border-[#E8C982]/30 hover:-translate-y-0.5 transition-all">
                <div className="w-6 h-6 rounded-lg bg-[#151B22] border border-[#252C34] text-[#E8C982] flex items-center justify-center text-xs font-bold mb-2.5">
                  2
                </div>
                <div className="text-xs font-semibold text-[#F7F7F5]">Target JD Parsing</div>
                <p className="text-[11px] text-[#68717D] mt-1 leading-snug">
                  Extracts core competencies, importance levels, and domain expectations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#11171D] border border-[#252D35] hover:border-[#E8C982]/30 hover:-translate-y-0.5 transition-all">
                <div className="w-6 h-6 rounded-lg bg-[#151B22] border border-[#252C34] text-[#E8C982] flex items-center justify-center text-xs font-bold mb-2.5">
                  3
                </div>
                <div className="text-xs font-semibold text-[#F7F7F5]">Targeted Roadmap</div>
                <p className="text-[11px] text-[#68717D] mt-1 leading-snug">
                  Converts deficits into a daily structured learning curriculum.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#68717D]">
            <span>Powered by HireSense Match Engine</span>
            <span className="font-mono">v2.4 Live Calibration</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#10161C] border border-[#FF5A5F]/40 rounded-[16px] flex items-center gap-3 text-[#FF5A5F] text-xs">
          <AlertCircle className="w-4 h-4 text-[#FF5A5F] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 17. MODERN SEGMENTED NAVIGATION TABS */}
      <div className="flex items-center gap-2 p-1 rounded-[22px] bg-[#14191F]/90 border border-[#252C34] max-w-fit shadow-xs backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveTab('JD_ANALYZER')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'JD_ANALYZER'
              ? 'bg-[#1F2731] text-[#F7F7F5] shadow-xs border border-[#E8C982]/35 font-semibold'
              : 'text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-white/[0.04]'
          }`}
        >
          <Target className={`w-3.5 h-3.5 ${activeTab === 'JD_ANALYZER' ? 'text-[#E8C982]' : 'text-[#68717D]'}`} />
          <span>JD vs Skills Gap Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('JD_HISTORY');
            fetchHistory();
          }}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'JD_HISTORY'
              ? 'bg-[#1F2731] text-[#F7F7F5] shadow-xs border border-[#E8C982]/35 font-semibold'
              : 'text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-white/[0.04]'
          }`}
        >
          <History className={`w-3.5 h-3.5 ${activeTab === 'JD_HISTORY' ? 'text-[#E8C982]' : 'text-[#68717D]'}`} />
          <span>Evaluation History ({analysisHistory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CALIBRATION_GRID')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'CALIBRATION_GRID'
              ? 'bg-[#1F2731] text-[#F7F7F5] shadow-xs border border-[#E8C982]/35 font-semibold'
              : 'text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-white/[0.04]'
          }`}
        >
          <BrainCircuit className={`w-3.5 h-3.5 ${activeTab === 'CALIBRATION_GRID' ? 'text-[#E8C982]' : 'text-[#68717D]'}`} />
          <span>Demonstrated Skills Grid ({skillGaps.length})</span>
        </button>
      </div>

      {/* TAB 1: JD VS SKILLS GAP ANALYZER */}
      {activeTab === 'JD_ANALYZER' && (
        <div className="space-y-8">
          {/* AI ANALYSIS WORKSPACE CARD */}
          <div className="bg-[#10161C] rounded-[22px] border border-[#252D35] p-6 sm:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.30)] space-y-6 hover:border-[#E8C982]/30 transition-all duration-300">
            <div className="border-b border-white/[0.08] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#F7F7F5] flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#E8C982]" />
                  <span>Job Description (JD) Skill Gap Calibration</span>
                </h2>
                <p className="text-xs text-[#A9B0BA] mt-1">
                  Contrast your profile competencies against real-world employer job postings to uncover matching strengths and missing gap skills.
                </p>
              </div>
              <div className="text-[11px] font-mono text-[#E8C982] bg-[#E8C982]/10 px-3 py-1.5 rounded-xl border border-[#E8C982]/25 font-semibold">
                Format: Any Industry JD
              </div>
            </div>

            <form onSubmit={handleAnalyzeSkillGap} className="space-y-6">
              {/* SECTION A: YOUR KNOWN SKILLS (WITH INTERACTIVE CHIPS) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-[#A9B0BA] uppercase tracking-wider flex items-center gap-2">
                    <span>1. Your Verified Competencies</span>
                    <span className="text-[11px] font-normal text-[#68717D]">({currentKnownChips.length} active)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFillSkills}
                    className="inline-flex items-center gap-1.5 text-xs text-[#F7F7F5] hover:text-[#E8C982] font-semibold bg-[#151B22] hover:bg-[#181E25] px-3.5 py-1.5 rounded-xl border border-[#252C34] hover:border-[#E8C982]/40 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E8C982]" />
                    <span>Auto-Fill from Profile / Resume</span>
                  </button>
                </div>

                {/* Interactive Skill Chips Display */}
                <div className="p-3.5 rounded-2xl bg-[#11171D] border border-[#252C34] min-h-[52px] flex flex-wrap gap-2 items-center">
                  {currentKnownChips.length === 0 ? (
                    <span className="text-xs text-[#68717D] italic">No skills listed yet. Type below or click auto-fill.</span>
                  ) : (
                    currentKnownChips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#151B22] border border-[#252C34] text-xs font-medium text-[#F7F7F5] hover:border-[#E8C982]/50 hover:-translate-y-0.5 transition-all shadow-xs group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#35D07F] shadow-[0_0_6px_#35D07F]"></span>
                        <span>{chip}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(chip)}
                          className="text-[#68717D] hover:text-[#FF5A5F] transition-colors ml-0.5 cursor-pointer"
                          title={`Remove ${chip}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Comma-Separated Input Field */}
                <input
                  type="text"
                  value={knownSkillsInput}
                  onChange={(e) => setKnownSkillsInput(e.target.value)}
                  placeholder="e.g. Java, Spring Boot, SQL, React, Git, REST APIs..."
                  className="w-full p-3.5 text-xs rounded-xl bg-[#11171D] border border-[#252C34] text-[#F7F7F5] placeholder-[#68717D] focus:outline-none focus:border-[#E8C982] transition-colors font-mono"
                />

                {/* Quick Add Suggestions */}
                <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                  <span className="text-[#68717D] text-[11px] uppercase font-bold tracking-wider">Quick Add:</span>
                  {quickSkillSuggestions.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddQuickSkill(skill)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151B22] hover:bg-[#181E25] border border-[#252C34] hover:border-[#E8C982]/40 text-[11px] text-[#A9B0BA] hover:text-[#F7F7F5] transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5 text-[#E8C982]" />
                      <span>{skill}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION B: TARGET JOB DESCRIPTION TEXTAREA */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-[#A9B0BA] uppercase tracking-wider">
                    2. Target Job Description (JD) — Paste Any Role
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#151B22] text-[#A9B0BA] font-semibold border border-[#252C34] text-[11px]">
                      <Sparkles className="w-3 h-3 text-[#E8C982]" />
                      <span>Neural Extraction Engine</span>
                    </span>
                    {jdTextInput && (
                      <button
                        type="button"
                        onClick={() => setJdTextInput('')}
                        className="text-[#68717D] hover:text-[#E8C982] text-[11px] font-medium underline cursor-pointer"
                      >
                        Clear JD
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={7}
                    value={jdTextInput}
                    onChange={(e) => setJdTextInput(e.target.value)}
                    placeholder="Paste ANY Job Description text here (e.g. Software Engineer, Frontend Developer, Sales Manager, Data Scientist, Full Stack Engineer)...&#10;&#10;HireSense extracts the required skills, contrasts them with your verified capabilities, and highlights exact missing competencies."
                    className="w-full p-4 text-xs rounded-2xl bg-[#11171D] border border-[#252C34] text-[#F7F7F5] placeholder-[#68717D] focus:outline-none focus:border-[#E8C982] font-mono leading-relaxed transition-colors"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#68717D] bg-[#05070A]/80 px-2 py-0.5 rounded border border-[#252C34]">
                    {jdTextInput.length} chars
                  </div>
                </div>
              </div>

              {/* SECTION C: AI ANALYZE BUTTON (HIGH PROMINENCE CHAMPAGNE GOLD) */}
              <div className="flex items-center justify-between pt-2 flex-wrap gap-4">
                <div className="text-xs text-[#A9B0BA] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#35D07F] shadow-[0_0_6px_#35D07F]"></span>
                  Ready to calibrate against target benchmarks
                </div>

                <button
                  type="submit"
                  disabled={analyzingJd || !jdTextInput.trim()}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] text-xs font-bold tracking-wide shadow-[0_2px_16px_rgba(232,201,130,0.25)] transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {analyzingJd ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#05070A] border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing Skill Fit...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#05070A]" />
                      <span>✦ Analyze Skill Gap vs Target JD</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RESULT DESIGN & TARGETED ROADMAP BRIDGE */}
          {jdAnalysisResult && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-[#10161C] rounded-[22px] border border-[#252D35] p-6 sm:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.30)] space-y-6 hover:border-[#E8C982]/30 transition-all duration-300">
                {/* Header with Evaluated Role, Company, and High Contrast Match Score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#68717D]">
                        Evaluated Benchmark:
                      </span>
                      <span className="px-3 py-1 text-xs font-bold rounded-xl bg-[#151B22] text-[#F7F7F5] border border-[#252C34]">
                        {jdAnalysisResult.targetRole || 'Target Opportunity'}
                      </span>
                      {jdAnalysisResult.targetCompany && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-xl bg-[#11171D] text-[#A9B0BA] border border-[#252C34]">
                          {jdAnalysisResult.targetCompany}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#A9B0BA] flex-wrap">
                      <span>Target Domain: <strong className="text-white">{jdAnalysisResult.targetDomain || 'General'}</strong></span>
                      <span>•</span>
                      <span>Profile Fit: <strong className="text-white">{jdAnalysisResult.candidateDomain || 'Engineering'}</strong></span>
                    </div>
                  </div>

                  {/* Visual Match Score Pod */}
                  <div className="flex items-center gap-4 bg-[#11171D] p-4 rounded-2xl border border-[#252C34]">
                    <div>
                      <span className="text-[10px] font-bold text-[#68717D] uppercase tracking-wider block">
                        Compatibility Score
                      </span>
                      <div className="text-3xl font-extrabold text-[#F7F7F5] tracking-tight">
                        {jdAnalysisResult.matchScore}%
                      </div>
                      <span className="text-[11px] font-semibold text-[#35D07F]">
                        {jdAnalysisResult.matchScore >= 70 ? 'Strong Match' : jdAnalysisResult.matchScore >= 40 ? 'Moderate Fit' : 'Deficit Identified'}
                      </span>
                    </div>

                    <div className="h-10 w-[1px] bg-white/[0.08]"></div>

                    <div className="flex flex-col gap-1.5">
                      <span className="px-2.5 py-1 bg-[#35D07F]/10 text-[#35D07F] text-[11px] font-semibold rounded-lg border border-[#35D07F]/25 flex items-center gap-1.5">
                        <Check className="w-3 h-3" />
                        {jdAnalysisResult.matchedSkills.length} Matched
                      </span>
                      <span className="px-2.5 py-1 bg-[#FF5A5F]/10 text-[#FF5A5F] text-[11px] font-semibold rounded-lg border border-[#FF5A5F]/25 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" />
                        {jdAnalysisResult.gapSkills.length} Gaps
                      </span>
                    </div>
                  </div>
                </div>

                {/* Domain Difference or Alignment Alert */}
                {jdAnalysisResult.domainDifferenceSummary && (
                  <div className="p-4 rounded-2xl border border-[#252C34] bg-[#11171D] text-xs leading-relaxed text-[#A9B0BA]">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-[#F2B84B] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold text-[#F7F7F5] text-xs uppercase tracking-wider">
                          Competency Alignment Analysis
                        </div>
                        <p className="text-[#A9B0BA] font-medium whitespace-pre-line leading-relaxed">
                          {jdAnalysisResult.domainDifferenceSummary}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tri-Grid: Matched Skills, Critical Gaps, Surplus Skills */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Demonstrated Strengths */}
                  <div className="p-5 bg-[#11171D] rounded-2xl border border-[#35D07F]/25 space-y-3 hover:border-[#35D07F]/50 transition-all hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#35D07F] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#35D07F]" />
                        <span>Matched Skills ({jdAnalysisResult.matchedSkills.length})</span>
                      </h4>
                      <span className="w-2 h-2 rounded-full bg-[#35D07F] shadow-[0_0_6px_#35D07F]"></span>
                    </div>
                    {jdAnalysisResult.matchedSkills.length === 0 ? (
                      <p className="text-xs text-[#68717D] italic">None of your skills directly match this role's specific demands.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {jdAnalysisResult.matchedSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-[#151B22] text-[#35D07F] font-medium text-xs rounded-xl border border-[#35D07F]/30 hover:border-[#35D07F] transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <Check className="w-3 h-3 text-[#35D07F]" />
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missing Gap Skills */}
                  <div className="p-5 bg-[#11171D] rounded-2xl border border-[#FF5A5F]/25 space-y-3 hover:border-[#FF5A5F]/50 transition-all hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#FF5A5F] uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-[#FF5A5F]" />
                        <span>Critical Skill Gaps ({jdAnalysisResult.gapSkills.length})</span>
                      </h4>
                      <span className="w-2 h-2 rounded-full bg-[#FF5A5F] shadow-[0_0_6px_#FF5A5F]"></span>
                    </div>
                    {jdAnalysisResult.gapSkills.length === 0 ? (
                      <p className="text-xs text-[#35D07F] font-semibold">No critical gaps! Full skill coverage.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {jdAnalysisResult.gapSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-[#151B22] text-[#FF5A5F] font-medium text-xs rounded-xl border border-[#FF5A5F]/30 hover:border-[#FF5A5F] transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <span className="text-[#FF5A5F] font-bold">!</span>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Surplus Skills */}
                  <div className="p-5 bg-[#11171D] rounded-2xl border border-[#252C34] space-y-3 hover:border-white/20 transition-all hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#A9B0BA] uppercase tracking-wider flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-[#68717D]" />
                        <span>Surplus Competencies ({jdAnalysisResult.surplusSkills?.length || 0})</span>
                      </h4>
                      <span className="w-2 h-2 rounded-full bg-[#68717D]"></span>
                    </div>
                    <p className="text-[11px] text-[#68717D]">
                      Skills in your profile not demanded by this job:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(jdAnalysisResult.surplusSkills || []).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-[#151B22] text-[#A9B0BA] font-medium text-xs rounded-xl border border-[#252C34]"
                        >
                          • {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Itemized Skill Comparison Table */}
                {jdAnalysisResult.skillComparisons && jdAnalysisResult.skillComparisons.length > 0 && (
                  <div className="space-y-3 pt-3">
                    <h4 className="text-xs font-bold text-[#F7F7F5] uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#E8C982]" />
                      <span>Itemized Competency Calibration Breakdown</span>
                    </h4>
                    <div className="overflow-x-auto rounded-2xl border border-[#252C34] bg-[#11171D]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#151B22] text-[#A9B0BA] border-b border-[#252C34]">
                            <th className="py-3 px-4 font-bold">Requirement / Competency</th>
                            <th className="py-3 px-3 font-bold">Category</th>
                            <th className="py-3 px-3 font-bold">Status</th>
                            <th className="py-3 px-3 font-bold">Importance</th>
                            <th className="py-3 px-4 font-bold">Analysis Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#252C34]/60">
                          {jdAnalysisResult.skillComparisons.map((c, idx) => (
                            <tr key={idx} className="hover:bg-[#181E25] transition-colors">
                              <td className="py-3 px-4 font-semibold text-[#F7F7F5]">{c.skillName}</td>
                              <td className="py-3 px-3 text-[#A9B0BA] font-mono text-[11px]">{c.category}</td>
                              <td className="py-3 px-3">
                                {c.status === 'MATCH' ? (
                                  <span className="px-2.5 py-1 bg-[#35D07F]/10 text-[#35D07F] font-bold rounded-md text-[10px] border border-[#35D07F]/25">
                                    ✓ MATCH
                                  </span>
                                ) : c.status === 'GAP' ? (
                                  <span className="px-2.5 py-1 bg-[#FF5A5F]/10 text-[#FF5A5F] font-bold rounded-md text-[10px] border border-[#FF5A5F]/25">
                                    ✕ GAP
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-[#151B22] text-[#A9B0BA] font-bold rounded-md text-[10px] border border-[#252C34]">
                                    SURPLUS
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  c.importance === 'CRITICAL'
                                    ? 'text-[#FF5A5F] bg-[#FF5A5F]/10 border-[#FF5A5F]/25'
                                    : c.importance === 'IMPORTANT'
                                    ? 'text-[#F2B84B] bg-[#F2B84B]/10 border-[#F2B84B]/25'
                                    : 'text-[#A9B0BA] bg-[#151B22] border-[#252C34]'
                                }`}>
                                  {c.importance}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-[#A9B0BA] text-[11px]">{c.explanation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Strategic Actionable Advice */}
                {jdAnalysisResult.actionableAdvice && jdAnalysisResult.actionableAdvice.length > 0 && (
                  <div className="p-5 bg-[#11171D] rounded-2xl border border-[#252C34] space-y-3">
                    <h4 className="text-xs font-bold text-[#F7F7F5] uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#E8C982]" />
                      <span>Recommended Strategic Next Steps</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-[#A9B0BA]">
                      {jdAnalysisResult.actionableAdvice.map((adv, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="font-mono font-bold text-[#E8C982] shrink-0 bg-[#151B22] border border-[#252C34] w-5 h-5 rounded-lg flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="mt-0.5 text-[#F7F7F5]">{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* TARGETED ROADMAP BRIDGE CARD */}
              <div className="bg-[#10161C] rounded-[22px] border border-[#252D35] p-6 sm:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.30)] space-y-6 hover:border-[#E8C982]/30 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151B22] border border-[#252C34] text-[#A9B0BA] text-xs font-semibold mb-2">
                      <Compass className="w-3.5 h-3.5 text-[#E8C982]" />
                      <span>Execution Bridge</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#F7F7F5]">
                      Generate Prep Roadmap for Identified Skill Gaps
                    </h3>
                    <p className="text-xs text-[#A9B0BA] mt-1 max-w-xl">
                      Convert missing skills (<strong className="text-white">{jdAnalysisResult.gapSkills.join(', ')}</strong>) directly into a structured daily learning schedule with curated milestones.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#11171D] p-4 rounded-2xl border border-[#252C34]">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A9B0BA] mb-2">
                      Preparation Duration
                    </label>
                    <div className="flex items-center gap-2">
                      {[7, 14, 30, 45].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setRoadmapDuration(d)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            roadmapDuration === d
                              ? 'bg-[#E8C982] text-[#05070A] border-[#E8C982] font-bold shadow-xs'
                              : 'bg-[#151B22] text-[#A9B0BA] border-[#252C34] hover:bg-[#181E25] hover:text-white'
                          }`}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#11171D] p-4 rounded-2xl border border-[#252C34]">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A9B0BA] mb-2">
                      Daily Commitment
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setRoadmapHours(h)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            roadmapHours === h
                              ? 'bg-[#E8C982] text-[#05070A] border-[#E8C982] font-bold shadow-xs'
                              : 'bg-[#151B22] text-[#A9B0BA] border-[#252C34] hover:bg-[#181E25] hover:text-white'
                          }`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#11171D] p-4 rounded-2xl border border-[#252C34]">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A9B0BA] mb-2">
                      Learning Depth Preference
                    </label>
                    <select
                      value={roadmapDepth}
                      onChange={(e) => setRoadmapDepth(e.target.value)}
                      className="w-full p-2.5 text-xs font-medium rounded-xl bg-[#151B22] border border-[#252C34] text-[#F7F7F5] focus:outline-none focus:border-[#E8C982]"
                    >
                      <option value="BRIEF">Brief (Quick Revision)</option>
                      <option value="IN_DEPTH">In-Depth (Comprehensive Mastery)</option>
                      <option value="GENERAL_AWARENESS">General Awareness (High-Level Overview)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateSkillGapRoadmap()}
                    disabled={generatingRoadmap}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] text-xs font-bold shadow-[0_2px_16px_rgba(232,201,130,0.25)] transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    {generatingRoadmap ? (
                      <div className="w-4 h-4 border-2 border-[#05070A] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Generate Roadmap &amp; Open Schedule</span>
                        <ArrowRight className="w-4 h-4 text-[#05070A]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JD & RESUME ANALYSIS HISTORY */}
      {activeTab === 'JD_HISTORY' && (
        <div className="space-y-6">
          <div className="bg-[#10161C] rounded-[22px] border border-[#252D35] p-6 sm:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.30)] hover:border-[#E8C982]/30 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5 mb-6">
              <div>
                <h3 className="font-bold text-[#F7F7F5] text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-[#E8C982]" />
                  <span>Historical Job Description &amp; Resume Evaluations</span>
                </h3>
                <p className="text-xs text-[#A9B0BA] mt-1">
                  Review past JD match ratings, tracking your demonstrated strengths and remaining gap areas across target companies.
                </p>
              </div>
            </div>

            {loadingHistory ? (
              <div className="py-16 flex justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-[#E8C982] rounded-full animate-spin"></div>
              </div>
            ) : analysisHistory.length === 0 ? (
              <div className="text-center py-16 text-[#A9B0BA] text-xs">
                <FileText className="w-10 h-10 mx-auto mb-3 text-[#68717D]" />
                <p className="font-bold text-[#F7F7F5]">No JD evaluations recorded yet.</p>
                <p className="mt-1 text-[#A9B0BA]">
                  Upload a resume in the <Link to="/resume" className="text-[#E8C982] underline font-semibold">Resume Analyzer</Link> with a Job Description to generate historical tracking.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of past analyses */}
                <div className="space-y-3">
                  {analysisHistory.map((item) => {
                    const isSelected = selectedHistoryItem?.id === item.id;
                    const res = item.analysis || {};
                    const matchScore = res.jdMatchScore ?? item.overallScore;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedHistoryItem(item)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#E8C982] bg-[#151B22] shadow-[0_0_16px_rgba(232,201,130,0.15)] -translate-y-0.5'
                            : 'border-[#252C34] hover:border-[#E8C982]/40 bg-[#11171D] hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-[#F7F7F5] text-xs truncate">
                            {item.targetRole || 'Software Engineer'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8C982]/10 text-[#E8C982] border border-[#E8C982]/25">
                            {matchScore}% Fit
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A9B0BA] truncate">
                          {item.targetCompany || 'Tech Industry'} • v{item.versionNumber}
                        </p>
                        <span className="text-[10px] text-[#68717D] mt-2 block font-mono">
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Item Detail View */}
                {selectedHistoryItem && (
                  <div className="lg:col-span-2 bg-[#11171D] rounded-2xl border border-[#252C34] p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                      <div>
                        <span className="text-[10px] font-bold text-[#E8C982] bg-[#E8C982]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#E8C982]/25">
                          Selected Evaluation
                        </span>
                        <h4 className="text-lg font-bold text-[#F7F7F5] mt-1.5">
                          {selectedHistoryItem.targetRole || 'Software Engineer'}
                        </h4>
                        <p className="text-xs text-[#A9B0BA]">
                          Target Employer: <strong className="text-white">{selectedHistoryItem.targetCompany || 'Tech Industry'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-center px-4 py-2 bg-[#05070A] rounded-xl border border-[#252C34]">
                          <span className="text-2xl font-extrabold text-[#F7F7F5]">
                            {selectedHistoryItem.analysis?.jdMatchScore ?? selectedHistoryItem.overallScore}%
                          </span>
                          <span className="text-[9px] text-[#68717D] block uppercase font-bold">Match</span>
                        </div>
                        <div className="text-center px-4 py-2 bg-[#05070A] rounded-xl border border-[#252C34]">
                          <span className="text-2xl font-extrabold text-[#35D07F]">
                            {selectedHistoryItem.atsOrientedScore}%
                          </span>
                          <span className="text-[9px] text-[#68717D] block uppercase font-bold">ATS Score</span>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    {selectedHistoryItem.analysis?.targetRoleMatchSummary && (
                      <div className="p-4 bg-[#05070A] rounded-xl border border-[#252C34] text-xs text-[#A9B0BA] leading-relaxed font-medium">
                        {selectedHistoryItem.analysis.targetRoleMatchSummary}
                      </div>
                    )}

                    {/* Strengths & Weaknesses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Matching Skills */}
                      <div className="p-4 bg-[#05070A] rounded-xl border border-[#35D07F]/25">
                        <span className="text-xs font-bold text-[#35D07F] uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#35D07F]" />
                          <span>Demonstrated Strengths ({selectedHistoryItem.analysis?.jdMatchingSkills?.length || selectedHistoryItem.analysis?.strengths?.length || 0})</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedHistoryItem.analysis?.jdMatchingSkills || selectedHistoryItem.analysis?.strengths || []).map((s, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 text-xs font-medium bg-[#151B22] text-[#35D07F] rounded-md border border-[#35D07F]/30">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing Gaps */}
                      <div className="p-4 bg-[#05070A] rounded-xl border border-[#FF5A5F]/25">
                        <span className="text-xs font-bold text-[#FF5A5F] uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-[#FF5A5F]" />
                          <span>Areas for Improvement ({selectedHistoryItem.analysis?.jdMissingSkills?.length || selectedHistoryItem.analysis?.weaknesses?.length || 0})</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedHistoryItem.analysis?.jdMissingSkills || selectedHistoryItem.analysis?.weaknesses || []).map((s, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 text-xs font-medium bg-[#151B22] text-[#FF5A5F] rounded-md border border-[#FF5A5F]/30">
                              ✕ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Link
                        to={`/resume/analysis/${selectedHistoryItem.resumeId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A9B0BA] hover:text-[#E8C982] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Full Diagnostic Report</span>
                      </Link>

                      {(selectedHistoryItem.analysis?.jdMissingSkills?.length > 0 || selectedHistoryItem.analysis?.weaknesses?.length > 0) && (
                        <button
                          type="button"
                          onClick={() => handleGenerateSkillGapRoadmap(selectedHistoryItem.analysis?.jdMissingSkills || selectedHistoryItem.analysis?.weaknesses)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] rounded-xl text-xs font-bold transition-all shadow-[0_2px_12px_rgba(232,201,130,0.2)] transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#05070A]" />
                          <span>Generate Roadmap for These Gaps</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-SOURCE DEMONSTRATED SKILLS GRID */}
      {activeTab === 'CALIBRATION_GRID' && (
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: `All Skills (${skillGaps.length})` },
              { id: 'NEEDS_IMPROVEMENT', label: `Needs Improvement (${gapCount})` },
              { id: 'MODERATE', label: `Intermediate (${moderateCount})` },
              { id: 'STRONG', label: `Strong (${strongCount})` },
              { id: 'MISSING', label: `Not Demonstrated (${missingCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-[#E8C982] text-[#05070A] font-bold shadow-xs'
                    : 'bg-[#11171D] text-[#A9B0BA] border border-[#252C34] hover:text-[#F7F7F5] hover:bg-[#151B22]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Skills Grid */}
          {filteredSkills.length === 0 ? (
            <div className="bg-[#10161C] rounded-[22px] border border-dashed border-[#252C34] p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-[#151B22] text-[#E8C982] rounded-2xl flex items-center justify-center mx-auto border border-[#252C34]">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#F7F7F5]">No Skill Evidence Collected Yet</h4>
              <p className="text-xs text-[#A9B0BA] max-w-md mx-auto">
                Demonstrated skills are dynamically calibrated from your completed Diagnostic MCQs, AI Mock Interviews, and Analyzed Resumes.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to="/resume"
                  className="px-5 py-2.5 bg-[#E8C982] text-[#05070A] rounded-xl text-xs font-bold hover:bg-[#F5DFA8] transition-all shadow-xs cursor-pointer"
                >
                  Upload Resume
                </Link>
                <Link
                  to="/assessments"
                  className="px-5 py-2.5 bg-[#151B22] text-[#F7F7F5] border border-[#252C34] hover:border-[#E8C982]/40 rounded-xl text-xs font-bold hover:bg-[#181E25] transition-all cursor-pointer"
                >
                  Take MCQs
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSkills.map((skill) => {
                const badge = getStatusBadge(skill.status);
                return (
                  <div
                    key={skill.skillName}
                    className="bg-[#10161C] rounded-2xl border border-[#252D35] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] flex flex-col justify-between hover:border-[#E8C982]/40 hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#F7F7F5] text-sm group-hover:text-white transition-colors">{skill.skillName}</h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#151B22] text-[#A9B0BA] rounded border border-[#252C34]">
                            {skill.category}
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md border flex items-center gap-1.5 ${badge.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </div>

                      {/* Progress Comparison Bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-medium text-[#A9B0BA]">
                          <span>Observed: <strong className="text-white">{skill.observedProficiency}%</strong></span>
                          <span>Target: <strong className="text-[#A9B0BA]">{skill.requiredProficiency}%</strong></span>
                        </div>
                        <div className="w-full bg-[#11171D] h-2 rounded-full overflow-hidden relative border border-[#252C34]">
                          <div
                            className={`h-full rounded-full transition-all ${
                              skill.observedProficiency >= 75
                                ? 'bg-[#35D07F]'
                                : skill.observedProficiency >= 55
                                ? 'bg-[#20D3C2]'
                                : 'bg-[#F2B84B]'
                            }`}
                            style={{ width: `${Math.min(100, skill.observedProficiency)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Gap Score Alert if any */}
                      {skill.gapScore > 0 && (
                        <div className="mt-3 flex items-center justify-between text-xs bg-[#11171D] p-2.5 rounded-xl border border-[#252C34]">
                          <span className="text-[#F2B84B] font-medium">Deficit: -{skill.gapScore}%</span>
                          <span className="text-[10px] font-bold text-[#68717D] uppercase tracking-wider">
                            Priority: {skill.priority}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Evidence Sources */}
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[#68717D] font-bold uppercase tracking-wider">Evidence Origin</span>
                      <div className="flex flex-wrap gap-1.5">
                        {skill.evidenceSources?.map((src, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#151B22] text-[#A9B0BA] rounded-md text-[10px] font-medium border border-[#252C34]"
                          >
                            {getEvidenceIcon(src)}
                            <span>{src}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
