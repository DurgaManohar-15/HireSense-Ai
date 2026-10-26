import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessmentApi } from '../../../api/assessmentApi';
import { AssessmentConfigModal } from '../../../components/assessment/AssessmentConfigModal';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  ArrowLeft,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Code2,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Flame,
  Check,
  X,
  SlidersHorizontal,
  History,
} from 'lucide-react';

export const AssessmentResultPage = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, INCORRECT, CORRECT, UNANSWERED

  // Custom Assessment Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await assessmentApi.getResultById(resultId);
        if (res.success && res.data) {
          setResult(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load assessment result');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-md mx-auto my-12">
        <p className="text-rose-800 text-sm font-semibold">{error || 'Result not found'}</p>
        <Link to="/assessments" className="mt-4 inline-block px-4 py-2 bg-rose-600 text-white rounded-xl text-xs">
          Return to Assessments
        </Link>
      </div>
    );
  }

  const formatSeconds = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const filteredQuestions = (result.questionReviews || []).filter((q) => {
    if (filterMode === 'INCORRECT') return q.answered && !q.correct;
    if (filterMode === 'CORRECT') return q.correct;
    if (filterMode === 'UNANSWERED') return !q.answered;
    return true;
  });

  const toggleExpand = (qId) => {
    setExpandedQuestion((prev) => (prev === qId ? null : qId));
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/assessments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessments</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/assessments/history"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <History className="w-3.5 h-3.5" />
            <span>Attempt History</span>
          </Link>
          <Link
            to="/skill-gaps"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            View Skill Gaps
          </Link>
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Retake / Custom Test</span>
          </button>
        </div>
      </div>

      {/* Result Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold border border-brand-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Diagnostic Learning Evaluation Report</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{result.assessmentTitle}</h1>
          <p className="text-slate-300 text-xs">
            {result.resultSummary || 'Performance evaluated and calibrated against deterministic benchmark standards.'}
          </p>
        </div>

        {/* Score Card */}
        <div className="flex items-center gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shrink-0">
          <div className="text-right">
            <div className="text-4xl font-extrabold text-white tracking-tight">{result.scorePercentage}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Score ({result.totalMarksObtained} / {result.maxMarks} Marks)
            </div>
          </div>
          <div className="space-y-1">
            <span
              className={`block px-3 py-1 rounded-xl text-xs font-bold text-center ${
                result.passed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {result.passed ? 'PASSED' : 'NEEDS PRACTICE'}
            </span>
            <span className="block text-[10px] text-slate-400 font-medium text-center">
              {result.performanceBand || 'Standard Benchmark'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Questions</span>
          <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{result.totalQuestions}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/60 shadow-sm text-center">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Correct</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{result.correctCount}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200/60 shadow-sm text-center">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Incorrect</span>
          <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{result.incorrectCount}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Time Taken</span>
          <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{formatSeconds(result.timeTakenSeconds)}</span>
        </div>
      </div>

      {/* Strengths & Weaknesses Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Your Strong Areas</span>
          </div>
          {result.strengths && result.strengths.length > 0 ? (
            <ul className="space-y-2">
              {result.strengths.map((str, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs font-semibold text-emerald-900 leading-relaxed"
                >
                  {str}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
              No topics exceeded the 70% threshold in this session. Focus on the improvement recommendations below.
            </p>
          )}
        </div>

        {/* Areas to Improve */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Areas to Improve</span>
          </div>
          {result.weaknesses && result.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {result.weaknesses.map((weak, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs font-semibold text-amber-900 leading-relaxed"
                >
                  {weak}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700 font-semibold p-3 bg-emerald-50 rounded-xl">
              ✓ Outstanding! No significant topic weaknesses identified for this assessment.
            </p>
          )}
        </div>
      </div>

      {/* Personalized Learning Recommendations */}
      {result.studyRecommendations && result.studyRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 rounded-3xl p-6 border border-brand-800/40 text-white shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">What Should You Study Next?</h3>
          </div>
          <p className="text-xs text-slate-300">
            Targeted recommendations generated from your actual attempt responses:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {result.studyRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-start gap-2.5 font-medium"
              >
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Breakdowns (Topic & Difficulty) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic-wise Breakdown */}
        {result.topicPerformance && result.topicPerformance.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Topic-wise Performance</span>
            </h3>
            <div className="space-y-3">
              {result.topicPerformance.map((tp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{tp.topic}</span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {tp.correctCount}/{tp.totalQuestions} ({Math.round(tp.scorePercentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        tp.scorePercentage >= 70
                          ? 'bg-emerald-500'
                          : tp.scorePercentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, tp.scorePercentage)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty-wise Breakdown */}
        {result.difficultyPerformance && result.difficultyPerformance.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Difficulty-wise Performance</span>
            </h3>
            <div className="space-y-3">
              {result.difficultyPerformance.map((dp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dp.difficulty}</span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {dp.correctCount}/{dp.totalQuestions} ({Math.round(dp.scorePercentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        dp.scorePercentage >= 70
                          ? 'bg-emerald-500'
                          : dp.scorePercentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, dp.scorePercentage)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Question-by-Question Learning Review */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              <span>Question-by-Question Learning Review</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review correct answers, conceptual explanations, real-world examples, and industry use cases.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'ALL', label: `All (${result.totalQuestions})` },
              { id: 'INCORRECT', label: `Incorrect (${result.incorrectCount})` },
              { id: 'CORRECT', label: `Correct (${result.correctCount})` },
              { id: 'UNANSWERED', label: `Unanswered (${result.unansweredCount})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterMode(f.id)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterMode === f.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Review Cards */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const isExpanded = expandedQuestion === q.id || filterMode === 'INCORRECT';
            const selectedOpt = q.options?.find((o) => o.id === q.selectedOptionId);
            const correctOpt = q.options?.find((o) => o.id === q.correctOptionId);

            return (
              <div
                key={q.id || idx}
                className={`rounded-2xl border transition-all ${
                  q.correct
                    ? 'bg-emerald-50/20 border-emerald-200/80'
                    : q.answered
                    ? 'bg-rose-50/20 border-rose-200/80'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        q.correct
                          ? 'bg-emerald-500 text-white'
                          : q.answered
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                    >
                      {q.questionOrder || idx + 1}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {q.topic}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
                          {q.difficulty}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            q.correct
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.answered
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {q.correct ? 'CORRECT' : q.answered ? 'INCORRECT' : 'UNANSWERED'}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {q.questionText}
                      </h4>
                    </div>
                  </div>

                  <button className="p-1 text-slate-400 hover:text-slate-600 transition shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs animate-fadeIn">
                    {/* Options List */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Options &amp; Responses:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt) => {
                          const isUserSelected = opt.id === q.selectedOptionId;
                          const isCorrect = opt.id === q.correctOptionId;

                          let bgStyle = 'bg-white border-slate-200 text-slate-700';
                          if (isCorrect) {
                            bgStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                          } else if (isUserSelected && !isCorrect) {
                            bgStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-semibold ring-1 ring-rose-500';
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition ${bgStyle}`}
                            >
                              <span
                                className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : isUserSelected
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {opt.optionLabel}
                              </span>
                              <div className="flex-1">
                                <span>{opt.optionText}</span>
                                {isUserSelected && (
                                  <span className="block text-[10px] font-bold text-slate-500 mt-0.5">
                                    (Your Answer)
                                  </span>
                                )}
                                {isCorrect && (
                                  <span className="block text-[10px] font-bold text-emerald-600 mt-0.5">
                                    (Correct Answer)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Why Your Answer Was Incorrect / Diagnostic Tip */}
                    {q.whyIncorrectExplanation && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 space-y-1">
                        <div className="font-bold text-[11px] flex items-center gap-1.5 text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Diagnostic Analysis:</span>
                        </div>
                        <p className="text-xs leading-relaxed text-amber-950 font-medium">
                          {q.whyIncorrectExplanation}
                        </p>
                      </div>
                    )}

                    {/* Concept Explanation */}
                    {q.explanation && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                          <span>Conceptual Explanation</span>
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed font-medium">
                          {q.explanation}
                        </p>
                      </div>
                    )}

                    {/* Example and Practical Use Case */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.example && (
                        <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200/60 space-y-1">
                          <div className="font-bold text-[11px] uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Practical Example</span>
                          </div>
                          <p className="text-xs text-indigo-950 leading-relaxed font-mono">
                            {q.example}
                          </p>
                        </div>
                      )}

                      {q.useCase && (
                        <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200/60 space-y-1">
                          <div className="font-bold text-[11px] uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                            <span>Industry Use Case</span>
                          </div>
                          <p className="text-xs text-purple-950 leading-relaxed">
                            {q.useCase}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Assessment Configuration Modal */}
      <AssessmentConfigModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />
    </div>
  );
};
