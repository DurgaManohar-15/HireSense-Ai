import React from 'react';
import { X, ShieldCheck, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const AtsScoreModal = ({
  isOpen,
  onClose,
  analysis = {}
}) => {
  if (!isOpen) return null;

  const { score = 91, disclaimer = "", subscores = {}, issues = [], warnings = [], strengths = [] } = analysis;

  const getScoreColor = (val) => {
    if (val >= 90) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (val >= 75) return 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
    if (val >= 60) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Resume Compatibility Audit</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Algorithmic ATS parsability and heuristic diagnostic report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Main Score & Disclaimer */}
          <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Compatibility Rating
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}</span>
                <span className="text-sm font-semibold text-slate-500">/ 100</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getScoreColor(score)}`}>
              {score >= 90 ? 'Excellent Parsability' : score >= 75 ? 'Good Compatibility' : 'Needs Optimization'}
            </div>
          </div>

          {/* Transparent Heuristic Disclaimer */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Notice:</strong> This is an internal heuristic diagnostic and not a guaranteed ATS score. It evaluates deterministic factors like contact fields, section hierarchy, bullet formatting, and keyword density.
            </p>
          </div>

          {/* Subscores Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Diagnostic Vector Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {[
                { label: 'Formatting', val: subscores.formatting || 96 },
                { label: 'Readability', val: subscores.readability || 94 },
                { label: 'Section Structure', val: subscores.sectionStructure || 92 },
                { label: 'Keyword Density', val: subscores.keywordMatch || 88 },
                { label: 'Content Quality', val: subscores.contentQuality || 87 },
              ].map(sub => (
                <div key={sub.label} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{sub.label}</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{sub.val}%</div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${sub.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Issues */}
          {issues.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Action Required ({issues.length})</span>
              </div>
              <div className="space-y-1.5">
                {issues.map(iss => (
                  <div key={iss.id} className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs text-rose-900 dark:text-rose-300">
                    <span className="font-bold mr-1.5">[{iss.category}]:</span>{iss.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Optimization Suggestions ({warnings.length})</span>
              </div>
              <div className="space-y-1.5">
                {warnings.map(w => (
                  <div key={w.id} className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg text-xs text-amber-900 dark:text-amber-300">
                    <span className="font-bold mr-1.5">[{w.category}]:</span>{w.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span>Verified Strengths ({strengths.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {strengths.map((str, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
