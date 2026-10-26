import React, { useState, useEffect } from 'react';
import { readinessApi } from '../../../api/readinessApi';
import { Link } from 'react-router-dom';
import {
  Clock,
  Award,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  AlertCircle,
  BrainCircuit,
  FileText,
  Bot,
} from 'lucide-react';

export const ReadinessHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await readinessApi.getReadinessHistory();
        if (res.success) {
          setHistory(res.data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load readiness history');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[460px] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-500">Loading historical readiness progression...</p>
      </div>
    );
  }

  const getBandBadge = (band) => {
    switch (band) {
      case 'EXCELLENT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'GOOD':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'DEVELOPING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 text-zinc-100">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/readiness"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Placement Readiness Cockpit</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#202934] bg-gradient-to-b from-[#151D26] via-[#10161C] to-[#0A0E13] p-8 sm:p-10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151D26] border border-[#202934] text-[11px] font-semibold tracking-wider uppercase text-[#E8C982] mb-2">
            <Clock className="w-3.5 h-3.5 text-[#E8C982]" />
            <span>Longitudinal Readiness Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Placement Readiness Snapshots
          </h1>
          <p className="text-xs sm:text-sm text-[#8E9CAE] mt-1 max-w-xl">
            Immutable snapshot history tracking candidate readiness progression and confidence growth over time.
          </p>
        </div>

        <Link
          to="/readiness"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#0B0E14] text-xs font-bold shadow-md shadow-[#E8C982]/15 transition-all self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <span>Current Cockpit</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center gap-3 text-rose-300 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Historical Snapshots Container */}
      <div className="bg-[#10161C] rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl overflow-hidden hover:border-[#E8C982]/30 transition-all">
        {history.length === 0 ? (
          <div className="p-16 text-center text-[#6E7C8E] text-xs">
            No snapshots recorded yet. Click 'Recalculate PRS' on the Readiness Cockpit.
          </div>
        ) : (
          <div className="divide-y divide-[#202934]">
            {history.map((snap, idx) => (
              <div
                key={idx}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#151D26]/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-white">{snap.prsScore}%</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${getBandBadge(snap.readinessBand)}`}>
                      {snap.readinessBand}
                    </span>
                    <span className="text-xs font-semibold text-[#8E9CAE]">• Confidence: {snap.confidenceScore}%</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E9CAE] mt-2">
                    <span>Target: <strong className="text-[#CBD5E1]">{snap.targetRole}</strong> ({snap.targetCompany})</span>
                    <span>•</span>
                    <span className="font-mono">{new Date(snap.calculatedAt).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-[#6E7C8E]">{snap.scoringVersion}</span>
                  </div>

                  <p className="text-xs text-[#8E9CAE] mt-2 italic max-w-2xl leading-relaxed">{snap.explanationSummary}</p>
                </div>

                {/* Score Breakdown Pills */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                  <span className="px-3 py-1.5 bg-[#11171D] border border-[#202934] rounded-lg text-xs font-semibold text-[#CBD5E1] font-mono">
                    Tech: {snap.technicalScore != null ? `${snap.technicalScore}%` : 'N/A'}
                  </span>
                  <span className="px-3 py-1.5 bg-[#11171D] border border-[#202934] rounded-lg text-xs font-semibold text-[#CBD5E1] font-mono">
                    Apt: {snap.aptitudeScore != null ? `${snap.aptitudeScore}%` : 'N/A'}
                  </span>
                  <span className="px-3 py-1.5 bg-[#11171D] border border-[#202934] rounded-lg text-xs font-semibold text-[#CBD5E1] font-mono">
                    Resume: {snap.resumeScore != null ? `${snap.resumeScore}%` : 'N/A'}
                  </span>
                  <span className="px-3 py-1.5 bg-[#11171D] border border-[#202934] rounded-lg text-xs font-semibold text-[#CBD5E1] font-mono">
                    Interview: {snap.interviewScore != null ? `${snap.interviewScore}%` : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
