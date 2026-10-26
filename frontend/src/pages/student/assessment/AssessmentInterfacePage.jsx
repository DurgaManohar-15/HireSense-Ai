import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../../api/assessmentApi';
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  Send,
  CheckCircle2,
  HelpCircle,
  BrainCircuit,
} from 'lucide-react';

export const AssessmentInterfacePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [error, setError] = useState('');
  const [savingAnswer, setSavingAnswer] = useState(false);

  const timerRef = useRef(null);

  // Load Session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await assessmentApi.getActiveSession(sessionId);
        if (res.success && res.data) {
          if (res.data.status === 'COMPLETED') {
            navigate(`/assessments`);
            return;
          }
          setSession(res.data);
          setRemainingSeconds(res.data.remainingSeconds);
        }
      } catch (err) {
        setError(err.message || 'Failed to load assessment session');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, navigate]);

  // Submit Handler
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await assessmentApi.submitAssessment(sessionId);
      if (res.success && res.data) {
        navigate(`/assessments/results/${res.data.id}`);
      }
    } catch (err) {
      setError(err.message || 'Error submitting test.');
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  }, [sessionId, submitting, navigate]);

  // Countdown Timer
  useEffect(() => {
    if (loading || !session) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(); // Auto-submit when timer expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, session, handleSubmit]);

  const currentQuestion = session?.questions?.[currentIndex];

  // Save Answer
  const handleSelectOption = async (optionId) => {
    if (!currentQuestion) return;

    // Optimistic UI update
    const updatedQuestions = [...session.questions];
    updatedQuestions[currentIndex] = {
      ...currentQuestion,
      selectedOptionId: optionId,
    };
    setSession({ ...session, questions: updatedQuestions });

    // Server persist
    setSavingAnswer(true);
    try {
      await assessmentApi.saveAnswer(sessionId, {
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
        markedForReview: currentQuestion.markedForReview,
      });
    } catch (err) {
      console.error('Failed to auto-save answer:', err);
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleClearResponse = async () => {
    if (!currentQuestion || !currentQuestion.selectedOptionId) return;

    const updatedQuestions = [...session.questions];
    updatedQuestions[currentIndex] = {
      ...currentQuestion,
      selectedOptionId: null,
    };
    setSession({ ...session, questions: updatedQuestions });

    setSavingAnswer(true);
    try {
      await assessmentApi.saveAnswer(sessionId, {
        questionId: currentQuestion.id,
        selectedOptionId: null,
        markedForReview: currentQuestion.markedForReview,
      });
    } catch (err) {
      console.error('Failed to clear answer:', err);
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleToggleReview = async () => {
    if (!currentQuestion) return;

    const newMarked = !currentQuestion.markedForReview;
    const updatedQuestions = [...session.questions];
    updatedQuestions[currentIndex] = {
      ...currentQuestion,
      markedForReview: newMarked,
    };
    setSession({ ...session, questions: updatedQuestions });

    try {
      await assessmentApi.saveAnswer(sessionId, {
        questionId: currentQuestion.id,
        selectedOptionId: currentQuestion.selectedOptionId,
        markedForReview: newMarked,
      });
    } catch (err) {
      console.error('Failed to toggle review flag:', err);
    }
  };

  // Helper formatting for time
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Statistics for Palette
  const answeredCount = session?.questions?.filter((q) => q.selectedOptionId !== null).length || 0;
  const reviewCount = session?.questions?.filter((q) => q.markedForReview).length || 0;
  const unansweredCount = (session?.questions?.length || 0) - answeredCount;

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">Initializing secure assessment session...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-lg mx-auto">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="font-bold text-rose-900">Session Error</h3>
        <p className="text-sm text-rose-700 mt-1">{error}</p>
        <button
          onClick={() => navigate('/assessments')}
          className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl"
        >
          Return to Assessment Hub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Test Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 sticky top-[65px] z-30">
        <div>
          <h1 className="font-bold text-slate-900 text-base">{session.assessmentTitle}</h1>
          <p className="text-xs text-slate-500">
            Category: {session.category} • Question {currentIndex + 1} of {session.totalQuestions}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Countdown Timer */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm border shadow-sm ${
              remainingSeconds < 120
                ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-md transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish &amp; Submit</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Question Pane + Question Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Question Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            {/* Question Topic & Difficulty Tag */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg">
                  Topic: {currentQuestion?.topic}
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg">
                  Difficulty: {currentQuestion?.difficulty}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">{currentQuestion?.marks} Mark</span>
            </div>

            {/* Question Text */}
            <div className="text-slate-900 font-medium text-base leading-relaxed mb-8 whitespace-pre-wrap">
              <span className="font-bold text-slate-400 mr-2">Q{currentIndex + 1}.</span>
              {currentQuestion?.questionText}
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion?.options?.map((opt) => {
                const isSelected = currentQuestion.selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {opt.optionLabel}
                    </div>
                    <span className="text-sm text-slate-800 leading-snug flex-1">{opt.optionText}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    currentQuestion?.markedForReview
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5 text-amber-500" />
                  <span>{currentQuestion?.markedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>

                {currentQuestion?.selectedOptionId && (
                  <button
                    type="button"
                    onClick={handleClearResponse}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-500 hover:text-slate-700 border border-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Response</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={currentIndex === session.questions.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Question Palette & Overview (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Question Navigation Palette</h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></span>
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span>Review ({reviewCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full ring-2 ring-brand-500 bg-white"></span>
                <span>Current Question</span>
              </div>
            </div>

            {/* Matrix Buttons */}
            <div className="grid grid-cols-5 gap-2.5">
              {session.questions.map((q, idx) => {
                const isAnswered = q.selectedOptionId !== null;
                const isCurrent = currentIndex === idx;
                const isReview = q.markedForReview;

                let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                if (isAnswered && !isReview) {
                  btnStyle = 'bg-emerald-500 text-white font-bold border-emerald-600';
                } else if (isReview) {
                  btnStyle = 'bg-amber-400 text-slate-900 font-bold border-amber-500';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center ${btnStyle} ${
                      isCurrent ? 'ring-2 ring-offset-2 ring-brand-600 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Final Submit */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">Submit Assessment?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Once submitted, your responses will be locked and automatically evaluated.
            </p>

            <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="block text-base font-bold text-emerald-600">{answeredCount}</span>
                <span className="text-slate-500">Answered</span>
              </div>
              <div>
                <span className="block text-base font-bold text-rose-500">{unansweredCount}</span>
                <span className="text-slate-500">Unanswered</span>
              </div>
              <div>
                <span className="block text-base font-bold text-amber-500">{reviewCount}</span>
                <span className="text-slate-500">Flagged</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
              >
                Return to Test
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Confirm &amp; Evaluate</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
