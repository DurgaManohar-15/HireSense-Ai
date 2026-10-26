import React, { useState, useEffect } from 'react';
import { assessmentApi } from '../../../api/assessmentApi';
import { useNavigate, Link } from 'react-router-dom';
import { AssessmentConfigModal } from '../../../components/assessment/AssessmentConfigModal';
import {
  BrainCircuit,
  Clock,
  HelpCircle,
  Award,
  ArrowRight,
  Sparkles,
  BarChart3,
  History,
  CheckCircle2,
  AlertCircle,
  Layers,
  SlidersHorizontal,
  Bot,
} from 'lucide-react';

const DEFAULT_ASSESSMENTS = [
  {
    id: 1,
    title: 'Core CS Technical Diagnostic',
    description: 'Evaluate fundamental knowledge in Object-Oriented Programming, Data Structures, DBMS, and Operating Systems.',
    category: 'CORE_CS_TECHNICAL',
    difficulty: 'MEDIUM',
    durationMinutes: 20,
    totalQuestions: 15,
    passingPercentage: 60,
  },
  {
    id: 2,
    title: 'Quantitative Aptitude Assessment',
    description: 'Test quantitative problem-solving, arithmetic, percentages, probability, and numerical proficiency.',
    category: 'QUANTITATIVE_APTITUDE',
    difficulty: 'MEDIUM',
    durationMinutes: 20,
    totalQuestions: 15,
    passingPercentage: 60,
  },
  {
    id: 3,
    title: 'Logical Reasoning & Analytical Ability',
    description: 'Assess deductive logic, syllogisms, pattern detection, and analytical reasoning skills required by top employers.',
    category: 'LOGICAL_REASONING',
    difficulty: 'MEDIUM',
    durationMinutes: 20,
    totalQuestions: 15,
    passingPercentage: 60,
  },
  {
    id: 4,
    title: 'Verbal Ability & Professional Communication',
    description: 'Verify sentence structure, vocabulary, reading comprehension, and business English communication standards.',
    category: 'VERBAL_ABILITY',
    difficulty: 'EASY',
    durationMinutes: 15,
    totalQuestions: 15,
    passingPercentage: 60,
  },
  {
    id: 5,
    title: 'Comprehensive Campus Placement Mock',
    description: 'A full-length balanced placement mock test covering Technical MCQs, Aptitude, Reasoning, and Verbal sections.',
    category: 'COMPREHENSIVE_MOCK',
    difficulty: 'MIXED',
    durationMinutes: 30,
    totalQuestions: 20,
    passingPercentage: 70,
  },
];

export const AssessmentListPage = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState(DEFAULT_ASSESSMENTS);
  const [history, setHistory] = useState([]);
  const [topicStats, setTopicStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  // Custom Assessment Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [assessRes, histRes, topicRes] = await Promise.allSettled([
          assessmentApi.getAvailableAssessments(),
          assessmentApi.getMyAssessmentHistory(),
          assessmentApi.getMyTopicPerformance(),
        ]);

        if (!isMounted) return;

        if (assessRes.status === 'fulfilled' && assessRes.value?.success && Array.isArray(assessRes.value.data) && assessRes.value.data.length > 0) {
          setAssessments(assessRes.value.data);
        } else {
          setAssessments(DEFAULT_ASSESSMENTS);
        }

        if (histRes.status === 'fulfilled' && histRes.value?.success && Array.isArray(histRes.value.data)) {
          setHistory(histRes.value.data);
        } else if (histRes.status === 'fulfilled' && Array.isArray(histRes.value)) {
          setHistory(histRes.value);
        } else {
          setHistory([]);
        }

        if (topicRes.status === 'fulfilled' && topicRes.value?.success && Array.isArray(topicRes.value.data)) {
          setTopicStats(topicRes.value.data);
        } else if (topicRes.status === 'fulfilled' && Array.isArray(topicRes.value)) {
          setTopicStats(topicRes.value);
        } else {
          setTopicStats([]);
        }
      } catch (err) {
        console.error('Failed to load assessment hub data:', err);
        if (isMounted) setAssessments(DEFAULT_ASSESSMENTS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartTest = async (assessment) => {
    setStarting(true);
    setError('');
    try {
      const res = await assessmentApi.startAssessment(assessment.id);
      if (res.success && res.data) {
        navigate(`/assessments/${res.data.id}/take`);
        return;
      }
    } catch (err) {
      // Fallback: start via custom assessment with this category
      try {
        const customRes = await assessmentApi.startCustomAssessment({
          category: assessment.category || 'CORE_CS_TECHNICAL',
          difficulty: assessment.difficulty || 'MEDIUM',
          questionCount: assessment.totalQuestions || 15,
          durationMinutes: assessment.durationMinutes || 20,
          autoAdjustIfInsufficient: true,
        });
        if (customRes.success && customRes.data) {
          navigate(`/assessments/${customRes.data.id}/take`);
          return;
        }
      } catch (customErr) {
        setError(customErr.message || err.message || 'Failed to start assessment session.');
      }
      setError(err.message || 'Failed to start assessment session.');
    } finally {
      setStarting(false);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'CORE_CS_TECHNICAL':
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-purple-50 text-purple-700 rounded-md border border-purple-200">Core CS / Tech</span>;
      case 'QUANTITATIVE_APTITUDE':
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200">Quantitative Aptitude</span>;
      case 'LOGICAL_REASONING':
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-md border border-amber-200">Logical Reasoning</span>;
      case 'VERBAL_ABILITY':
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">Verbal Ability</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">Comprehensive Mock</span>;
    }
  };

  const formatDateSafe = (dateVal) => {
    if (!dateVal) return 'Recently Completed';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'Recently Completed';
      return d.toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return 'Recently Completed';
    }
  };

  const formatScoreSafe = (scoreVal) => {
    const num = parseFloat(scoreVal);
    return isNaN(num) ? '0' : num.toFixed(0);
  };

  const safeHistory = Array.isArray(history) ? history : [];
  const safeTopicStats = Array.isArray(topicStats) ? topicStats : [];
  const safeAssessments = Array.isArray(assessments) && assessments.length > 0 ? assessments : DEFAULT_ASSESSMENTS;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-9 h-9 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Loading placement assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-brand-600" />
            <span>Diagnostic MCQs &amp; Custom Assessments</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Standardized baseline benchmarks and AI-customized adaptive technical assessments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-lg shadow-brand-500/20 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Custom Assessment</span>
          </button>

          <Link
            to="/career-assistant"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700 transition-colors"
          >
            <Bot className="w-4 h-4 text-brand-400" />
            <span>AI Advisor</span>
          </Link>

          <Link
            to="/assessments/history"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700 transition-colors"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>Attempt History ({safeHistory.length})</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* AI-Assisted Custom Assessment Spotlight Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 rounded-3xl p-6 border border-brand-800/40 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <Sparkles className="w-3 h-3" />
            <span>AI-Assisted Custom Assessment</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            Need a focused test on specific topics or weak areas?
          </h3>
          <p className="text-xs text-slate-300">
            Select any combination of topics (Java, DBMS, OS, Networks, Aptitude, Python, React, etc.), set your desired question count (5-30) and difficulty, or ask the AI Career Assistant to calibrate one for you.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Create Custom Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Available Assessment Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" />
            <span>Available Diagnostic Assessments</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">{safeAssessments.length} Test Templates Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {safeAssessments.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  {getCategoryBadge(test.category)}
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {test.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{test.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{test.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600 mb-4 bg-slate-50 py-2 rounded-xl border border-slate-100">
                  <div>
                    <span className="block font-bold text-slate-800">{test.totalQuestions}</span>
                    <span className="text-[10px] text-slate-400">Questions</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">{test.durationMinutes}m</span>
                    <span className="text-[10px] text-slate-400">Time Limit</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">{test.passingPercentage}%</span>
                    <span className="text-[10px] text-slate-400">Pass Mark</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAssessment(test)}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span>Start Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Mastery Summary (if student has taken tests) */}
      {safeTopicStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Cumulative Topic Performance &amp; Mastery</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeTopicStats.map((t, idx) => {
              const pct = parseFloat(t?.scorePercentage || 0);
              const safePct = isNaN(pct) ? 0 : Math.min(100, Math.max(0, pct));
              return (
                <div key={t?.topic || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-800">{t?.topic || 'Topic'}</span>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                      {safePct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${safePct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                    <span>Correct: {t?.correctCount || 0}</span>
                    <span>Attempted: {t?.totalQuestions || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assessment Instructions Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">{selectedAssessment.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedAssessment.description}</p>

            <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-700">
              <p className="font-bold text-slate-900 text-sm mb-2">Test Instructions &amp; Rules:</p>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Total Duration: <strong>{selectedAssessment.durationMinutes} minutes</strong>. The server enforces the cutoff timer.</span>
              </div>
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Questions: <strong>{selectedAssessment.totalQuestions} Multiple Choice Questions (1 mark each)</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Passing Benchmark: <strong>{selectedAssessment.passingPercentage}%</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Responses can be updated or marked for review prior to final submission.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedAssessment(null)}
                disabled={starting}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartTest(selectedAssessment)}
                disabled={starting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
              >
                {starting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Start Test Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Assessment Configuration Modal */}
      <AssessmentConfigModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />
    </div>
  );
};

export default AssessmentListPage;
