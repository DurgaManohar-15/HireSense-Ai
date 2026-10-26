import React, { useState, useEffect } from 'react';
import { interviewApi } from '../../../api/interviewApi';
import { profileApi } from '../../../api/profileApi';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bot,
  UserCheck,
  Code,
  FolderGit2,
  Users,
  ArrowRight,
  Clock,
  Layers,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  BookOpen,
  Target,
} from 'lucide-react';

export const InterviewHubPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [selectedType, setSelectedType] = useState('TECHNICAL');
  const [topic, setTopic] = useState('Java OOP & Collections');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [targetCompany, setTargetCompany] = useState('General Tech Industry');
  const [totalQuestions, setTotalQuestions] = useState(5);

  const popularTopics = [
    { name: 'Java OOP & Collections', type: 'TECHNICAL' },
    { name: 'Spring Boot & Microservices', type: 'TECHNICAL' },
    { name: 'Data Structures: Trees & Graphs', type: 'TECHNICAL' },
    { name: 'SQL Indexing & Database Design', type: 'TECHNICAL' },
    { name: 'React Hooks & State Architecture', type: 'TECHNICAL' },
    { name: 'Operating Systems & Concurrency', type: 'TECHNICAL' },
    { name: 'System Design & Scalability', type: 'TECHNICAL' },
    { name: 'HR Behavioral & Leadership', type: 'HR_BEHAVIORAL' },
    { name: 'Full-Stack Project Architecture', type: 'PROJECT_DEEP_DIVE' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, histRes] = await Promise.allSettled([
          profileApi.getMyProfile(),
          interviewApi.getMyInterviewHistory(),
        ]);

        if (profRes.status === 'fulfilled' && profRes.value.success && profRes.value.data) {
          const p = profRes.value.data;
          setProfile(p);
          if (p.targetRole) setTargetRole(p.targetRole);
          if (p.targetCompany?.name) setTargetCompany(p.targetCompany.name);
        }

        if (histRes.status === 'fulfilled' && histRes.value.success) {
          setHistory(histRes.value.data || []);
        }
      } catch (err) {
        console.error('Failed to load interview hub data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!topic || !topic.trim()) {
      setError('Please enter or select an interview topic to proceed.');
      return;
    }

    setStarting(true);
    setError('');

    try {
      const res = await interviewApi.startInterview({
        interviewType: selectedType,
        topic: topic.trim(),
        difficulty,
        targetRole,
        targetCompany,
        totalQuestions: parseInt(totalQuestions, 10),
      });

      if (res.success && res.data) {
        navigate(`/interview/${res.data.id}/room`);
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize AI Mock Interview session.');
      setStarting(false);
    }
  };

  const interviewTypes = [
    {
      id: 'TECHNICAL',
      title: 'Technical Interview',
      description: 'Progressive technical questions covering your exact chosen topic, programming language, and core CS concepts.',
      icon: Code,
      badge: 'Subject Aligned',
    },
    {
      id: 'HR_BEHAVIORAL',
      title: 'HR & Behavioral',
      description: 'Evaluates communication, conflict resolution, situational reasoning, leadership, and company culture.',
      icon: UserCheck,
      badge: 'Cultural Fit',
    },
    {
      id: 'PROJECT_DEEP_DIVE',
      title: 'Project Deep-Dive',
      description: 'Probes your academic and personal projects, architectural decisions, database choices, and trade-offs.',
      icon: FolderGit2,
      badge: 'System Architecture',
    },
  ];

  const difficultyLevels = [
    {
      id: 'EASY',
      label: 'Easy / Foundational',
      desc: 'Focuses on syntax, core definitions, basic OOP/system fundamentals, and primary use cases.',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'MEDIUM',
      label: 'Medium / Campus Standard',
      desc: 'Standard campus placement technical interview level. Covers implementation trade-offs, standard algorithms, and patterns.',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      id: 'HARD',
      label: 'In-Depth / Advanced',
      desc: 'Probes deep internal mechanisms, high concurrency, race conditions, edge case failures, and scalability.',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      id: 'ADAPTIVE',
      label: 'Adaptive Dynamic',
      desc: 'Starts balanced and live-calibrates question complexity after every turn based on your answer score.',
      badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[460px] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-500">Preparing Mock Interview Simulator...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#202934] bg-gradient-to-b from-[#151D26] via-[#10161C] to-[#0A0E13] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151D26] border border-[#202934] text-[11px] font-semibold tracking-wider uppercase text-[#E8C982]">
            <Users className="w-3.5 h-3.5 text-[#E8C982]" />
            <span>AI Mock Interview Simulator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Topic-Based Mock Interviews
          </h1>
          <p className="text-sm text-[#8E9CAE] font-normal max-w-xl leading-relaxed">
            Select a technical or behavioral domain and difficulty level to test your knowledge with structured questions and evaluation rubrics.
          </p>
        </div>

        <Link
          to="/interview/history"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#11171D] hover:bg-[#1C2530] text-[#CBD5E1] hover:text-[#E8C982] border border-[#202934] hover:border-[#E8C982]/40 text-xs font-semibold transition-all self-start md:self-auto shadow-sm cursor-pointer active:scale-95"
        >
          <Clock className="w-4 h-4 text-[#E8C982]" />
          <span>Past Sessions ({history.length})</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center gap-3 text-rose-300 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Setup Form */}
      <form onSubmit={handleStartInterview} className="space-y-8">
        {/* Step 1: Select Track */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#E8C982] text-[#0B0E14] text-[10px] font-bold flex items-center justify-center">1</span>
            <span>Select Interview Track</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {interviewTypes.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedType === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedType(t.id);
                    if (t.id === 'HR_BEHAVIORAL') setTopic('HR Behavioral & Leadership');
                    else if (t.id === 'PROJECT_DEEP_DIVE') setTopic('Full-Stack Project Architecture');
                    else setTopic('Java OOP & Collections');
                  }}
                  className={`p-6 rounded-2xl md:rounded-3xl border transition-all flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${
                    isSelected
                      ? 'border-[#E8C982] bg-[#151D26] shadow-xl shadow-[#E8C982]/10 ring-1 ring-[#E8C982]/30'
                      : 'border-[#202934] bg-[#10161C] hover:border-[#E8C982]/35'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm ${
                        isSelected ? 'bg-[#1B1914] border-[#E8C982]/40 text-[#E8C982]' : 'bg-[#151D26] border-[#202934] text-[#8E9CAE]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-[#11171D] text-[#CBD5E1] rounded border border-[#202934] font-mono">
                        {t.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base">{t.title}</h3>
                    <p className="text-xs text-[#8E9CAE] mt-1 leading-relaxed">{t.description}</p>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#E8C982] bg-[#E8C982]' : 'border-[#2E3B4B]'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#0B0E14]"></div>}
                    </div>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-[#E8C982]' : 'text-[#8E9CAE]'}`}>
                      {isSelected ? 'Active Track' : 'Select Track'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Choose Custom Topic */}
        <div className="bg-[#10161C] rounded-2xl md:rounded-3xl border border-[#202934] p-6 sm:p-8 shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#E8C982] text-[#0B0E14] text-[10px] font-bold flex items-center justify-center">2</span>
              <span>Interview Topic &amp; Subject Focus</span>
            </h2>
            <span className="text-xs text-[#6E7C8E]">Type any subject or click a suggestion below</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A9B0BA] uppercase tracking-wider mb-2">
              Target Interview Topic / Specific Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Java Collections, Spring Boot, React Hooks, Binary Trees, SQL Indexing, Microservices..."
              required
              className="w-full px-4 py-3 bg-[#11171D] border border-[#202934] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#E8C982]/60 shadow-inner transition-colors"
            />
          </div>

          <div>
            <span className="text-xs font-semibold text-[#8E9CAE] block mb-2">Popular Suggestions:</span>
            <div className="flex flex-wrap gap-2">
              {popularTopics.map((pt) => (
                <button
                  key={pt.name}
                  type="button"
                  onClick={() => {
                    setTopic(pt.name);
                    setSelectedType(pt.type);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
                    topic === pt.name
                      ? 'bg-[#E8C982] text-[#0B0E14] border-[#E8C982] shadow-md shadow-[#E8C982]/15'
                      : 'bg-[#11171D] hover:bg-[#1C2530] text-[#CBD5E1] hover:text-[#E8C982] border-[#202934]'
                  }`}
                >
                  {pt.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Difficulty Depth Level */}
        <div className="bg-[#10161C] rounded-2xl md:rounded-3xl border border-[#202934] p-6 sm:p-8 shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#E8C982] text-[#0B0E14] text-[10px] font-bold flex items-center justify-center">3</span>
            <span>Select Question Difficulty Depth</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {difficultyLevels.map((lvl) => {
              const isSelected = difficulty === lvl.id;
              return (
                <div
                  key={lvl.id}
                  onClick={() => setDifficulty(lvl.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${
                    isSelected
                      ? 'border-[#E8C982] bg-[#151D26] shadow-md ring-1 ring-[#E8C982]/30'
                      : 'border-[#202934] bg-[#11171D] hover:border-[#E8C982]/35'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{lvl.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${lvl.badgeColor}`}>
                      {lvl.id}
                    </span>
                  </div>
                  <p className="text-xs text-[#8E9CAE] leading-relaxed">{lvl.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Role & Target Settings */}
        <div className="bg-[#10161C] rounded-2xl md:rounded-3xl border border-[#202934] p-6 sm:p-8 shadow-xl space-y-6 hover:border-[#E8C982]/30 transition-all">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#E8C982] text-[#0B0E14] text-[10px] font-bold flex items-center justify-center">4</span>
            <span>Role &amp; Session Configuration</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-2">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Java Backend Developer"
                required
                className="w-full px-3.5 py-2.5 bg-[#11171D] border border-[#202934] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-2">
                Target Company / Benchmark
              </label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Google, Amazon, TCS Digital"
                required
                className="w-full px-3.5 py-2.5 bg-[#11171D] border border-[#202934] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-2">
                Total Questions (Turns)
              </label>
              <select
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#11171D] border border-[#202934] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
              >
                <option value="3">3 Questions (Quick Drill ~ 5 mins)</option>
                <option value="5">5 Questions (Standard Mock ~ 15 mins)</option>
                <option value="8">8 Questions (Comprehensive Round ~ 25 mins)</option>
                <option value="10">10 Questions (Full Simulation ~ 35 mins)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-[#202934] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#8E9CAE]">
              <Zap className="w-4 h-4 text-[#E8C982]" />
              <span>Genuine AI Evaluation: Questions generated specifically on chosen topic &amp; depth.</span>
            </div>

            <button
              type="submit"
              disabled={starting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#0B0E14] font-bold text-xs shadow-lg shadow-[#E8C982]/15 transition-all disabled:opacity-40 cursor-pointer active:scale-95"
            >
              {starting ? (
                <div className="w-4 h-4 border-2 border-[#0B0E14] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Launch Interview Session</span>
                  <ArrowRight className="w-4 h-4 text-[#0B0E14]" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default InterviewHubPage;
