import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { readinessApi } from '../../../api/readinessApi';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Code,
  BrainCircuit,
  Bot,
  Layers,
  Check,
  Zap,
  Sliders,
  Target,
  Flame,
  Filter,
  GraduationCap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Calendar,
} from 'lucide-react';

export const RoadmapPage = () => {
  const location = useLocation();

  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [error, setError] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Custom Configuration Form State
  const [topicsInput, setTopicsInput] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [depthLevel, setDepthLevel] = useState('IN_DEPTH'); // 'BRIEF' | 'IN_DEPTH' | 'GENERAL_AWARENESS'
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [targetCompany, setTargetCompany] = useState('Tech Industry');

  const loadCurrentRoadmap = async () => {
    try {
      const [currRes, histRes] = await Promise.allSettled([
        readinessApi.getCurrentRoadmap(),
        readinessApi.getRoadmapHistory(),
      ]);

      if (currRes.status === 'fulfilled' && currRes.value?.success) {
        setRoadmap(currRes.value.data);
      }
      if (histRes.status === 'fulfilled' && histRes.value?.success) {
        setHistory(histRes.value.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load preparation roadmap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If incoming navigation passed pre-filled state from Skill Gap Analyzer
    if (location.state?.generatedRoadmap) {
      setRoadmap(location.state.generatedRoadmap);
      setLoading(false);
    } else {
      loadCurrentRoadmap();
    }
  }, [location.state]);

  const handleGenerateRoadmap = async (e) => {
    if (e) e.preventDefault();
    setGenerating(true);
    setError('');

    // Parse topics
    const parsedTopics = topicsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const payload = {
        durationDays: parseInt(durationDays, 10),
        hoursPerDay: parseInt(hoursPerDay, 10),
        depthLevel,
        topics: parsedTopics.length > 0 ? parsedTopics : null,
        targetRole: targetRole.trim() || 'Software Engineer',
        targetCompany: targetCompany.trim() || 'Tech Industry',
      };

      const res = await readinessApi.generateRoadmap(payload);
      if (res?.success && res?.data) {
        setRoadmap(res.data);
        setShowConfigModal(false);
        // Refresh history
        const histRes = await readinessApi.getRoadmapHistory();
        if (histRes?.success) setHistory(histRes.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      const res = await readinessApi.updateRoadmapTaskStatus(taskId, !currentCompleted, false);
      if (res?.success && res?.data) {
        setRoadmap((prev) => {
          if (!prev) return prev;
          const updatedTasks = prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: !currentCompleted } : t));
          const completedCount = updatedTasks.filter((t) => t.completed).length;
          const progress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
          return {
            ...prev,
            tasks: updatedTasks,
            completedTasks: completedCount,
            progressPercentage: progress,
          };
        });
      }
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
    }
  };

  const handleQuickTopicPreset = (presetName) => {
    if (presetName === 'full_stack') {
      setTopicsInput('Java, Spring Boot, React, SQL & DBMS, Docker, REST APIs');
      setTargetRole('Full Stack Developer');
    } else if (presetName === 'dsa_core') {
      setTopicsInput('Data Structures, Algorithms, Dynamic Programming, Graphs, DBMS, Operating Systems');
      setTargetRole('Software Engineer (Product)');
    } else if (presetName === 'system_design') {
      setTopicsInput('System Design, Microservices, Caching (Redis), Kafka, Database Sharding, Cloud Architecture');
      setTargetRole('Backend / Systems Engineer');
    } else if (presetName === 'ai_ml') {
      setTopicsInput('Python, Machine Learning, Deep Learning, SQL, LLMs & Prompt Engineering, Data Preprocessing');
      setTargetRole('AI / Machine Learning Engineer');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'LEARN':
        return <BookOpen className="w-3.5 h-3.5 text-zinc-300" />;
      case 'CODING':
        return <Code className="w-3.5 h-3.5 text-emerald-400" />;
      case 'QUIZ':
        return <BrainCircuit className="w-3.5 h-3.5 text-sky-400" />;
      case 'MOCK_INTERVIEW':
        return <Bot className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getResourceTypeBadge = (type) => {
    switch (type?.toUpperCase()) {
      case 'DOCUMENTATION':
        return { label: 'DOCS', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
      case 'PRACTICE':
        return { label: 'PRACTICE', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'ARTICLE':
        return { label: 'GUIDE', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'VIDEO':
        return { label: 'VIDEO', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      default:
        return { label: 'RESOURCE', color: 'bg-zinc-900 text-zinc-400 border-zinc-800' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[460px] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white tracking-wide">Synthesizing Adaptive Roadmap...</p>
          <p className="text-xs text-zinc-500 mt-1">Calculating milestones, timelines, and curated resources</p>
        </div>
      </div>
    );
  }

  const tasks = roadmap?.tasks || [];
  const filteredTasks = tasks.filter((t) => {
    if (filterMode === 'COMPLETED') return t.completed;
    if (filterMode === 'PENDING') return !t.completed;
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 text-[#F7F7F5]">
      {/* 5. VISUALLY IMPRESSIVE PAGE HEADER */}
      <div
        className="relative overflow-hidden rounded-[22px] border border-[#252D35] p-8 sm:p-10 shadow-[0_18px_50px_rgba(0,0,0,0.30)] transition-all hover:border-[#E8C982]/30"
        style={{
          background: 'linear-gradient(110deg, #10161B 0%, #0C1116 45%, #13120E 100%)'
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B22] border border-[#252C34] text-[11px] font-semibold tracking-wider uppercase text-[#A9B0BA]">
              <Compass className="w-3.5 h-3.5 text-[#E8C982]" />
              <span>Career Execution Track</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold -tracking-[0.02em] text-[#F7F7F5] leading-tight">
              Personalized Preparation Roadmap
            </h1>
            <p className="text-sm text-[#A9B0BA] font-normal leading-relaxed">
              Your day-by-day milestone trajectory. Complete curated tasks, test your skills, and systematically close competency gaps to achieve candidate readiness.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#E8C982] text-[#05070A] font-bold text-xs tracking-wide hover:bg-[#F5DFA8] transition-all shadow-[0_2px_16px_rgba(232,201,130,0.25)] transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#05070A]" />
              <span>Customize Schedule</span>
            </button>
            <div className="px-4 py-2 rounded-xl bg-[#11171D] border border-[#252C34] flex items-center justify-between gap-4 text-xs">
              <span className="text-[#A9B0BA]">Total Milestones</span>
              <span className="font-mono font-semibold text-[#F7F7F5]">{tasks.length} days mapped</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#10161C] border border-[#FF5A5F]/40 rounded-2xl flex items-center gap-3 text-[#FF5A5F] text-xs">
          <AlertCircle className="w-4 h-4 text-[#FF5A5F] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ROADMAP CONFIGURATOR CARD / MODAL */}
      {showConfigModal && (
        <div className="bg-[#10161C] rounded-[22px] border border-[#252D35] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#F7F7F5] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#E8C982]" />
                <span>Configure Preparation Roadmap</span>
              </h2>
              <p className="text-xs text-[#A9B0BA] mt-0.5">
                Define the topics you want to prepare, your time commitment, and learning intensity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowConfigModal(false)}
              className="text-xs text-[#A9B0BA] hover:text-[#F7F7F5] font-semibold px-3 py-1.5 rounded-lg bg-[#151B22] border border-[#252C34] hover:border-white/20 transition-colors cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <form onSubmit={handleGenerateRoadmap} className="space-y-6">
            {/* Topics Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-[#A9B0BA] uppercase tracking-wider">
                  Topics to Prepare (Comma-separated)
                </label>
                <div className="flex items-center gap-1.5 text-xs text-[#68717D] flex-wrap">
                  <span className="text-[11px] uppercase font-bold tracking-wider">Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickTopicPreset('full_stack')}
                    className="px-2.5 py-1 rounded-lg bg-[#151B22] hover:bg-[#181E25] text-[#A9B0BA] hover:text-[#F7F7F5] border border-[#252C34] hover:border-[#E8C982]/40 text-[11px] transition-all cursor-pointer"
                  >
                    Full Stack
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTopicPreset('dsa_core')}
                    className="px-2.5 py-1 rounded-lg bg-[#151B22] hover:bg-[#181E25] text-[#A9B0BA] hover:text-[#F7F7F5] border border-[#252C34] hover:border-[#E8C982]/40 text-[11px] transition-all cursor-pointer"
                  >
                    DSA &amp; CS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTopicPreset('system_design')}
                    className="px-2.5 py-1 rounded-lg bg-[#151B22] hover:bg-[#181E25] text-[#A9B0BA] hover:text-[#F7F7F5] border border-[#252C34] hover:border-[#E8C982]/40 text-[11px] transition-all cursor-pointer"
                  >
                    System Design
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTopicPreset('ai_ml')}
                    className="px-2.5 py-1 rounded-lg bg-[#151B22] hover:bg-[#181E25] text-[#A9B0BA] hover:text-[#F7F7F5] border border-[#252C34] hover:border-[#E8C982]/40 text-[11px] transition-all cursor-pointer"
                  >
                    AI / ML
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                placeholder="e.g. Java, Spring Boot, Data Structures, System Design, React, Microservices, SQL..."
                className="w-full p-3.5 text-xs rounded-xl bg-[#11171D] border border-[#252C34] text-[#F7F7F5] placeholder-[#68717D] focus:outline-none focus:border-[#E8C982] font-mono leading-relaxed transition-colors"
              />
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Duration in Days */}
              <div className="bg-[#11171D] p-4 rounded-2xl border border-[#252C34]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A9B0BA] mb-2">
                  Duration (Days)
                </label>
                <div className="flex items-center gap-1.5">
                  {[7, 15, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDurationDays(d)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        durationDays === d
                          ? 'bg-[#E8C982] text-[#05070A] border-[#E8C982] font-bold shadow-xs'
                          : 'bg-[#151B22] text-[#A9B0BA] border-[#252C34] hover:bg-[#181E25] hover:text-white'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours per day */}
              <div className="bg-[#11171D] p-4 rounded-2xl border border-[#252C34]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A9B0BA] mb-2">
                  Daily Hours
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 6].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHoursPerDay(h)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        hoursPerDay === h
                          ? 'bg-[#E8C982] text-[#05070A] border-[#E8C982] font-bold shadow-xs'
                          : 'bg-[#151B22] text-[#A9B0BA] border-[#252C34] hover:bg-[#181E25] hover:text-white'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Depth Level */}
              <div className="bg-[#11171D] p-4 rounded-2xl border border-[#252C34]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A9B0BA] mb-2">
                  Learning Depth
                </label>
                <select
                  value={depthLevel}
                  onChange={(e) => setDepthLevel(e.target.value)}
                  className="w-full p-2 text-xs font-medium rounded-xl bg-[#151B22] border border-[#252C34] text-[#F7F7F5] focus:outline-none focus:border-[#E8C982]"
                >
                  <option value="BRIEF">⚡ Brief (Quick Revision)</option>
                  <option value="IN_DEPTH">🔬 In-Depth (Mastery &amp; Coding)</option>
                  <option value="GENERAL_AWARENESS">🌐 General Awareness (High-Level)</option>
                </select>
              </div>
            </div>

            {/* Target Role and Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Target Role (e.g. Software Engineer)"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-[#11171D] border border-[#252C34] text-[#F7F7F5] placeholder-[#68717D] focus:outline-none focus:border-[#E8C982]"
              />
              <input
                type="text"
                placeholder="Target Company (e.g. Google / Microsoft / Amazon)"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-[#11171D] border border-[#252C34] text-[#F7F7F5] placeholder-[#68717D] focus:outline-none focus:border-[#E8C982]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[#252C34] bg-[#11171D] text-[#A9B0BA] hover:text-[#F7F7F5] text-xs font-semibold hover:bg-[#151B22] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] text-xs font-bold shadow-[0_2px_16px_rgba(232,201,130,0.25)] transition-all disabled:opacity-40 cursor-pointer transform hover:-translate-y-0.5 active:scale-95"
              >
                {generating ? (
                  <div className="w-4 h-4 border-2 border-[#05070A] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5 text-[#05070A]" />
                    <span>Generate Active Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ROADMAP OVERVIEW CARD */}
      {roadmap && (
        <div className="space-y-6">
          <div className="bg-[#10161C] rounded-[22px] border border-[#252D35] p-6 sm:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.30)] hover:border-[#E8C982]/30 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#35D07F]/10 text-[#35D07F] rounded-md border border-[#35D07F]/25">
                    ACTIVE ROADMAP (v{roadmap.versionNumber})
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-md border bg-[#151B22] text-[#A9B0BA] border-[#252C34]">
                    {roadmap.durationDays} Days • {roadmap.hoursPerDay}h / Day
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F7F7F5] mt-2">
                  Preparation Schedule for {roadmap.targetRole}
                </h2>
                <p className="text-xs text-[#A9B0BA] mt-1">
                  Target Company: <strong className="text-white">{roadmap.targetCompany}</strong>
                </p>
              </div>

              {/* Progress Ring / Percentage Pod */}
              <div className="flex items-center gap-4 bg-[#11171D] p-4 rounded-2xl border border-[#252C34] self-start sm:self-auto">
                <div className="text-center px-2">
                  <span className="text-3xl font-extrabold text-[#F7F7F5]">{roadmap.progressPercentage}%</span>
                  <span className="text-[10px] text-[#68717D] block uppercase font-bold mt-0.5">Completed</span>
                </div>
                <div className="w-[1px] h-10 bg-white/[0.08]"></div>
                <div className="text-center px-2">
                  <span className="text-xl font-bold text-[#35D07F]">
                    {roadmap.completedTasks} / {roadmap.totalTasks}
                  </span>
                  <span className="text-[10px] text-[#68717D] block uppercase font-bold mt-0.5">Tasks Done</span>
                </div>
              </div>
            </div>

            {/* Task Filters */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#11171D] border border-[#252C34]">
                {[
                  { id: 'ALL', label: `All Days (${tasks.length})` },
                  { id: 'PENDING', label: `Pending (${tasks.length - roadmap.completedTasks})` },
                  { id: 'COMPLETED', label: `Completed (${roadmap.completedTasks})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterMode(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      filterMode === f.id
                        ? 'bg-[#E8C982] text-[#05070A] font-bold shadow-xs'
                        : 'text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-[#151B22]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-[#A9B0BA] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#35D07F]" />
                <span>Check off completed tasks to update readiness</span>
              </div>
            </div>
          </div>

          {/* DAY-BY-DAY TASK TIMELINE WITH CURATED RESOURCES */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="bg-[#10161C] rounded-2xl border border-[#252D35] p-8 text-center text-[#68717D] text-xs">
                No tasks matching the selected filter.
              </div>
            ) : (
              filteredTasks.map((t) => {
                const isExpanded = expandedTaskId === t.id;
                const resources = t.resources || [];

                return (
                  <div
                    key={t.id}
                    className={`rounded-2xl border transition-all duration-200 ${
                      t.completed
                        ? 'border-[#35D07F]/25 bg-[#081510]'
                        : 'border-[#252D35] bg-[#10161C] hover:border-[#E8C982]/40 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                    }`}
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Completion Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleTask(t.id, t.completed)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                            t.completed
                              ? 'bg-[#35D07F] border-[#35D07F] text-[#05070A]'
                              : 'border-[#252C34] hover:border-[#E8C982] bg-[#11171D]'
                          }`}
                        >
                          {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#E8C982] bg-[#E8C982]/10 border border-[#E8C982]/25 px-2.5 py-0.5 rounded-md font-mono">
                              Day {t.dayNumber}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F7F7F5] bg-[#151B22] px-2.5 py-0.5 rounded-md border border-[#252C34]">
                              {getActivityIcon(t.activityType)}
                              <span>{t.activityType}</span>
                            </span>
                            <span className="text-xs text-[#68717D]">
                              {t.estimatedDurationMinutes} mins
                            </span>
                          </div>

                          <h4
                            className={`text-sm font-semibold mt-1.5 ${
                              t.completed ? 'text-[#68717D] line-through' : 'text-[#F7F7F5]'
                            }`}
                          >
                            {t.topic}
                          </h4>

                          <p className="text-xs text-[#A9B0BA] mt-1 leading-relaxed">
                            {t.learningObjective}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${
                            t.priority === 'HIGH'
                              ? 'bg-[#FF5A5F]/10 text-[#FF5A5F] border-[#FF5A5F]/25'
                              : t.priority === 'MEDIUM'
                              ? 'bg-[#F2B84B]/10 text-[#F2B84B] border-[#F2B84B]/25'
                              : 'bg-[#151B22] text-[#A9B0BA] border-[#252C34]'
                          }`}
                        >
                          {t.priority}
                        </span>

                        {resources.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-[#11171D] text-[#A9B0BA] hover:text-[#F7F7F5] border border-[#252C34] hover:border-[#E8C982]/40 transition-colors cursor-pointer"
                          >
                            <Bookmark className="w-3.5 h-3.5 text-[#E8C982]" />
                            <span>{resources.length} Resources</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#A9B0BA]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#A9B0BA]" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* EXPANDABLE LEARNING RESOURCES DRAWER */}
                    {isExpanded && resources.length > 0 && (
                      <div className="bg-[#0D1217] px-5 py-4 border-t border-[#252C34] rounded-b-2xl animate-fadeIn space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#A9B0BA] uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-[#E8C982]" />
                            <span>Curated Day {t.dayNumber} Learning &amp; Practice Resources</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {resources.map((res, idx) => {
                            const badge = getResourceTypeBadge(res.type);
                            return (
                              <a
                                key={idx}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3.5 bg-[#11171D] rounded-xl border border-[#252C34] hover:border-[#E8C982]/40 transition-all flex flex-col justify-between group transform hover:-translate-y-0.5 cursor-pointer shadow-xs"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${badge.color}`}>
                                      {badge.label}
                                    </span>
                                    {res.estimatedReadTime && (
                                      <span className="text-[10px] text-[#68717D] font-mono">
                                        {res.estimatedReadTime}
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="text-xs font-semibold text-[#F7F7F5] group-hover:text-white transition-colors flex items-center gap-1.5">
                                    <span>{res.title}</span>
                                    <ExternalLink className="w-3 h-3 text-[#68717D] group-hover:text-[#E8C982] transition-colors shrink-0" />
                                  </h5>
                                  {res.description && (
                                    <p className="text-[11px] text-[#A9B0BA] mt-1 leading-snug">
                                      {res.description}
                                    </p>
                                  )}
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
