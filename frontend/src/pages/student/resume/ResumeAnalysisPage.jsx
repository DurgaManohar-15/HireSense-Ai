import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resumeApi } from '../../../api/resumeApi';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileText,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Zap,
  Check,
  X,
  Edit3,
  HelpCircle,
  Briefcase,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Target,
  BookOpen,
  ArrowRight,
  Database,
  Cloud,
  Code2,
  Compass,
} from 'lucide-react';

export const ResumeAnalysisPage = () => {
  const { resumeId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);
  const [editingSuggestionId, setEditingSuggestionId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [suggestionStatuses, setSuggestionStatuses] = useState({});
  const [activeKeywordCategory, setActiveKeywordCategory] = useState('ALL');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await resumeApi.getResumeAnalysis(resumeId);
        if (res?.success && res?.data) {
          setAnalysis(res.data);
        } else {
          const analyzeRes = await resumeApi.analyzeResume(resumeId);
          if (analyzeRes?.success && analyzeRes?.data) {
            setAnalysis(analyzeRes.data);
          } else {
            setError('Could not retrieve analysis for this resume.');
          }
        }
      } catch (err) {
        try {
          const fallbackRes = await resumeApi.analyzeResume(resumeId);
          if (fallbackRes?.success && fallbackRes?.data) {
            setAnalysis(fallbackRes.data);
            setError('');
          } else {
            setError(err.message || 'Failed to load resume analysis');
          }
        } catch (fallbackErr) {
          setError(err.message || fallbackErr.message || 'Failed to load resume analysis');
        }
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchAnalysis();
    }
  }, [resumeId]);

  const handleSuggestionAction = async (suggestionId, action, customText = null) => {
    try {
      setSuggestionStatuses((prev) => ({ ...prev, [suggestionId]: action }));
      await resumeApi.updateSuggestionStatus(suggestionId, {
        action,
        editedContent: customText,
      });
      setEditingSuggestionId(null);
    } catch (err) {
      console.error('Failed to update suggestion status:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-base font-bold text-white">Running Advanced AI Resume Intelligence...</p>
          <p className="text-xs text-slate-400 mt-1">Calibrating deterministic scores, ATS compliance, and skill evidence</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-8 bg-slate-800/80 border border-slate-700/80 rounded-3xl text-center max-w-lg mx-auto shadow-2xl my-12 backdrop-blur-xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Analysis Unavailable</h2>
        <p className="text-slate-400 text-sm mb-6">{error || 'No analysis data found for this resume.'}</p>
        <Link
          to="/resume"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Resume Management</span>
        </Link>
      </div>
    );
  }

  const result = analysis.analysis || {};
  const breakdown = result.scoreBreakdown || {};
  const categorizedKeywords = result.categorizedKeywords || {};
  const sectionReviews = result.sectionReviews || [];
  const skillEvidenceDetails = result.skillEvidenceDetails || [];
  const atsAuditDetails = result.atsAuditDetails || [];
  const contextualQuestions = result.contextualQuestions || [];
  const strengths = result.strengths || [];
  const weaknesses = result.weaknesses || [];
  const tailoredSuggestions = result.tailoredSuggestions || result.recommendations || [];
  const isJdMode = result.mode === 'JOB_DESCRIPTION' || !!result.jdMatchScore;

  // Flatten keywords for tab filtering
  const allKeywords = [
    ...(categorizedKeywords.programmingLanguages || []).map((k) => ({ ...k, cat: 'Languages' })),
    ...(categorizedKeywords.frameworksAndLibraries || []).map((k) => ({ ...k, cat: 'Frameworks' })),
    ...(categorizedKeywords.databases || []).map((k) => ({ ...k, cat: 'Databases' })),
    ...(categorizedKeywords.cloudAndDevOps || []).map((k) => ({ ...k, cat: 'Cloud & DevOps' })),
    ...(categorizedKeywords.toolsAndMethodologies || []).map((k) => ({ ...k, cat: 'Tools' })),
    ...(categorizedKeywords.softSkillsAndDomain || []).map((k) => ({ ...k, cat: 'Soft Skills' })),
  ];

  const filteredKeywords = activeKeywordCategory === 'ALL'
    ? allKeywords
    : allKeywords.filter((k) => k.cat === activeKeywordCategory);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
    return 'bg-rose-500/10 border-rose-500/20 text-rose-300';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header Navigation & Role Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            to="/resume"
            className="p-2.5 rounded-2xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight">AI Resume Diagnostic Intelligence</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                v{analysis.versionNumber || 1}
              </span>
              {isJdMode && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Target className="w-3 h-3" /> JD Match Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Target Role: <span className="text-slate-200 font-semibold">{analysis.targetRole || 'Software Engineer'}</span> • Target: <span className="text-slate-200 font-semibold">{analysis.targetCompany || 'Tech Industry'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/resume/history"
            className="px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/60 transition-all flex items-center gap-2"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Analysis History</span>
          </Link>
          <Link
            to="/skill-gaps"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-1.5"
          >
            <span>View Skill Gaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Score Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Resume Quality Score */}
        <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-3xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Resume Quality Score</span>
            <Award className="w-5 h-5 text-brand-400" />
          </div>
          <div className="my-4 flex items-baseline gap-2">
            <span className={`text-5xl font-black tracking-tight ${getScoreColor(analysis.overallScore || 0)}`}>
              {analysis.overallScore || 0}
            </span>
            <span className="text-slate-500 font-semibold text-lg">/ 100</span>
          </div>
          <div>
            <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${analysis.overallScore || 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Deterministic 6-component weighted rubric evaluation.
            </p>
          </div>
        </div>

        {/* Card 2: ATS-Oriented Compatibility */}
        <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-3xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">ATS Compatibility</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="my-4 flex items-baseline gap-2">
            <span className={`text-5xl font-black tracking-tight ${getScoreColor(analysis.atsOrientedScore || 0)}`}>
              {analysis.atsOrientedScore || 0}
            </span>
            <span className="text-slate-500 font-semibold text-lg">/ 100</span>
          </div>
          <div>
            <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                style={{ width: `${analysis.atsOrientedScore || 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Machine readability, standard section headers &amp; clean text.
            </p>
          </div>
        </div>

        {/* Card 3: JD Match Score / Content Quality */}
        <div className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-3xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              {isJdMode ? 'Job Description Match' : 'Content & Structure'}
            </span>
            {isJdMode ? <Target className="w-5 h-5 text-purple-400" /> : <TrendingUp className="w-5 h-5 text-amber-400" />}
          </div>
          <div className="my-4 flex items-baseline gap-2">
            <span className={`text-5xl font-black tracking-tight ${getScoreColor(isJdMode ? (result.jdMatchScore || 0) : (breakdown.contentQuality?.score || 75))}`}>
              {isJdMode ? (result.jdMatchScore || 0) : (breakdown.contentQuality?.score || 75)}
            </span>
            <span className="text-slate-500 font-semibold text-lg">/ 100</span>
          </div>
          <div>
            <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${isJdMode ? 'bg-gradient-to-r from-purple-500 to-pink-400' : 'bg-gradient-to-r from-amber-500 to-brand-400'}`}
                style={{ width: `${isJdMode ? (result.jdMatchScore || 0) : (breakdown.contentQuality?.score || 75)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              {isJdMode
                ? `${result.jdMatchingSkills?.length || 0} matching skills • ${result.jdMissingSkills?.length || 0} priority gaps`
                : 'Action verbs, impact metrics, and section depth.'}
            </p>
          </div>
        </div>
      </div>

      {/* Deterministic 6-Component Score Breakdown */}
      {breakdown.contentQuality && (
        <div className="p-6 md:p-8 bg-slate-800/60 border border-slate-700/60 rounded-3xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-400" />
                <span>Deterministic Score Rubric Breakdown</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated mathematically across 6 transparent dimensions without arbitrary LLM overrides.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-700/60 rounded-xl text-slate-300 border border-slate-600/60">
              Overall: {breakdown.overallScore}/100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'contentQuality', data: breakdown.contentQuality, weight: '20%' },
              { key: 'skillsRelevance', data: breakdown.skillsRelevance, weight: '20%' },
              { key: 'experienceAndProjects', data: breakdown.experienceAndProjects, weight: '20%' },
              { key: 'keywordRelevance', data: breakdown.keywordRelevance, weight: '15%' },
              { key: 'structureAndReadability', data: breakdown.structureAndReadability, weight: '15%' },
              { key: 'atsCompatibility', data: breakdown.atsCompatibility, weight: '10%' },
            ].map(({ key, data, weight }) => {
              if (!data) return null;
              const isExpanded = expandedSection === key;
              return (
                <div
                  key={key}
                  className="p-5 bg-slate-900/60 border border-slate-700/50 rounded-2xl hover:border-slate-600 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white">{data.categoryName}</h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-800 text-brand-300 rounded-lg border border-slate-700">
                        {weight}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 my-2">
                      <span className={`text-2xl font-black ${getScoreColor(data.score)}`}>
                        {data.score}
                      </span>
                      <span className="text-slate-500 text-xs font-semibold">/ 100</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-2 ml-2 overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${data.score}%` }}
                        ></div>
                      </div>
                    </div>

                    {data.whatIsGood && data.whatIsGood.length > 0 && (
                      <p className="text-[11px] text-emerald-400 flex items-start gap-1.5 mt-2">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{data.whatIsGood[0]}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : key)}
                      className="text-[11px] font-bold text-brand-400 hover:text-brand-300 flex items-center justify-between w-full"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Action Items'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                        {data.whatNeedsImprovement?.length > 0 && (
                          <div>
                            <span className="text-amber-400 font-bold block mb-1">Needs Improvement:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                              {data.whatNeedsImprovement.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {data.recommendedActions?.length > 0 && (
                          <div className="mt-2">
                            <span className="text-brand-400 font-bold block mb-1">Recommended Action:</span>
                            <p className="text-slate-300 bg-brand-950/40 p-2 rounded-xl border border-brand-500/20">
                              {data.recommendedActions[0]}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ATS-Oriented Compatibility Audit */}
      <div className="p-6 md:p-8 bg-slate-800/60 border border-slate-700/60 rounded-3xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>ATS-Oriented Compatibility Audit</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating resume structure, text extractability, and ATS parser safety.
            </p>
          </div>
          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getScoreBg(analysis.atsOrientedScore || 0)}`}>
            {analysis.atsOrientedScore >= 80 ? 'High Compatibility' : analysis.atsOrientedScore >= 60 ? 'Moderate Compatibility' : 'Needs Formatting Refinement'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {atsAuditDetails.map((detail, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/40 text-xs text-slate-300 flex items-start gap-2.5"
            >
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categorized Keyword Analysis */}
      <div className="p-6 md:p-8 bg-slate-800/60 border border-slate-700/60 rounded-3xl backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-brand-400" />
              <span>Categorized Keyword &amp; Skill Footprint</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identified skills and technologies categorized by domain and representation strength.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'Languages', 'Frameworks', 'Databases', 'Cloud & DevOps', 'Tools'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveKeywordCategory(cat)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  activeKeywordCategory === cat
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredKeywords.map((item, idx) => {
            const isStrong = item.representation === 'STRONGLY_REPRESENTED';
            const isWeak = item.representation === 'WEAKLY_REPRESENTED' || item.representation === 'MENTIONED_ONCE';
            const isMissing = item.representation === 'MISSING_FROM_RESUME';

            let badgeStyle = 'bg-slate-900/60 border-slate-700 text-slate-200';
            if (isStrong) badgeStyle = 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300';
            if (isWeak) badgeStyle = 'bg-amber-950/40 border-amber-500/30 text-amber-300';
            if (isMissing) badgeStyle = 'bg-rose-950/40 border-rose-500/30 text-rose-300';

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${badgeStyle}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs truncate" title={item.keyword}>
                    {item.keyword}
                  </span>
                  {item.requiredByJd && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40 font-bold">
                      JD
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span className="truncate">
                    {isStrong ? 'Strong Evidence' : isWeak ? 'Mentioned 1x' : 'Missing in Resume'}
                  </span>
                  {item.occurrenceCount > 0 && (
                    <span className="font-bold text-slate-300">×{item.occurrenceCount}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resume Strengths & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 md:p-8 bg-slate-800/60 border border-slate-700/60 rounded-3xl backdrop-blur-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Resume Strengths</span>
          </h2>
          <div className="space-y-2.5">
            {strengths.map((str, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5"
              >
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gaps to Improve */}
        <div className="p-6 md:p-8 bg-slate-800/60 border border-slate-700/60 rounded-3xl backdrop-blur-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span>Areas to Improve</span>
          </h2>
          <div className="space-y-2.5">
            {weaknesses.map((gap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{gap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Section-by-Section Review with Accept / Edit / Reject */}
      {sectionReviews.length > 0 && (
        <div className="p-6 md:p-8 bg-slate-800/60 border border-slate-700/60 rounded-3xl backdrop-blur-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-brand-400" />
              <span>Section-by-Section Review &amp; AI Tailoring Assistance</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review AI suggestions with full student control. Accept, edit, or reject recommendations.
            </p>
          </div>

          <div className="space-y-4">
            {sectionReviews.map((review, idx) => {
              const sugId = review.suggestionId;
              const currentStatus = (sugId && suggestionStatuses[sugId]) || review.suggestionStatus || 'PENDING';
              const isEditing = editingSuggestionId === sugId;

              return (
                <div
                  key={idx}
                  className="p-5 bg-slate-900/60 border border-slate-700/60 rounded-2xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white text-sm">{review.sectionName}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          review.status === 'GOOD'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : review.status === 'NEEDS_IMPROVEMENT'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {review.status.replace('_', ' ')}
                      </span>
                    </div>

                    {sugId && (
                      <div className="flex items-center gap-1.5">
                        {currentStatus === 'ACCEPTED' ? (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                            <Check className="w-3 h-3" /> Accepted
                          </span>
                        ) : currentStatus === 'REJECTED' ? (
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                            <X className="w-3 h-3" /> Rejected
                          </span>
                        ) : currentStatus === 'EDITED' ? (
                          <span className="text-[11px] font-bold text-brand-400 flex items-center gap-1 bg-brand-950/40 px-2.5 py-1 rounded-lg border border-brand-500/30">
                            <Edit3 className="w-3 h-3" /> Customized
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSuggestionAction(sugId, 'ACCEPT')}
                              className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingSuggestionId(sugId);
                                setEditedText(review.suggestedImprovement);
                              }}
                              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleSuggestionAction(sugId, 'REJECT')}
                              className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Positive Observations & Issues */}
                  {review.positiveObservations?.length > 0 && (
                    <div className="text-[11px] text-emerald-300/90 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                      <span>{review.positiveObservations[0]}</span>
                    </div>
                  )}

                  {review.issuesFound?.length > 0 && (
                    <div className="text-[11px] text-amber-300/90 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                      <span>{review.issuesFound[0]}</span>
                    </div>
                  )}

                  {/* Suggestion Text or Edit Input */}
                  {review.suggestedImprovement && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block mb-1">
                        Suggested Improvement
                      </span>
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full p-2.5 bg-slate-800 border border-brand-500/50 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSuggestionAction(sugId, 'EDIT', editedText)}
                              className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold"
                            >
                              Save Edit
                            </button>
                            <button
                              onClick={() => setEditingSuggestionId(null)}
                              className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                          {review.suggestedImprovement}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contextual Clarifying Questions (Anti-Hallucination Guardrail) */}
      {contextualQuestions.length > 0 && (
        <div className="p-6 md:p-8 bg-slate-800/60 border border-slate-700/60 rounded-3xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white">Contextual Clarifying Questions</h2>
          </div>
          <p className="text-xs text-slate-400">
            HireSense never hallucinates or fabricates skills on your behalf. If you have real experience with these missing tools, clarify your background:
          </p>
          <div className="space-y-3 pt-1">
            {contextualQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-xs text-slate-300 flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Learning Action Roadmap */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-brand-950/60 to-purple-950/60 border border-brand-500/30 rounded-3xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-400" />
            <span>Ready to close your skill gaps?</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Translate this resume audit directly into your customized preparation roadmap and practice assessments.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/skill-gaps"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-600/60 transition-all"
          >
            Detailed Skill Gaps
          </Link>
          <Link
            to="/roadmap"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-1.5"
          >
            <span>Open Study Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
