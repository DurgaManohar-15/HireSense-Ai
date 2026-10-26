import React, { useState, useEffect } from 'react';
import { interviewApi } from '../../../api/interviewApi';
import { Link } from 'react-router-dom';
import {
  Bot,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  ArrowLeft,
  Award,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const InterviewHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await interviewApi.getMyInterviewHistory();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setHistory(list);
    } catch (err) {
      console.error('Failed to load interview history:', err);
      setError(err?.message || 'Failed to load past interview attempts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const formatSessionDate = (rawDate) => {
    if (!rawDate) return 'Recent';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return 'Recent';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500">Loading your interview attempts...</p>
      </div>
    );
  }

  const completedCount = history.filter((h) => h?.status === 'COMPLETED').length;
  const bestScore = history.reduce((max, h) => Math.max(max, h?.overallScore || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/interview"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Mock Interview Hub</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-brand-600 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Placement Readiness Logs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Mock Interview History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your turn-by-turn performance growth across Technical, HR, and Project interview rounds.
          </p>
        </div>

        <Link
          to="/interview"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start New Interview</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Attempts</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{history.length}</span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed Sessions</span>
            <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">{completedCount}</span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Best Readiness Score</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{bestScore}%</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadHistory}
            className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* History Table / Card List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Bot className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600 text-sm">No interview sessions found</p>
            <p className="mt-1">Start your first AI mock interview session from the Mock Interview Hub.</p>
            <Link
              to="/interview"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
            >
              <span>Launch Practice Interview</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((item) => {
              if (!item) return null;
              const typeName = (item.interviewType || 'TECHNICAL').replace(/_/g, ' ');
              const topicName = item.topic || 'General Assessment';
              const difficultyName = item.difficulty || 'MEDIUM';
              const targetRole = item.targetRole || 'Software Engineer';
              const targetCompany = item.targetCompany || 'General Tech';
              const isCompleted = item.status === 'COMPLETED';

              return (
                <div
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      <Bot className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm capitalize">
                          {typeName}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                          {topicName}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                          {difficultyName}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1.5">
                        <span className="font-medium text-slate-600">
                          {targetRole} ({targetCompany})
                        </span>
                        <span>•</span>
                        <span>{formatSessionDate(item.startedAt)}</span>
                        <span>•</span>
                        <span>{item.totalQuestions || 5} Questions</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    {isCompleted ? (
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900">
                            {item.overallScore !== null && item.overallScore !== undefined ? `${item.overallScore}%` : 'N/A'}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                              item.passed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.passed ? 'PASSED' : 'PRACTICE'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg">
                        {item.status || 'IN_PROGRESS'}
                      </span>
                    )}

                    {isCompleted && (
                      <Link
                        to={`/interview/results/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

