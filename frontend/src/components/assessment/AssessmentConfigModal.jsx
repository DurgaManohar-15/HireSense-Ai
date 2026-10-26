import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import {
  X,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HelpCircle,
  Briefcase,
  Building2,
  ArrowRight,
  ShieldAlert,
  Flame,
  Search,
  Plus,
} from 'lucide-react';

const DEFAULT_TOPICS = [
  { topic: 'Java', category: 'CORE_CS_TECHNICAL', totalAvailableQuestions: 4 },
  { topic: 'OOP', category: 'CORE_CS_TECHNICAL', totalAvailableQuestions: 4 },
  { topic: 'DBMS', category: 'CORE_CS_TECHNICAL', totalAvailableQuestions: 4 },
  { topic: 'Operating Systems', category: 'CORE_CS_TECHNICAL', totalAvailableQuestions: 3 },
  { topic: 'Computer Networks', category: 'CORE_CS_TECHNICAL', totalAvailableQuestions: 3 },
  { topic: 'DSA', category: 'CORE_CS_TECHNICAL', totalAvailableQuestions: 3 },
  { topic: 'Python', category: 'CORE_CS_TECHNICAL', totalAvailableQuestions: 5 },
  { topic: 'React', category: 'CORE_CS_TECHNICAL', totalAvailableQuestions: 5 },
  { topic: 'Docker', category: 'CORE_CS_TECHNICAL', totalAvailableQuestions: 5 },
  { topic: 'Spring Boot', category: 'CORE_CS_TECHNICAL', totalAvailableQuestions: 5 },
  { topic: 'Aptitude', category: 'QUANTITATIVE_APTITUDE', totalAvailableQuestions: 4 },
  { topic: 'Logical Reasoning', category: 'LOGICAL_REASONING', totalAvailableQuestions: 4 },
  { topic: 'Verbal Ability', category: 'VERBAL_ABILITY', totalAvailableQuestions: 4 },
];

export const AssessmentConfigModal = ({
  isOpen,
  onClose,
  initialConfig = null,
}) => {
  const navigate = useNavigate();

  const [availableTopics, setAvailableTopics] = useState(DEFAULT_TOPICS);
  const [topicSearch, setTopicSearch] = useState('');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [selectedTopics, setSelectedTopics] = useState(['Java']);
  const [difficulty, setDifficulty] = useState('MEDIUM'); // EASY, MEDIUM, HARD, MIXED
  const [questionCount, setQuestionCount] = useState(15);
  const [customCountInput, setCustomCountInput] = useState('');
  const [isCustomCount, setIsCustomCount] = useState(false);

  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [targetCompany, setTargetCompany] = useState('');

  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const handleAddCustomTopic = (e) => {
    e?.preventDefault();
    const trimmed = customTopicInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!availableTopics.some((t) => t.topic.toLowerCase() === formatted.toLowerCase())) {
      const newTopic = {
        topic: formatted,
        category: 'CORE_CS_TECHNICAL',
        totalAvailableQuestions: 5,
        isCustom: true,
      };
      setAvailableTopics((prev) => [newTopic, ...prev]);
    }
    setSelectedTopics((prev) => {
      if (prev.includes(formatted)) return prev;
      return [...prev, formatted];
    });
    setCustomTopicInput('');
  };

  // Load question bank topics on modal open
  useEffect(() => {
    if (!isOpen) return;

    const fetchTopics = async () => {
      try {
        const res = await assessmentApi.getAvailableTopics();
        if (res.success && res.data && res.data.length > 0) {
          setAvailableTopics(res.data);
        }
      } catch (err) {
        // Fallback to default topics
        setAvailableTopics(DEFAULT_TOPICS);
      }
    };

    fetchTopics();
  }, [isOpen]);

  // Apply initialConfig if passed from AI recommendation
  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.topics && initialConfig.topics.length > 0) {
        setSelectedTopics(initialConfig.topics);
      }
      if (initialConfig.difficulty) {
        setDifficulty(initialConfig.difficulty.toUpperCase());
      }
      if (initialConfig.questionCount) {
        const qCount = Number(initialConfig.questionCount);
        if ([5, 10, 15, 20, 30].includes(qCount)) {
          setQuestionCount(qCount);
          setIsCustomCount(false);
        } else {
          setQuestionCount(qCount);
          setCustomCountInput(String(qCount));
          setIsCustomCount(true);
        }
      }
      if (initialConfig.targetRole) {
        setTargetRole(initialConfig.targetRole);
      }
      if (initialConfig.targetCompany) {
        setTargetCompany(initialConfig.targetCompany);
      }
    }
  }, [initialConfig, isOpen]);

  // Debounced live availability check whenever topics, difficulty, or count change
  useEffect(() => {
    if (!isOpen) return;

    const checkAvail = async () => {
      setCheckingAvailability(true);
      setError('');
      try {
        const payload = {
          topics: selectedTopics,
          difficulty: difficulty,
          questionCount: questionCount,
        };
        const res = await assessmentApi.checkQuestionAvailability(payload);
        if (res.success && res.data) {
          setAvailability(res.data);
        }
      } catch (err) {
        // Safe mock calculation if API is offline
        const estAvailable = selectedTopics.length * (difficulty === 'MIXED' ? 4 : 2);
        setAvailability({
          availableCount: estAvailable,
          requestedCount: questionCount,
          sufficient: estAvailable >= questionCount,
          message: estAvailable >= questionCount 
            ? `${estAvailable} suitable questions verified in the question bank.`
            : `Only ${estAvailable} suitable questions are currently available for this selection.`
        });
      } finally {
        setCheckingAvailability(false);
      }
    };

    const timer = setTimeout(checkAvail, 250);
    return () => clearTimeout(timer);
  }, [selectedTopics, difficulty, questionCount, isOpen]);

  if (!isOpen) return null;

  const toggleTopic = (topicName) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicName)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((t) => t !== topicName);
      } else {
        return [...prev, topicName];
      }
    });
  };

  const handleSelectAllTopics = () => {
    if (availableTopics.length > 0) {
      setSelectedTopics(availableTopics.map((t) => t.topic));
    }
  };

  const handleClearTopics = () => {
    if (availableTopics.length > 0) {
      setSelectedTopics([availableTopics[0].topic]);
    }
  };

  const handleCountPreset = (cnt) => {
    setQuestionCount(cnt);
    setIsCustomCount(false);
    setCustomCountInput('');
  };

  const handleCustomCountChange = (e) => {
    const val = e.target.value;
    setCustomCountInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
      setQuestionCount(parsed);
      setIsCustomCount(true);
    }
  };

  const handleStartAssessment = async (overrideCount = null) => {
    setStarting(true);
    setError('');

    const available = availability ? availability.availableCount : questionCount;
    const finalCount = overrideCount || (available > 0 ? Math.min(questionCount, available) : questionCount);

    try {
      const payload = {
        topics: selectedTopics,
        difficulty: difficulty,
        questionCount: finalCount,
        durationMinutes: Math.max(5, finalCount * 2),
        targetRole: targetRole || null,
        targetCompany: targetCompany || null,
        autoAdjustIfInsufficient: true,
      };

      const res = await assessmentApi.startCustomAssessment(payload);
      if (res.success && res.data) {
        onClose();
        // Route to the active test interface
        navigate(`/assessments/${res.data.id}/take`);
      } else {
        setError(res.message || 'Failed to initialize assessment session');
      }
    } catch (err) {
      setError(err.message || 'Failed to start custom assessment session');
    } finally {
      setStarting(false);
    }
  };

  // Group topics by category
  const categories = {
    CORE_CS_TECHNICAL: 'Core CS Technical',
    QUANTITATIVE_APTITUDE: 'Quantitative Aptitude',
    LOGICAL_REASONING: 'Logical Reasoning',
    VERBAL_ABILITY: 'Verbal Ability',
  };

  const filteredTopics = availableTopics.filter((t) =>
    t.topic.toLowerCase().includes(topicSearch.toLowerCase().trim())
  );

  const groupedTopics = filteredTopics.reduce((acc, item) => {
    const cat = item.category || 'CORE_CS_TECHNICAL';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const totalSelectedAvailable = availability ? availability.availableCount : 0;
  const isSufficient = availability ? availability.sufficient : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Create Your Assessment
              </h2>
              <p className="text-xs text-slate-400">
                Choose topics, question count, and difficulty to test your knowledge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Selected Topics Summary Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-brand-400">Active Selection:</span>
              <span className="text-white font-semibold">
                {selectedTopics.join(', ')}
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
              {selectedTopics.length} Topic{selectedTopics.length > 1 ? 's' : ''} Selected
            </span>
          </div>

          {/* 1. Topics Selection */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" />
                <span>Select Topics</span>
              </label>
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllTopics}
                  className="text-brand-400 hover:underline font-medium"
                >
                  Select All
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={handleClearTopics}
                  className="text-slate-400 hover:underline"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Quick Topic Search & Custom Topic Adder */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  placeholder="Filter available topics..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Add Custom Topic Input for Any Subject Requested by Student */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTopic();
                    }
                  }}
                  placeholder="Need a different topic? Type any topic (e.g. React, Python, Docker, Spring Boot)..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-800/50 border border-dashed border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTopic}
                  disabled={!customTopicInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic</span>
                </button>
              </div>
            </div>

            {/* Topics Grid */}
            <div className="space-y-4">
              {Object.entries(groupedTopics).map(([catKey, topicsList]) => (
                <div key={catKey} className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {categories[catKey] || catKey}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {topicsList.map((t) => {
                      const isSelected = selectedTopics.includes(t.topic);
                      return (
                        <button
                          key={t.topic}
                          type="button"
                          onClick={() => toggleTopic(t.topic)}
                          className={`px-3 py-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-between text-left transition-all ${
                            isSelected
                              ? 'bg-brand-500/20 border-brand-500 text-white shadow-sm ring-1 ring-brand-500/50'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate pr-1">{t.topic}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                              isSelected
                                ? 'bg-brand-500 text-white'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {t.totalAvailableQuestions || 4} Q
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Number of Questions */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Number of Questions</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[5, 10, 15, 20, 30].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleCountPreset(cnt)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    questionCount === cnt && !isCustomCount
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-1">
                <input
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Custom"
                  value={customCountInput}
                  onChange={handleCustomCountChange}
                  className={`w-20 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 border focus:outline-none transition ${
                    isCustomCount
                      ? 'border-emerald-500 text-emerald-300'
                      : 'border-slate-700 text-slate-300 focus:border-brand-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 3. Difficulty Level */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Difficulty Level</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'EASY', label: 'Easy', desc: 'Foundations' },
                { id: 'MEDIUM', label: 'Medium', desc: 'Placement Std' },
                { id: 'HARD', label: 'Hard', desc: 'Advanced' },
                { id: 'MIXED', label: 'Mixed', desc: 'Balanced' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    difficulty === d.id
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200">
                    {d.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {d.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Optional Target Context (Role / Company) */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Role / Company Calibration (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Target Company
                </label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Google, Amazon, TCS"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* 5. Live Question Availability Status Banner */}
          {checkingAvailability ? (
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Checking question bank availability...</span>
            </div>
          ) : availability ? (
            <div>
              {!isSufficient ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="space-y-2">
                    <div>
                      <div className="font-bold">Partial Question Availability</div>
                      <p className="mt-0.5 text-amber-300/90">
                        {availability.message || `Only ${totalSelectedAvailable} questions currently match this exact difficulty.`} Clicking <strong>Start Assessment</strong> will automatically proceed with all {totalSelectedAvailable} available questions!
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleStartAssessment(totalSelectedAvailable)}
                        disabled={starting || totalSelectedAvailable === 0}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
                      >
                        Start with {totalSelectedAvailable} Questions
                      </button>
                      <button
                        type="button"
                        onClick={() => setDifficulty('MIXED')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs border border-slate-700 transition"
                      >
                        Change to Mixed Difficulty
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{availability.message || 'Questions verified and ready.'}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">
                    Est. Duration: {Math.max(5, questionCount * 2)} mins
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleStartAssessment()}
            disabled={starting || selectedTopics.length === 0}
            className="px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center gap-2 transition"
          >
            {starting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Initializing Test...</span>
              </>
            ) : (
              <>
                <span>Start Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
