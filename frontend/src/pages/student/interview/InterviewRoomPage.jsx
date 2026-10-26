import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '../../../api/interviewApi';
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Radio,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
} from 'lucide-react';

export const InterviewRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastTurnFeedback, setLastTurnFeedback] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [error, setError] = useState('');

  // Voice Agent State
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Time Limit Per Question (in seconds)
  const QUESTION_TIME_LIMIT = 90; // 90 seconds limit per question
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [timeTaken, setTimeTaken] = useState(0);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // 1. Load Session Data
  const loadSession = async () => {
    try {
      const res = await interviewApi.getInterviewSession(id);
      if (res.success && res.data) {
        setSession(res.data);
        if (res.data.finished) {
          navigate(`/interview/results/${id}`, { replace: true });
        } else {
          setCurrentQuestion(res.data.currentQuestion);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load interview session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    return () => {
      // Clean up speech on unmount
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      stopListening();
    };
  }, [id]);

  // 2. Initialize Speech Recognition (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setAnswerText(transcript.trim());
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('Microphone access denied. You can still type your response manually.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  // 3. AI Voice Agent: Speak Question (Text-to-Speech)
  const speakQuestion = (text) => {
    if (!window.speechSynthesis || voiceMuted || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Natural conversational pacing
    utterance.pitch = 1.0;

    // Pick English natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('English') || v.name.includes('Samantha') || v.name.includes('David'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsAiSpeaking(true);
      stopListening();
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
      // Auto-start listening after AI finishes speaking the question
      startListening();
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
      startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  // 4. Trigger voice when new question loads
  useEffect(() => {
    if (currentQuestion) {
      setAnswerText('');
      setTimeLeft(QUESTION_TIME_LIMIT);
      setTimeTaken(0);
      setShowFeedbackModal(false);

      // Brief pause before AI speaks
      const timer = setTimeout(() => {
        speakQuestion(currentQuestion.questionText);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentQuestion]);

  // 5. Countdown Timer per Question
  useEffect(() => {
    if (currentQuestion && !showFeedbackModal && !submitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto-submit when time expires!
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeTaken((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [currentQuestion, showFeedbackModal, submitting, answerText]);

  // 6. Speech Recognition Controls
  const startListening = () => {
    if (isAiSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError('');
      } catch (err) {
        // Recognition might already be running
        setIsListening(true);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // 7. Auto-submit on timer expiry
  const handleAutoSubmit = () => {
    stopListening();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    // If answerText is empty, submit explicit silence indicator
    const submissionText = answerText.trim() || 'Candidate provided no response within the allotted time limit.';
    performSubmit(submissionText);
  };

  // 8. Handle Manual Submit
  const handleSubmitAnswer = (e) => {
    if (e) e.preventDefault();
    if (!currentQuestion) return;

    stopListening();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const clean = answerText.trim();
    if (!clean) {
      const confirmZero = window.confirm(
        'You have not spoken or typed an answer. Submitting an empty answer will evaluate to 0% for this question.\n\nClick OK to submit as 0%, or Cancel to continue speaking.'
      );
      if (!confirmZero) return;
      performSubmit('Candidate provided no response within the allotted time limit.');
      return;
    }

    performSubmit(clean);
  };

  const performSubmit = async (textToSubmit) => {
    setSubmitting(true);
    setError('');

    try {
      const res = await interviewApi.submitAnswer(id, {
        questionId: currentQuestion.id,
        answerText: textToSubmit,
        timeTakenSeconds: timeTaken,
      });

      if (res.success && res.data) {
        setLastTurnFeedback(res.data.turnEvaluation);
        setShowFeedbackModal(true);

        if (res.data.finished) {
          setTimeout(() => {
            navigate(`/interview/results/${id}`, { replace: true });
          }, 3500);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedbackModal(false);
    loadSession();
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const progressPercent = currentQuestion
    ? ((currentQuestion.sequenceNumber - 1) / session?.totalQuestions) * 100
    : 100;

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Connecting to AI Voice Agent...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="p-8 bg-slate-800 border border-slate-700 rounded-3xl text-center max-w-md mx-auto shadow-xl my-12">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Session Error</h2>
        <p className="text-rose-300 text-sm mb-6">{error || 'Session not found.'}</p>
        <button
          onClick={() => navigate('/interview')}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
        >
          Return to Interview Hub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-brand-500/20 text-brand-400 rounded-full border border-brand-500/30">
              {session.interviewType?.replace('_', ' ')}
            </span>
            {session.topic && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                🎯 {session.topic}
              </span>
            )}
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
              Depth: {session.difficulty}
            </span>
          </div>
          <h1 className="text-xl font-extrabold mt-1.5 flex items-center gap-2">
            <span>AI Voice Interview Room</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
              Live Audio
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role: <strong>{session.targetRole}</strong> • Company Benchmark: <strong>{session.targetCompany}</strong>
          </p>
        </div>

        {/* Voice & Audio Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setVoiceMuted(!voiceMuted)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
              voiceMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }`}
            title={voiceMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
          >
            {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{voiceMuted ? 'Voice Muted' : 'AI Voice On'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Time Limit Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-700">
            Question {currentQuestion?.sequenceNumber || session.totalQuestions} of {session.totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${timeLeft <= 15 ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`} />
            <span className={`text-xs font-extrabold ${timeLeft <= 15 ? 'text-rose-600' : 'text-slate-800'}`}>
              Time Left: {formatSeconds(timeLeft)}
            </span>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft <= 15
                ? 'bg-rose-500'
                : timeLeft <= 35
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-brand-600 to-indigo-600'
            }`}
            style={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* AI VOICE AGENT AVATAR & QUESTION CARD */}
      {currentQuestion && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          {/* Voice Agent Visualizer Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-4 z-10">
              {/* Animated Agent Avatar */}
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    isAiSpeaking
                      ? 'bg-gradient-to-tr from-brand-600 to-indigo-500 ring-4 ring-brand-400/40 animate-pulse'
                      : isListening
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-4 ring-emerald-400/40'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                >
                  <Bot className="w-7 h-7 text-white" />
                </div>
                {isAiSpeaking && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-400 rounded-full border-2 border-slate-900 animate-ping"></span>
                )}
                {isListening && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping"></span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    AI Interview Agent
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      isAiSpeaking
                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                        : isListening
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isAiSpeaking ? 'Speaking Question 🔊' : isListening ? 'Listening to You 🎙️' : 'Ready'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  Question {currentQuestion.sequenceNumber} of {session.totalQuestions} • Topic: {currentQuestion.topic}
                </h3>
              </div>
            </div>

            {/* Replay Question Button */}
            <div className="flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={() => speakQuestion(currentQuestion.questionText)}
                disabled={isAiSpeaking}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Question</span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">
              "{currentQuestion.questionText}"
            </h2>
            {currentQuestion.contextRationale && (
              <p className="text-xs text-slate-500 italic">
                Evaluator note: {currentQuestion.contextRationale}
              </p>
            )}
          </div>

          {/* STUDENT VOICE ANSWER & TRANSCRIPTION AREA */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Spoken Response
                </span>
                {isListening && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Mic Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold ${wordCount < 25 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {wordCount} words {wordCount < 25 && '(Target >= 30 for depth)'}
                </span>

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isListening
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Pause Mic</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>Speak / Start Mic</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Answer Transcription Box */}
            <div className="relative">
              <textarea
                rows={5}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening... Speak your answer into your microphone now.'
                    : 'Click "Speak / Start Mic" to answer with voice, or type your response here...'
                }
                className={`w-full p-4 rounded-2xl text-sm font-medium text-slate-900 border focus:outline-none transition-all resize-none ${
                  isListening
                    ? 'bg-emerald-50/30 border-emerald-400 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />

              {isListening && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 pointer-events-none">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1.5 h-5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.45s]"></span>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Zap className="w-4 h-4 text-brand-600" />
                <span>
                  Auto-submits when time runs out ({formatSeconds(timeLeft)} remaining)
                </span>
              </div>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Submit Voice Answer &amp; Analyze</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE TURN EVALUATION FEEDBACK MODAL */}
      {showFeedbackModal && lastTurnFeedback && (
        <div className="p-6 bg-gradient-to-r from-brand-50 via-indigo-50 to-white border-2 border-brand-200 rounded-3xl shadow-lg animate-fadeIn space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-extrabold text-sm">
                {lastTurnFeedback.overallTurnScore}%
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Voice Answer Evaluated</h4>
                <p className="text-xs text-slate-500">AI analysis for Question {currentQuestion?.sequenceNumber}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Breakdown Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Relevance</span>
              <span className="text-base font-extrabold text-slate-900">{lastTurnFeedback.relevanceScore}%</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Technical</span>
              <span className="text-base font-extrabold text-slate-900">{lastTurnFeedback.technicalCorrectnessScore}%</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Completeness</span>
              <span className="text-base font-extrabold text-slate-900">{lastTurnFeedback.completenessScore}%</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Clarity</span>
              <span className="text-base font-extrabold text-slate-900">{lastTurnFeedback.clarityScore}%</span>
            </div>
          </div>

          {/* Strengths and Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {lastTurnFeedback.strengths?.length > 0 && (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                <strong className="block mb-1 text-emerald-800">Key Strength:</strong>
                <span>{lastTurnFeedback.strengths[0]}</span>
              </div>
            )}
            {lastTurnFeedback.improvementSuggestions?.length > 0 && (
              <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-900">
                <strong className="block mb-1 text-indigo-800">Improvement Tip:</strong>
                <span>{lastTurnFeedback.improvementSuggestions[0]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

