import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeApi } from '../../../api/resumeApi';
import {
  Layers,
  ArrowLeft,
  Calendar,
  Award,
  ShieldCheck,
  Target,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  ExternalLink,
  GitCompare,
  X,
} from 'lucide-react';

export const ResumeHistoryPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comparison Modal state
  const [comparing, setComparing] = useState(false);
  const [selectedA, setSelectedA] = useState('');
  const [selectedB, setSelectedB] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await resumeApi.getJdAnalysisHistory();
      if (res?.success && res?.data) {
        setAnalyses(res.data);
        if (res.data.length >= 2) {
          setSelectedA(res.data[1].id);
          setSelectedB(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load analysis history:', err);
      setError('Could not load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunComparison = async () => {
    if (!selectedA || !selectedB || selectedA === selectedB) {
      alert('Please select two distinct analyses to compare.');
      return;
    }

    try {
      setLoadingComparison(true);
      const res = await resumeApi.compareAnalyses(selectedA, selectedB);
      if (res?.success && res?.data) {
        setComparisonResult(res.data);
        setComparing(true);
      }
    } catch (err) {
      console.error('Comparison failed:', err);
      alert('Failed to generate comparison.');
    } finally {
      setLoadingComparison(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            to="/resume"
            className="p-2.5 rounded-2xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Resume &amp; JD Analysis History</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Preserved immutable snapshots of your resume iterations, JD matches, and skill gap progressions.
            </p>
          </div>
        </div>

        {analyses.length >= 2 && (
          <button
            onClick={() => {
              setComparing(true);
              if (!comparisonResult) handleRunComparison();
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Iterations</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading analysis history...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="p-12 bg-slate-800/60 border border-slate-700/60 rounded-3xl text-center max-w-lg mx-auto backdrop-blur-xl">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white mb-1">No Analyses Recorded Yet</h2>
          <p className="text-xs text-slate-400 mb-6">
            Upload your resume and evaluate it against a target role or job description to start tracking your progress.
          </p>
          <Link
            to="/resume"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/30 inline-flex items-center gap-2"
          >
            <span>Analyze Resume Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Comparison Bar */}
          {analyses.length >= 2 && (
            <div className="p-5 bg-gradient-to-r from-purple-950/40 to-slate-900/60 border border-purple-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <GitCompare className="w-4 h-4" />
                <span>Quick Progress Comparison:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedA}
                  onChange={(e) => setSelectedA(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      v{a.resumeVersionNumber} - {a.jobTitle || 'Role'} ({formatDate(a.createdAt)})
                    </option>
                  ))}
                </select>

                <span className="text-xs text-slate-400 font-bold">vs</span>

                <select
                  value={selectedB}
                  onChange={(e) => setSelectedB(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      v{a.resumeVersionNumber} - {a.jobTitle || 'Role'} ({formatDate(a.createdAt)})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleRunComparison}
                  disabled={loadingComparison}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 disabled:opacity-50"
                >
                  {loadingComparison ? 'Comparing...' : 'Compare'}
                </button>
              </div>
            </div>
          )}

          {/* History Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {analyses.map((item) => (
              <div
                key={item.id}
                className="p-6 bg-slate-800/60 border border-slate-700/60 rounded-3xl backdrop-blur-xl hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      Resume v{item.resumeVersionNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base truncate mb-1">
                    {item.jobTitle || 'Software Engineer'}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">{item.company || 'Tech Industry'}</p>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 rounded-2xl border border-slate-700/40 text-center mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Resume</span>
                      <span className="text-base font-black text-white">{item.resumeScore || '--'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">ATS</span>
                      <span className="text-base font-black text-emerald-400">{item.atsScore || '--'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">JD Match</span>
                      <span className="text-base font-black text-purple-400">{item.jdMatchScore || '--'}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Strong Matches:</span>
                      <span className="text-emerald-400 font-bold">{item.strongMatchesCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skill Gaps:</span>
                      <span className="text-amber-400 font-bold">
                        {(item.missingMatchesCount || 0) + (item.weakMatchesCount || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <Link
                    to={`/resume/analysis/${item.resumeId}`}
                    className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <span>Full Diagnostic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/skill-gaps"
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Skill Gaps →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {comparing && comparisonResult && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setComparing(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <GitCompare className="w-6 h-6 text-purple-400" />
                <span>Iteration Comparison Report</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Evaluating measured progress between resume version iterations against job criteria.
              </p>
            </div>

            {/* Side-by-side Score Comparison Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Resume Score</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-slate-400">{comparisonResult.resumeScoreA}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-lg font-black text-white">{comparisonResult.resumeScoreB}</span>
                </div>
                <span className={`text-[11px] font-bold block mt-1 ${comparisonResult.resumeScoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {comparisonResult.resumeScoreDelta >= 0 ? `+${comparisonResult.resumeScoreDelta}` : comparisonResult.resumeScoreDelta} pts
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">ATS Score</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-slate-400">{comparisonResult.atsScoreA}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-lg font-black text-emerald-400">{comparisonResult.atsScoreB}</span>
                </div>
                <span className={`text-[11px] font-bold block mt-1 ${comparisonResult.atsScoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {comparisonResult.atsScoreDelta >= 0 ? `+${comparisonResult.atsScoreDelta}` : comparisonResult.atsScoreDelta} pts
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">JD Match</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-slate-400">{comparisonResult.jdMatchScoreA}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-lg font-black text-purple-400">{comparisonResult.jdMatchScoreB}</span>
                </div>
                <span className={`text-[11px] font-bold block mt-1 ${comparisonResult.jdMatchScoreDelta >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
                  {comparisonResult.jdMatchScoreDelta >= 0 ? `+${comparisonResult.jdMatchScoreDelta}` : comparisonResult.jdMatchScoreDelta} pts
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Gaps</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-slate-400">{comparisonResult.skillGapsCountA}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-lg font-black text-amber-400">{comparisonResult.skillGapsCountB}</span>
                </div>
                <span className={`text-[11px] font-bold block mt-1 ${comparisonResult.skillGapsDelta <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {comparisonResult.skillGapsDelta <= 0 ? `${comparisonResult.skillGapsDelta} gaps` : `+${comparisonResult.skillGapsDelta} gaps`}
                </span>
              </div>
            </div>

            {/* Key Measured Improvements */}
            {comparisonResult.keyImprovements?.length > 0 && (
              <div className="p-5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2">
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Measured Progress Highlights
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {comparisonResult.keyImprovements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setComparing(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
