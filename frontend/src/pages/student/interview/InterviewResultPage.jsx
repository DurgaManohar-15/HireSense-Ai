import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewApi } from '../../../api/interviewApi';
import {
  Bot,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  HelpCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  Code,
  Lightbulb,
} from 'lucide-react';

export const InterviewResultPage = () => {
  const { id } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTurns, setExpandedTurns] = useState({});

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await interviewApi.getFinalReport(id);
        if (res.success && res.data) {
          setReportData(res.data);
          // Expand first turn by default
          setExpandedTurns({ 1: true });
        }
      } catch (err) {
        setError(err.message || 'Failed to load interview report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const toggleTurn = (seq) => {
    setExpandedTurns((prev) => ({
      ...prev,
      [seq]: !prev[seq],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-md mx-auto">
        <p className="text-rose-800 text-sm font-semibold">{error || 'Final report not available yet.'}</p>
        <Link to="/interview" className="mt-4 inline-block px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold">
          Return to Interview Hub
        </Link>
      </div>
    );
  }

  const report = reportData.report || {};

  const getProviderBadge = () => {
    if (reportData.aiProvider === 'MOCK') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <Zap className="w-3.5 h-3.5" />
          Demo / Mock AI Mode (v1.0)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
        <Sparkles className="w-3.5 h-3.5" />
        Gemini 1.5 Flash AI Engine
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {getProviderBadge()}
            {reportData.topic && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                🎯 {reportData.topic}
              </span>
            )}
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
              Depth: {reportData.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Interview Performance Report</h1>
          <p className="mt-1 text-slate-300 text-xs">
            Track: <strong>{reportData.interviewType?.replace('_', ' ')}</strong> • Target: {reportData.targetRole} ({reportData.targetCompany})
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div className="text-center px-2">
            <span className="text-3xl font-extrabold text-white">{reportData.overallScore}%</span>
            <span className="text-[10px] text-slate-400 block uppercase font-bold mt-0.5">Overall Index</span>
          </div>
          <div className="w-[1px] h-10 bg-slate-700"></div>
          <div className="text-center px-2">
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${reportData.passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              {reportData.passed ? 'PLACEMENT READY' : 'NEEDS PRACTICE'}
            </span>
          </div>
        </div>
      </div>

      {/* Component Dimensions Score Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Technical Correctness</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{reportData.technicalScore}%</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Factual depth and domain architecture</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Behavioral &amp; Relevance</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{reportData.behavioralScore}%</span>
          <p className="text-[11px] text-slate-500 mt-0.5">STAR method adherence and company alignment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Communication Quality</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{reportData.communicationScore}%</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Structure, conciseness, and clarity</p>
        </div>
      </div>

      {/* Executive Summary */}
      {report.summaryEvaluation && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Diagnostic Summary</h3>
          <p className="text-sm font-medium text-slate-800 leading-relaxed">{report.summaryEvaluation}</p>
        </div>
      )}

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Key Demonstrated Strengths</span>
          </h3>
          <ul className="space-y-2.5">
            {report.keyStrengths?.map((s, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2 text-rose-700">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span>Identified Weaknesses &amp; Gaps</span>
          </h3>
          <ul className="space-y-2.5">
            {report.keyWeaknesses?.map((w, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-rose-50/40 p-2.5 rounded-xl border border-rose-100">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Topics to Improve & Roadmap Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Topics Requiring Revision</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.topicsToImprove?.map((top, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-amber-50 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200">
                {top}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50/60 to-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
          <h3 className="font-bold text-indigo-950 text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Actionable Preparation Next Steps</span>
          </h3>
          <div className="space-y-2">
            {report.actionableRoadmapSuggestions?.map((sug, idx) => (
              <p key={idx} className="text-xs text-slate-700 leading-relaxed font-medium flex items-start gap-2">
                <span className="font-bold text-indigo-600">•</span>
                <span>{sug}</span>
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Turn-by-Turn Q&A Accordion */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Bot className="w-5 h-5 text-brand-600" />
            <span>Turn-by-Turn Question &amp; Evaluation Review ({reportData.turnReviews?.length || 0})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Review detailed question prompts, your submitted responses, and the AI's dimensional rubric evaluations.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {reportData.turnReviews?.map((turn) => {
            const isExpanded = !!expandedTurns[turn.sequenceNumber];
            const evalObj = turn.evaluation || {};
            return (
              <div key={turn.sequenceNumber} className="p-6 transition-colors">
                <div
                  onClick={() => toggleTurn(turn.sequenceNumber)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      Q{turn.sequenceNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {turn.topic}
                        </span>
                        <span className="text-[10px] text-slate-400">• {turn.wordCount} words</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{turn.questionText}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-brand-600">
                      {evalObj.overallTurnScore !== undefined ? `${evalObj.overallTurnScore}%` : 'N/A'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 space-y-4 pt-4 border-t border-slate-100 animate-fadeIn">
                    {/* Student Answer */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Your Submitted Response
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                        {turn.answerText}
                      </p>
                    </div>

                    {/* Scores Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Relevance</span>
                        <span className="font-bold text-slate-800">{evalObj.relevanceScore}%</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Technical</span>
                        <span className="font-bold text-slate-800">{evalObj.technicalCorrectnessScore}%</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Completeness</span>
                        <span className="font-bold text-slate-800">{evalObj.completenessScore}%</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Clarity</span>
                        <span className="font-bold text-slate-800">{evalObj.clarityScore}%</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-400 block">Communication</span>
                        <span className="font-bold text-slate-800">{evalObj.communicationScore}%</span>
                      </div>
                    </div>

                    {/* Turn Strengths & Improvement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {evalObj.strengths?.length > 0 && (
                        <div className="text-xs text-emerald-900 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                          <strong className="block text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-1">Observed Strength</strong>
                          <p>{evalObj.strengths[0]}</p>
                        </div>
                      )}
                      {evalObj.improvementSuggestions?.length > 0 && (
                        <div className="text-xs text-indigo-900 bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200">
                          <strong className="block text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-1">Actionable Improvement</strong>
                          <p>{evalObj.improvementSuggestions[0]}</p>
                        </div>
                      )}
                    </div>

                    {/* Ideal / Correct Model Answer & Example */}
                    {(turn.modelAnswer || evalObj.modelAnswer) && (
                      <div className="mt-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-900/50 shadow-md">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-800/40">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            Ideal Model Answer &amp; Key Explanation
                          </h5>
                        </div>
                        
                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans mb-4">
                          {turn.modelAnswer || evalObj.modelAnswer}
                        </p>

                        {(turn.practicalExample || evalObj.practicalExample) && (
                          <div className="mt-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300 mb-2">
                              <Code className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Practical Code / Architecture Example:</span>
                            </div>
                            <pre className="bg-slate-950/90 text-emerald-400 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto border border-indigo-900/60 shadow-inner">
                              <code>{turn.practicalExample || evalObj.practicalExample}</code>
                            </pre>
                          </div>
                        )}

                        {evalObj.keyTakeaways && evalObj.keyTakeaways.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-indigo-800/30">
                            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-2">
                              Core Points to Remember:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {evalObj.keyTakeaways.map((takeaway, tIdx) => (
                                <div key={tIdx} className="text-[11px] text-slate-300 flex items-start gap-2 bg-indigo-950/50 p-2 rounded-lg border border-indigo-800/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                                  <span>{takeaway}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between items-center pt-4">
        <Link
          to="/interview/history"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
        >
          <Clock className="w-4 h-4" />
          <span>View All Past Interview Attempts</span>
        </Link>

        <Link
          to="/interview"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start New Interview Session</span>
        </Link>
      </div>
    </div>
  );
};
