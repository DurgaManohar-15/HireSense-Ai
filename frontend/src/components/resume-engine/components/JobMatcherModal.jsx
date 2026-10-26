import React, { useState } from 'react';
import { extractKeywordsFromJobDescription } from '../services/keywordAnalyzer';
import { X, Search, CheckCircle, AlertCircle, Plus, Sparkles, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const JobMatcherModal = ({
  isOpen,
  onClose,
  resumeData,
  onAddSkillsToResume
}) => {
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    if (!jobDescription || jobDescription.trim().length < 20) {
      toast.error("Please paste a realistic job description (at least a few sentences).");
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      const res = extractKeywordsFromJobDescription(jobDescription, resumeData);
      setAnalysisResult(res);
      setAnalyzing(false);
    }, 400);
  };

  const handleAddSkill = (skill) => {
    onAddSkillsToResume([skill]);
    toast.success(`Added "${skill}" to your resume skills`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Optimize Resume for Job Description</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Extract matching keywords and spot genuine skill coverage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Input Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Paste Target Job Description (JD)
            </label>
            <textarea
              rows={5}
              placeholder="Paste the target job description or requirements section here (e.g. 'Looking for a Software Engineer proficient in Java, Spring Boot, MySQL, REST APIs, Git, Docker, and AWS...')"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[11px] text-slate-400">Character count: {jobDescription.length}</span>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                {analyzing ? 'Analyzing...' : 'Analyze JD Keywords'}
              </button>
            </div>
          </div>

          {/* Ethical AI Disclaimer */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Integrity Guardrail:</strong> Never fabricate skills, metrics, or achievements. Only add keywords for technologies and domains in which you have demonstrated practical familiarity.
            </p>
          </div>

          {/* Results Display */}
          {analysisResult && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              {/* Overall Match Bar */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-semibold text-slate-500">JD Keyword Match Ratio</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{analysisResult.matchPercentage}%</div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 text-right">
                  <div><strong>{analysisResult.matchingSkills.length}</strong> matching skills</div>
                  <div><strong>{analysisResult.missingSkills.length}</strong> missing or unlisted</div>
                </div>
              </div>

              {/* Matching Skills */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Matching Skills in Resume ({analysisResult.matchingSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.matchingSkills.length > 0 ? (
                    analysisResult.matchingSkills.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No exact skill matches identified yet.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills from JD */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Skills in JD Not Currently Listed ({analysisResult.missingSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.missingSkills.map(s => (
                    <span key={s} className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                      <span>{s}</span>
                      <button
                        onClick={() => handleAddSkill(s)}
                        title="Add to your skills if you possess this experience"
                        className="text-blue-600 hover:text-blue-800 opacity-60 group-hover:opacity-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggested Keywords based on user tech stack */}
              {analysisResult.suggestedKeywords.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40">
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Contextually Relevant Keywords You Can Legitimate Add</span>
                  </div>
                  <p className="text-[11.5px] text-blue-800 dark:text-blue-300 mb-2 leading-relaxed">
                    Based on your demonstrated programming languages and frameworks, consider listing these if you have used them:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.suggestedKeywords.map(sk => (
                      <button
                        key={sk}
                        onClick={() => handleAddSkill(sk)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition shadow-xs"
                      >
                        <Plus className="w-3 h-3" /> Add {sk}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
