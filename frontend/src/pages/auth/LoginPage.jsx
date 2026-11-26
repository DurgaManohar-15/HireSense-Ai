import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Target,
  FileText,
  Bot,
  TrendingUp,
} from 'lucide-react';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  // Check URL query error parameter (e.g. redirected back from Google OAuth error)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleGoogleOAuthRedirect = () => {
    setError('');
    setRedirecting(true);
    let backendBaseUrl = 'https://hiresense-ai-production-2ea510c0.up.railway.app/api/v1';
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        backendBaseUrl = 'http://localhost:8080/api/v1';
      }
    }
    const origin = encodeURIComponent(window.location.origin);
    window.location.href = `${backendBaseUrl}/auth/google?redirect_origin=${origin}`;
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#292929] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-[#E78260]/20 selection:text-[#E78260]">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[45rem] h-[45rem] bg-[#E78260]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-[#292929]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 py-6">
        {/* Left Column: Brand Hero & Placement Showcase */}
        <div className="lg:col-span-7 space-y-7">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E2DDD5] text-[#292929] text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#E78260]" />
            <span>AI-Driven Placement Readiness Intelligence</span>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] text-[#292929]">
              Bridge the Gap to <br />
              <span className="font-serif italic font-normal text-[#E78260]">
                Day-1 Enterprise Placements.
              </span>
            </h1>
            <p className="text-[#5C5850] text-sm sm:text-base leading-relaxed max-w-xl">
              HireSense AI calibrates candidate skills with an explainable Placement Readiness Score (PRS),
              ATS resume diagnostics, adaptive mock interviews, and tailored roadmap pacing.
            </p>
          </div>

          {/* Core Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm flex items-start gap-3 hover:border-[#E78260]/40 transition group">
              <div className="p-2 rounded-xl bg-[#FBEDE8] text-[#E78260] group-hover:scale-105 transition">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#292929]">Deterministic PRS Engine</h4>
                <p className="text-[11px] text-[#5C5850] mt-0.5">Weighted 0–100 scoring with multi-source evidence decay.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm flex items-start gap-3 hover:border-[#E78260]/40 transition group">
              <div className="p-2 rounded-xl bg-[#FBEDE8] text-[#E78260] group-hover:scale-105 transition">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#292929]">ATS Resume Diagnostics</h4>
                <p className="text-[11px] text-[#5C5850] mt-0.5">Automated keyword density, action verb &amp; fit scoring.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm flex items-start gap-3 hover:border-[#E78260]/40 transition group">
              <div className="p-2 rounded-xl bg-[#FBEDE8] text-[#E78260] group-hover:scale-105 transition">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#292929]">AI Mock Interview</h4>
                <p className="text-[11px] text-[#5C5850] mt-0.5">Turn-by-turn rubric feedback powered by Google Gemini.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm flex items-start gap-3 hover:border-[#E78260]/40 transition group">
              <div className="p-2 rounded-xl bg-[#FBEDE8] text-[#E78260] group-hover:scale-105 transition">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#292929]">Adaptive Study Roadmap</h4>
                <p className="text-[11px] text-[#5C5850] mt-0.5">Day-by-day milestone pacing tailored to target companies.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Warm Ivory & Terracotta Google-Only Auth Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white border border-[#E2DDD5] rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-black/[0.04] relative overflow-hidden">
            {/* Header with Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center justify-center gap-1 mb-3 group">
                <span className="text-2xl font-black tracking-tight text-[#292929]">HireSense</span>
                <span className="text-2xl font-serif text-[#E78260] font-bold group-hover:rotate-45 transition-transform duration-300">*</span>
              </Link>
              <h2 className="text-xl font-bold text-[#292929] mt-1">
                Sign in to your Workspace
              </h2>
              <p className="text-[#5C5850] text-xs mt-1.5 leading-relaxed">
                Access your assessments, resume score, and AI interview simulator with your Google account
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-[#FBEDE8] border border-[#E78260]/30 rounded-2xl flex items-start gap-2.5 text-[#D46845] text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#E78260]" />
                <div className="flex-1">
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Google OAuth Button */}
            <div className="space-y-4">
              <button
                type="button"
                id="google-oauth-btn"
                onClick={handleGoogleOAuthRedirect}
                disabled={redirecting}
                className="w-full py-3.5 px-5 bg-[#292929] hover:bg-black text-white rounded-full font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-70 shadow-lg shadow-black/10 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {redirecting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </span>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-[#8E8A82] pt-2">
                Single sign-on via Google. No separate registration required.
              </p>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#8E8A82] mt-4 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E78260]" />
            <span>Encrypted with TLS 1.3 &amp; Stateless JWT Authentication</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
