import React from 'react';
import { calculatePageOverflowRisk, generateOnePageOptimizationPlan } from '../services/onePageOptimizer';
import { SPACING_OPTIONS, FONT_SIZE_OPTIONS } from '../data/resumeSchema';
import { X, Check, FileText, Minimize2, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const FitToOnePageModal = ({
  isOpen,
  onClose,
  resumeData,
  customization,
  onApplyOnePageSettings
}) => {
  if (!isOpen) return null;

  const overflowInfo = calculatePageOverflowRisk(resumeData);
  const optimizationPlan = generateOnePageOptimizationPlan(resumeData, customization);

  const handleApply = () => {
    // Apply compact spacing and safe small/normal font size
    const newCustomization = {
      ...customization,
      spacing: SPACING_OPTIONS[0], // Compact
      fontSize: FONT_SIZE_OPTIONS[0] // Small (10.5pt / 11.5px)
    };
    onApplyOnePageSettings(newCustomization);
    toast.success("Applied 1-page layout adjustments: Compact margins & optimized font density!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Minimize2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Fit to One Page Optimizer</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Non-destructive density calibration for strict 1-page canvas</p>
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
          {/* Density Status */}
          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Content Length</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                ~{overflowInfo.estimatedLines} formatted lines
                <span className="text-xs font-normal text-slate-500 ml-2">
                  (Standard target: {overflowInfo.standardPageLimit} lines)
                </span>
              </div>
            </div>
            <div>
              {overflowInfo.isOverflowing ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  +{overflowInfo.overflowPercentage}% Above 1-Page
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Fits 1-Page Canvas
                </span>
              )}
            </div>
          </div>

          {/* Non-Destructive Guarantee */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-xl text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed">
            <strong>Non-Destructive Promise:</strong> We never delete your work experience, education, or projects. Adjustments scale vertical padding and bullet spacing while keeping 100% of your candidate data intact.
          </div>

          {/* Suggested Optimization Actions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Suggested 1-Page Adjustments
            </h3>
            <div className="space-y-3">
              {optimizationPlan.map((opt) => (
                <div key={opt.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{opt.title}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{opt.description}</p>
                    </div>
                    {opt.action && (
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </div>

                  {opt.details && (
                    <div className="mt-2.5 space-y-2 border-t border-slate-100 dark:border-slate-700 pt-2">
                      <span className="text-[11px] font-semibold text-slate-500 block">Identified Wordy Bullet Points:</span>
                      {opt.details.slice(0, 3).map((d, dIdx) => (
                        <div key={dIdx} className="text-[11.5px] bg-slate-50 dark:bg-slate-850 p-2 rounded border border-slate-200 dark:border-slate-750">
                          <span className="text-slate-400 font-mono text-[10px] block">{d.location}</span>
                          <div className="text-slate-500 line-through text-[11px]">{d.original}</div>
                          <div className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px] mt-0.5">
                            ↳ {d.suggested}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Can be reverted anytime from Customization settings.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Apply 1-Page Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
