import React, { useState, useEffect } from 'react';
import { assessmentApi } from '../../../api/assessmentApi';
import { Link } from 'react-router-dom';
import { AssessmentConfigModal } from '../../../components/assessment/AssessmentConfigModal';
import {
  History,
  TrendingUp,
  Award,
  ArrowRight,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Clock,
  Target,
  RefreshCw,
} from 'lucide-react';

export const AssessmentHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [topicStats, setTopicStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const [histRes, topicRes] = await Promise.allSettled([
        assessmentApi.getMyAssessmentHistory(),
        assessmentApi.getMyTopicPerformance(),
      ]);

      if (histRes.status === 'fulfilled') {
        const val = histRes.value;
        if (val?.success && Array.isArray(val.data)) {
          setHistory(val.data);
        } else if (Array.isArray(val)) {
          setHistory(val);
        } else {
          setHistory([]);
        }
      } else {
        console.warn('History request failed:', histRes.reason);
        setHistory([]);
      }

      if (topicRes.status === 'fulfilled') {
        const tval = topicRes.value;
        if (tval?.success && Array.isArray(tval.data)) {
          setTopicStats(tval.data);
        } else if (Array.isArray(tval)) {
          setTopicStats(tval);
        } else {
          setTopicStats([]);
        }
      } else {
        setTopicStats([]);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Unable to load attempt history at this moment.');
      setHistory([]);
      setTopicStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Loading your assessment records...</p>
      </div>
    );
  }

  const safeHistory = Array.isArray(history) ? history : [];
  const safeTopics = Array.isArray(topicStats) ? topicStats : [];

  // Calculate improvement delta
  const scores = safeHistory.map((h) => parseFloat(h?.scorePercentage || 0)).reverse();
  const firstScore = scores.length > 0 ? scores[0] : 0;
  const latestScore = scores.length > 0 ? scores[scores.length - 1] : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const delta = scores.length > 1 ? (latestScore - firstScore).toFixed(1) : 0;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/assessments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assessment Hub</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-brand-600" />
            <span>Assessment Attempt History &amp; Progress</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Chronological performance records with verified topic mastery scores.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchHistory}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition"
            title="Refresh History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>New Custom Test</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchHistory} className="font-bold underline text-amber-900">Retry</button>
        </div>
      )}

      {/* Improvement Metrics Card */}
      {safeHistory.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Attempts</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{safeHistory.length}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Latest Score</span>
            <span className="text-2xl font-extrabold text-brand-600 mt-1 block">{latestScore}%</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Highest Score</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{bestScore}%</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Growth Delta</span>
              <span className={`text-2xl font-extrabold mt-1 block ${delta >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {delta >= 0 ? `+${delta}%` : `${delta}%`}
              </span>
            </div>
            <TrendingUp className="w-7 h-7 text-slate-300 shrink-0" />
          </div>
        </div>
      )}

      {/* Topic Performance Highlights */}
      {safeTopics.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-600" />
              <span>Verified Topic Mastery Breakdown</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {safeTopics.length} Topic{safeTopics.length > 1 ? 's' : ''} Evaluated
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
            {safeTopics.map((t) => {
              const pct = parseFloat(t.scorePercentage || 0);
              return (
                <div key={t.topic} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate pr-1">{t.topic}</span>
                    <span className={`font-extrabold ${pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-500'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t.correctCount || 0} / {t.totalQuestions || 0} answered correctly
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Completed Assessments ({safeHistory.length})
          </h2>
          <span className="text-[11px] text-slate-400">Most recent first</span>
        </div>

        {safeHistory.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No Assessment Attempts Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Take your first diagnostic assessment or customize one with the AI Agent to build your verified evidence trail.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                to="/assessments"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Browse Assessments
              </Link>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition"
              >
                Create Custom Assessment
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {safeHistory.map((h, index) => {
              const attemptNumber = safeHistory.length - index;
              const dateStr = h?.completedAt 
                ? new Date(h.completedAt).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                : 'Recently Completed';
              const pct = parseFloat(h?.scorePercentage || 0);

              return (
                <div key={h.id || index} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                      #{attemptNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{h?.assessmentTitle || 'Assessment'}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span>{h?.totalQuestions || 0} Questions</span>
                        <span>•</span>
                        <span>Correct: {h?.correctCount || 0}</span>
                        {h?.timeTakenSeconds ? (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.round(h.timeTakenSeconds / 60)} mins
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="font-extrabold text-base text-slate-900 block">{pct}%</span>
                      <span className={`text-[10px] font-bold uppercase ${h?.passed ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {h?.passed ? 'Passed' : 'Needs Practice'}
                      </span>
                    </div>

                    <Link
                      to={`/assessments/results/${h.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
                    >
                      <span>Review Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Assessment Configuration Modal */}
      <AssessmentConfigModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />
    </div>
  );
};
