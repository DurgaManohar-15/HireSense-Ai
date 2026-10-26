import React, { useState, useEffect, useRef } from 'react';
import { platformApi } from '../../../api/platformApi';
import { AssessmentConfigModal } from '../../../components/assessment/AssessmentConfigModal';
import {
  Bot,
  User,
  Send,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCheck,
  SlidersHorizontal,
  Flame,
  Clock,
  MessageSquare,
  Cpu,
} from 'lucide-react';

export const CareerAssistantPage = () => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Custom Assessment Modal State
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessmentModalConfig, setAssessmentModalConfig] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const res = await platformApi.getLatestCareerConversation();
        if (res.success && res.data) {
          setConversation(res.data);
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load career assistant conversation');
      } finally {
        setLoading(false);
      }
    };
    fetchConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || sending) return;

    const userMsg = {
      id: Date.now(),
      senderType: 'USER',
      messageText: query.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setSending(true);
    setError('');

    try {
      const res = await platformApi.careerChat(query.trim(), conversation?.id || null);
      if (res.success && res.data) {
        const assistantMsg = {
          id: Date.now() + 1,
          senderType: 'ASSISTANT',
          messageText: res.data.assistantReply,
          evidenceSources: res.data.evidenceSources,
          actionSuggestions: res.data.actionSuggestions,
          assessmentRecommendation: res.data.assessmentRecommendation,
          createdAt: res.data.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (res.data.conversationId) {
          setConversation((prev) => ({ ...prev, id: res.data.conversationId }));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to receive career assistant response');
    } finally {
      setSending(false);
    }
  };

  const handleOpenAssessmentModal = (config = null) => {
    setAssessmentModalConfig(config);
    setIsAssessmentModalOpen(true);
  };

  const starterQuestions = [
    'Conduct an assessment for me on Java',
    'Give me a DBMS assessment with 15 questions',
    'Recommend an assessment based on my weak areas',
    'What should I improve first to maximize my PRS score?',
  ];

  if (loading) {
    return (
      <div className="min-h-[460px] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-500">Connecting to HireSense AI Copilot...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-[#F8FAFC]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#202934] bg-gradient-to-b from-[#151B22] via-[#10161C] to-[#0A0E13] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B22] border border-[#202934] text-[11px] font-semibold tracking-wider uppercase text-[#E8C982] mb-2">
            <Cpu className="w-3.5 h-3.5 text-[#E8C982]" />
            <span>AI Career Copilot</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
            Career Guidance Advisor
          </h1>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-1 max-w-xl">
            Objective career guidance calibrated directly against your verified readiness metrics and target job requirements.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleOpenAssessmentModal({ topics: ['Java'], questionCount: 15, difficulty: 'MEDIUM' })}
            className="px-5 py-2.5 rounded-xl bg-[#E7C98A] hover:bg-[#F4DFAF] text-[#05070A] text-xs font-bold shadow-[0_2px_14px_rgba(231,201,138,0.25)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#05070A]" />
            <span>Configure Assessment</span>
          </button>

          <div className={`px-3 py-2 rounded-xl text-[11px] font-mono font-semibold border flex items-center gap-2 ${
            conversation?.aiProvider?.toUpperCase().includes('GEMINI')
              ? 'bg-[#151A20] text-[#E7C98A] border-[#E7C98A]/30'
              : 'bg-[#101419] text-[#A7AFBB] border-[#252B33]'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              conversation?.aiProvider?.toUpperCase().includes('GEMINI')
                ? 'bg-[#E7C98A]'
                : 'bg-[#35D07F]'
            }`}></span>
            <span>{conversation?.aiProvider?.toUpperCase().includes('GEMINI') ? 'GEMINI LIVE' : 'AI ACTIVE'}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#11161C] border border-[#FF5A5F]/30 rounded-2xl flex items-center gap-3 text-[#FF5A5F] text-xs">
          <AlertCircle className="w-4 h-4 text-[#FF5A5F] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="bg-[#11161C] rounded-3xl border border-[#252B33] shadow-[0_12px_40px_rgba(0,0,0,0.25)] p-6 min-h-[460px] max-h-[620px] overflow-y-auto flex flex-col space-y-4">
        {messages.length === 0 && (
          <div className="my-auto text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#151A20] border border-[#252B33] flex items-center justify-center mx-auto text-[#E7C98A]">
              <Bot className="w-6 h-6 text-[#E7C98A]" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">How can HireSense assist your career today?</h3>
            <p className="text-xs text-[#A7AFBB] max-w-md mx-auto">
              Ask about your Placement Readiness Score, request diagnostic assessments, or formulate targeted study schedules.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.senderType === 'USER';
          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-[#E7C98A] text-[#05070A]' : 'bg-[#151A20] text-[#E7C98A] border border-[#252B33]'
                }`}
              >
                {isUser ? <User className="w-4 h-4 text-[#05070A]" /> : <Bot className="w-4 h-4 text-[#E7C98A]" />}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-[#E7C98A] text-[#05070A] rounded-tr-none font-semibold shadow-sm'
                    : 'bg-[#101419] border border-[#252B33] text-[#F8FAFC] rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.messageText}</div>

                {/* Structured Assessment Recommendation Card */}
                {msg.assessmentRecommendation && (
                  <div className="p-4 rounded-2xl bg-[#161616] border border-zinc-700 space-y-3 mt-2 text-zinc-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-white" />
                        <span className="font-bold text-xs text-white">
                          Recommended Assessment Calibration
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-200 text-[10px] font-mono border border-zinc-700">
                        {msg.assessmentRecommendation.difficulty || 'MEDIUM'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-1.5 font-medium text-zinc-300">
                        <Layers className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Topics: {msg.assessmentRecommendation.topics?.join(', ') || 'Core Technical'}</span>
                      </div>

                      <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-1.5 font-medium text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{msg.assessmentRecommendation.questionCount || 15} Questions (~{msg.assessmentRecommendation.durationMinutes || 30} mins)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAssessmentModal(msg.assessmentRecommendation)}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <span>Confirm &amp; Launch Assessment</span>
                      <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </button>
                  </div>
                )}

                {/* Evidence Sources */}
                {msg.evidenceSources && msg.evidenceSources.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Evidence:</span>
                    {msg.evidenceSources.map((ev, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px] font-mono border border-zinc-800"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Suggestions */}
                {msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Recommended Next Actions:
                    </span>
                    <ul className="space-y-1">
                      {msg.actionSuggestions.map((sug, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex gap-3 mr-auto max-w-[85%]">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#121212] border border-zinc-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
              <span className="text-xs text-zinc-400 font-medium">Synthesizing platform evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {starterQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={sending}
            className="px-3.5 py-2 rounded-xl bg-[#101419] hover:bg-[#151A20] text-[#A7AFBB] hover:text-[#E7C98A] text-xs font-medium border border-[#252B33] hover:border-[#E7C98A]/35 transition-all hover:-translate-y-0.5 shadow-xs disabled:opacity-40 text-left cursor-pointer"
          >
            ✦ {q}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-[#101419] rounded-2xl border border-[#252B33] focus-within:border-[#E7C98A]/50 p-2 shadow-xl flex items-center gap-2 transition-colors"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about your readiness score, or ask: 'Conduct an assessment for me on Java'..."
          maxLength={1000}
          disabled={sending}
          className="flex-grow px-4 py-3 bg-transparent text-xs text-[#F8FAFC] focus:outline-none placeholder-[#6F7783] font-medium"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || sending}
          className="p-3 rounded-xl bg-[#E7C98A] hover:bg-[#F4DFAF] text-[#05070A] transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer active:scale-95 shadow-[0_2px_10px_rgba(231,201,138,0.25)]"
        >
          <Send className="w-4 h-4 text-[#05070A]" />
        </button>
      </form>

      {/* Assessment Configuration Modal */}
      <AssessmentConfigModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        initialConfig={assessmentModalConfig}
      />
    </div>
  );
};
