import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { codingApi } from '../../../api/codingApi';
import {
  Code2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  Tag,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Briefcase,
  Layers,
  BookOpen,
  Award,
  Building2,
  Check,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

const PRESET_ROLES = [
  { id: 'ALL', label: 'All Roles', icon: Layers, desc: 'All placement questions' },
  { id: 'SDE', label: 'SDE / Software Engineer', icon: Code2, desc: 'Core DSA, Algorithms & System Problem Solving' },
  { id: 'FRONTEND', label: 'Frontend Developer', icon: Sparkles, desc: 'JavaScript, UI Architecture, DOM, Arrays & Strings' },
  { id: 'BACKEND', label: 'Backend Developer', icon: Briefcase, desc: 'Java, APIs, Concurrency, DBMS, Stack/Queue' },
  { id: 'FULLSTACK', label: 'Full Stack Developer', icon: Layers, desc: 'End-to-end Problem Solving, DB & Logic' },
  { id: 'DATA_ENGINEER', label: 'Data Engineer / Scientist', icon: TrendingUp, desc: 'Python, SQL, Hash Maps, Dynamic Algorithms' },
  { id: 'DEVOPS', label: 'DevOps & Cloud', icon: Building2, desc: 'Networks, OS, Linux & Infra Automation' },
  { id: 'QA_AUTOMATION', label: 'QA / Test Automation', icon: Award, desc: 'Edge Cases, String Parsing, DSA Basics' },
];

export const CodingPracticePage = () => {
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [practiceType, setPracticeType] = useState('ALL'); // 'ALL' | 'CODING' | 'MCQ'
  const [difficulty, setDifficulty] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [search, setSearch] = useState('');

  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Interactive MCQ state: { [questionId]: { selectedOptionId, isCorrect, showExplanation } }
  const [mcqState, setMcqState] = useState({});

  const topicsList = [
    'ALL',
    'ARRAYS',
    'STRINGS',
    'TWO_POINTERS',
    'STACK_QUEUE',
    'LINKED_LIST',
    'DYNAMIC_PROGRAMMING',
    'DBMS',
    'OPERATING_SYSTEMS',
    'NETWORKING',
    'JAVA_OOP',
  ];

  const activeRoleQuery = customRoleInput.trim() ? customRoleInput.trim() : (selectedRole !== 'ALL' ? selectedRole : '');

  useEffect(() => {
    loadQuestions();
  }, [selectedRole, customRoleInput, practiceType, difficulty, topic]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statRes = await codingApi.getCodingStats();
      setStats(statRes);
    } catch (err) {
      console.error('Failed to load coding stats:', err);
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await codingApi.getRoleQuestions({
        role: activeRoleQuery || undefined,
        type: practiceType !== 'ALL' ? practiceType : undefined,
        difficulty: difficulty !== 'ALL' ? difficulty : undefined,
      });
      setQuestions(res || []);
    } catch (err) {
      console.error('Failed to load role questions:', err);
      // Fallback to standard coding problem list if endpoint has transient error
      try {
        const fallback = await codingApi.getProblems({
          difficulty: difficulty !== 'ALL' ? difficulty : undefined,
          topic: topic !== 'ALL' ? topic : undefined,
          role: activeRoleQuery || undefined,
        });
        const mappedFallback = (fallback || []).map((p) => ({
          id: p.id,
          type: 'CODING',
          title: p.title,
          description: p.description,
          topic: p.topic,
          difficulty: p.difficulty,
          solved: p.solved,
          companyTags: p.companyTags || [],
          roleTags: p.roleTags || 'SDE, Backend',
          frequencyTag: p.frequencyTag || 'Frequently Asked in Campus Rounds',
          frequencyScore: p.frequencyScore || 85,
        }));
        setQuestions(mappedFallback);
      } catch (e) {
        console.error('Fallback also failed:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Client-side topic & text search filter
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Topic match
      if (topic !== 'ALL') {
        const qTopic = (q.topic || '').toUpperCase().replace(/[\s-]/g, '_');
        const filterTopic = topic.toUpperCase();
        if (!qTopic.includes(filterTopic)) return false;
      }
      // Search match
      if (search.trim()) {
        const s = search.toLowerCase();
        const matchesTitle = q.title?.toLowerCase().includes(s);
        const matchesTopic = q.topic?.toLowerCase().includes(s);
        const matchesCompanies = q.companyTags?.some((c) => c.toLowerCase().includes(s));
        const matchesRoles = q.roleTags?.toLowerCase().includes(s);
        const matchesFreq = q.frequencyTag?.toLowerCase().includes(s);
        if (!matchesTitle && !matchesTopic && !matchesCompanies && !matchesRoles && !matchesFreq) {
          return false;
        }
      }
      return true;
    });
  }, [questions, topic, search]);

  const codingCount = useMemo(() => filteredQuestions.filter((q) => q.type === 'CODING').length, [filteredQuestions]);
  const mcqCount = useMemo(() => filteredQuestions.filter((q) => q.type === 'MCQ').length, [filteredQuestions]);

  const handleSelectOption = (questionId, option) => {
    const isCorrect = Boolean(option.correct);
    setMcqState((prev) => ({
      ...prev,
      [questionId]: {
        selectedOptionId: option.id,
        isCorrect,
        showExplanation: true,
      },
    }));
  };

  const toggleExplanation = (questionId) => {
    setMcqState((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        showExplanation: !prev[questionId]?.showExplanation,
      },
    }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#202934] bg-gradient-to-b from-[#151D26] via-[#10161C] to-[#0A0E13] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151D26] border border-[#202934] text-[11px] font-semibold tracking-wider uppercase text-[#E8C982]">
            <Code2 className="w-3.5 h-3.5 text-[#E8C982]" />
            <span>Role-Calibrated Placement Question Bank</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Coding &amp; Technical Sandbox
          </h1>
          <p className="text-sm text-[#8E9CAE] font-normal leading-relaxed">
            High-frequency coding algorithms and technical concepts recurring in campus recruitment drives (Amazon, Google, TCS, Infosys, Microsoft, Cognizant, Accenture, Deloitte).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => {
              loadQuestions();
              loadStats();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#11171D] hover:bg-[#1C2530] border border-[#202934] hover:border-[#E8C982]/40 text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95"
            title="Refresh Question Bank"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#E8C982]' : 'text-[#E8C982]'}`} />
            <span>Refresh Bank</span>
          </button>
        </div>
      </div>

      {/* User Coding Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#10161C] border border-[#202934] shadow-sm hover:border-[#E8C982]/30 transition-all">
            <span className="text-[11px] font-bold text-[#8E9CAE] uppercase tracking-wider block mb-1">Total Solved</span>
            <div className="text-3xl font-extrabold text-white">
              {stats.solvedProblems} <span className="text-xs text-[#6E7C8E] font-normal">/ {stats.totalProblems}</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#10161C] border border-[#202934] shadow-sm hover:border-emerald-500/30 transition-all">
            <span className="text-[11px] font-bold text-[#8E9CAE] uppercase tracking-wider block mb-1">Easy Solved</span>
            <div className="text-3xl font-extrabold text-emerald-400">{stats.easySolved}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#10161C] border border-[#202934] shadow-sm hover:border-amber-500/30 transition-all">
            <span className="text-[11px] font-bold text-[#8E9CAE] uppercase tracking-wider block mb-1">Medium Solved</span>
            <div className="text-3xl font-extrabold text-amber-400">{stats.mediumSolved}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#10161C] border border-[#202934] shadow-sm hover:border-rose-500/30 transition-all">
            <span className="text-[11px] font-bold text-[#8E9CAE] uppercase tracking-wider block mb-1">Hard Solved</span>
            <div className="text-3xl font-extrabold text-rose-400">{stats.hardSolved}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#10161C] border border-[#202934] shadow-sm hover:border-[#E8C982]/30 transition-all">
            <span className="text-[11px] font-bold text-[#8E9CAE] uppercase tracking-wider block mb-1">Accuracy</span>
            <div className="text-3xl font-extrabold text-[#E8C982]">{stats.overallAccuracy}%</div>
          </div>
        </div>
      )}

      {/* ROLE SELECTION HUB */}
      <div className="p-6 rounded-2xl md:rounded-3xl bg-[#10161C] border border-[#202934] shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#E8C982]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Select Your Target Placement Role
            </h2>
          </div>
          
          {/* Custom Role Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#6E7C8E] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={customRoleInput}
              onChange={(e) => {
                setCustomRoleInput(e.target.value);
                if (e.target.value.trim()) setSelectedRole('CUSTOM');
                else setSelectedRole('ALL');
              }}
              placeholder="Search or type role (e.g. SDE, Frontend, Data)..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#11171D] border border-[#202934] focus:border-[#E8C982]/60 text-xs text-white placeholder-[#5A6878] outline-none transition-all"
            />
          </div>
        </div>

        {/* Quick Preset Role Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {PRESET_ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id && !customRoleInput.trim();
            return (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRole(r.id);
                  setCustomRoleInput('');
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
                  isSelected
                    ? 'bg-[#E8C982] text-[#0B0E14] border-[#E8C982] shadow-md shadow-[#E8C982]/15'
                    : 'bg-[#11171D] border-[#202934] text-[#8E9CAE] hover:text-white hover:border-[#E8C982]/40 hover:bg-[#151D26]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#0B0E14]' : 'text-[#6E7C8E]'}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0B0E14]" />}
                </div>
                <span className="text-[11px] font-bold line-clamp-1">{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Role Helper Info */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#8E9CAE] pt-2 border-t border-[#202934]">
          <span>
            Targeting: <strong className="text-white font-semibold">{activeRoleQuery || 'All Technical Roles'}</strong>
          </span>
          <div className="flex items-center gap-3">
            <span>
              Found <strong className="text-[#E8C982] font-bold">{filteredQuestions.length}</strong> questions (
              <strong className="text-white">{codingCount}</strong> Coding,{' '}
              <strong className="text-[#CBD5E1]">{mcqCount}</strong> MCQs)
            </span>
          </div>
        </div>
      </div>

      {/* PRACTICE TYPE & FILTER TOOLBAR */}
      <div className="p-5 rounded-2xl md:rounded-3xl bg-[#10161C] border border-[#202934] space-y-4 shadow-xl hover:border-[#E8C982]/30 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Practice Type Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#11171D] border border-[#202934]">
            <button
              onClick={() => setPracticeType('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                practiceType === 'ALL'
                  ? 'bg-[#E8C982] text-[#0B0E14] font-bold shadow-md shadow-[#E8C982]/15'
                  : 'text-[#8E9CAE] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> All ({filteredQuestions.length})
            </button>
            <button
              onClick={() => setPracticeType('CODING')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                practiceType === 'CODING'
                  ? 'bg-[#E8C982] text-[#0B0E14] font-bold shadow-md shadow-[#E8C982]/15'
                  : 'text-[#8E9CAE] hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Coding ({codingCount})
            </button>
            <button
              onClick={() => setPracticeType('MCQ')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                practiceType === 'MCQ'
                  ? 'bg-[#E8C982] text-[#0B0E14] font-bold shadow-md shadow-[#E8C982]/15'
                  : 'text-[#8E9CAE] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> MCQs ({mcqCount})
            </button>
          </div>

          {/* Keyword Search */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="w-4 h-4 text-[#6E7C8E] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search question title, topics, or companies..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#11171D] border border-[#202934] text-xs text-white placeholder-[#5A6878] outline-none focus:border-[#E8C982]/60 transition-all"
            />
          </div>

          {/* Difficulty Tabs */}
          <div className="flex items-center gap-1.5 text-xs self-start lg:self-auto">
            <span className="text-[#8E9CAE] mr-1 font-semibold text-[11px]">Difficulty:</span>
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer active:scale-95 ${
                  difficulty === d
                    ? 'bg-[#E8C982] text-[#0B0E14] font-bold shadow-md shadow-[#E8C982]/15'
                    : 'bg-[#11171D] text-[#8E9CAE] hover:text-white border border-[#202934] hover:border-[#E8C982]/40'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[#8E9CAE] font-semibold text-[11px] whitespace-nowrap">Topic:</span>
          {topicsList.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap text-[11px] transition-all cursor-pointer active:scale-95 ${
                topic === t
                  ? 'bg-[#151D26] text-[#E8C982] font-bold border border-[#E8C982]/40 shadow-xs'
                  : 'bg-[#11171D] text-[#8E9CAE] hover:text-white border border-[#202934] hover:border-[#E8C982]/30'
              }`}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* QUESTIONS LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#8E9CAE] text-xs gap-3">
          <div className="w-8 h-8 border-2 border-[#202934] border-t-[#E8C982] rounded-full animate-spin"></div>
          <span>Calibrating placement questions for selected role...</span>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl md:rounded-3xl bg-[#10161C] border border-[#202934] space-y-3">
          <HelpCircle className="w-10 h-10 text-[#6E7C8E] mx-auto" />
          <h3 className="text-base font-bold text-white">No questions matched the filters</h3>
          <p className="text-xs text-[#8E9CAE] max-w-md mx-auto">
            Try changing the target role, resetting topics, or selecting &quot;All Questions&quot; to see all available items.
          </p>
          <button
            onClick={() => {
              setSelectedRole('ALL');
              setCustomRoleInput('');
              setPracticeType('ALL');
              setDifficulty('ALL');
              setTopic('ALL');
              setSearch('');
            }}
            className="px-5 py-2 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#0B0E14] text-xs font-bold shadow-md shadow-[#E8C982]/15 transition-all cursor-pointer active:scale-95"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const isCoding = q.type === 'CODING';
            const state = mcqState[q.id] || {};

            return (
              <div
                key={`${q.type}-${q.id}-${idx}`}
                className="rounded-2xl md:rounded-3xl bg-[#10161C] border border-[#202934] hover:border-[#E8C982]/35 transition-all p-6 shadow-xl space-y-4 hover:-translate-y-0.5"
              >
                {/* Top Bar: Question Type + High-Frequency Recurrence Badge + Difficulty */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {isCoding ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#151D26] text-[#E8C982] border border-[#202934]">
                        <Code2 className="w-3.5 h-3.5 text-[#E8C982]" /> Coding Algorithm
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#151D26] text-[#CBD5E1] border border-[#202934]">
                        <BookOpen className="w-3.5 h-3.5 text-[#CBD5E1]" /> Technical MCQ
                      </span>
                    )}

                    {/* Placement Frequency Tag */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#1B1914] text-[#E8C982] border border-[#E8C982]/25">
                      <Flame className="w-3.5 h-3.5 text-[#E8C982]" />
                      {q.frequencyTag || 'Frequently Repeated in Campus Rounds'}
                    </span>

                    {/* Difficulty Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        q.difficulty === 'EASY'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : q.difficulty === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Target Roles */}
                  {q.roleTags && (
                    <div className="flex items-center gap-1.5 text-xs text-[#8E9CAE]">
                      <Tag className="w-3 h-3 text-[#6E7C8E]" />
                      <span>Role:</span>
                      <span className="text-[#CBD5E1] font-medium">{q.roleTags}</span>
                    </div>
                  )}
                </div>

                {/* Title and Description */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {isCoding ? (
                          <Link to={`/coding/${q.id}`} className="hover:text-[#E8C982] transition-colors">
                            {q.title}
                          </Link>
                        ) : (
                          <span>{q.title}</span>
                        )}
                        {isCoding && q.solved && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Solved
                          </span>
                        )}
                      </h3>
                      {q.topic && (
                        <div className="text-xs text-[#8E9CAE]">
                          Topic:{' '}
                          <span className="text-[#E8C982] font-medium capitalize">
                            {q.topic.toLowerCase().replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Coding Action Button */}
                    {isCoding && (
                      <Link
                        to={`/coding/${q.id}`}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E8C982] hover:bg-[#F5DFA8] text-[#0B0E14] shadow-md shadow-[#E8C982]/15 inline-flex items-center gap-1.5 transition-all whitespace-nowrap self-start active:scale-95 cursor-pointer"
                      >
                        <span>{q.solved ? 'Review in IDE' : 'Solve in IDE'}</span>
                        <ChevronRight className="w-4 h-4 text-[#0B0E14]" />
                      </Link>
                    )}
                  </div>

                  {/* Short Description */}
                  {q.description && (
                    <p className="text-xs text-[#CBD5E1] mt-2 line-clamp-3 leading-relaxed whitespace-pre-line bg-[#11171D] p-3.5 rounded-xl border border-[#202934] font-mono">
                      {q.description}
                    </p>
                  )}
                </div>

                {/* INTERACTIVE MCQ OPTIONS (If question type is MCQ) */}
                {!isCoding && q.options && q.options.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-[#202934]">
                    <div className="text-[11px] font-semibold text-[#8E9CAE] flex items-center justify-between">
                      <span>Select the correct option to verify your answer:</span>
                      {state.selectedOptionId && (
                        <span
                          className={`text-xs font-bold flex items-center gap-1 ${
                            state.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {state.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer!
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Incorrect
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = state.selectedOptionId === opt.id;
                        const hasAnswered = Boolean(state.selectedOptionId);
                        const isCorrectOption = Boolean(opt.correct);

                        let buttonStyle = 'bg-[#11171D] border-[#202934] text-[#CBD5E1] hover:border-[#E8C982]/40 hover:bg-[#151D26]';

                        if (hasAnswered) {
                          if (isCorrectOption) {
                            buttonStyle = 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300 font-semibold';
                          } else if (isSelected && !isCorrectOption) {
                            buttonStyle = 'bg-rose-500/10 border-rose-500/60 text-rose-300 font-semibold';
                          } else {
                            buttonStyle = 'bg-[#11171D]/50 border-[#202934]/50 text-[#5A6878] opacity-60';
                          }
                        }

                        return (
                          <button
                            key={opt.id || optIdx}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer active:scale-95 ${buttonStyle}`}
                          >
                            <span className="w-5 h-5 rounded-md bg-[#151D26] border border-[#202934] flex items-center justify-center text-[10px] font-bold text-[#E8C982] shrink-0 mt-0.5">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 leading-snug">{opt.text}</span>
                            {hasAnswered && isCorrectOption && (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Toggle */}
                    {q.explanation && (
                      <div className="pt-2">
                        <button
                          onClick={() => toggleExplanation(q.id)}
                          className="text-xs text-[#8E9CAE] hover:text-[#E8C982] flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-[#E8C982]" />
                          <span>{state.showExplanation ? 'Hide Rationale' : 'View Placement Rationale & Concept'}</span>
                          {state.showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {state.showExplanation && (
                          <div className="mt-2 p-4 rounded-xl bg-[#11171D] border border-[#202934] text-xs text-[#CBD5E1] space-y-1.5">
                            <div className="text-[11px] font-bold text-[#E8C982] uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> Concept Explanation:
                            </div>
                            <p className="leading-relaxed text-[#CBD5E1] whitespace-pre-line">
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Companies Bar */}
                {q.companyTags && q.companyTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#202934]">
                    <span className="text-[10px] font-semibold text-[#6E7C8E] uppercase tracking-wider mr-1">
                      Targeted Companies:
                    </span>
                    {q.companyTags.map((company, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-[#11171D] text-[#CBD5E1] border border-[#202934] flex items-center gap-1"
                      >
                        <Building2 className="w-2.5 h-2.5 text-[#6E7C8E]" />
                        {company}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default CodingPracticePage;
