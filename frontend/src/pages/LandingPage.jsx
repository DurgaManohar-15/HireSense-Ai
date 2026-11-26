import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  FileText,
  Search,
  CheckCircle2,
  Briefcase,
  Bot,
  BrainCircuit,
  Award,
  Layers,
  Compass,
  Code2,
  Calculator,
  ChevronRight,
  ShieldCheck,
  Zap,
  Target,
  Users,
  Play,
  Star,
  Check,
  TrendingUp,
  FileCheck2,
  GraduationCap
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#292929] selection:bg-[#E78260]/20 selection:text-[#E78260] font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#F3EFE6]/90 border-b border-[#E2DDD5] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-1.5 group">
            <span className="text-2xl font-black tracking-tight text-[#292929]">
              HireSense
            </span>
            <span className="text-2xl font-serif text-[#E78260] group-hover:rotate-45 transition-transform duration-300 font-bold">
              *
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#292929]/80">
            <a href="#features" className="hover:text-[#E78260] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#E78260] transition-colors">How it works</a>
            <a href="#ecosystem" className="hover:text-[#E78260] transition-colors">Career Suite</a>
            <a href="#faq" className="hover:text-[#E78260] transition-colors">FAQ</a>
            <Link to="/jobs" className="hover:text-[#E78260] transition-colors">Explore Jobs</Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#292929] text-white hover:bg-[#1a1a1a] transition-all flex items-center gap-2 shadow-sm"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5 text-[#E78260]" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#292929] text-white hover:bg-black transition-all flex items-center gap-2 shadow-sm"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Soft Warm Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[48rem] h-[30rem] bg-[#E78260]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          {/* Subtle Rotating Badge (Mindly style) */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#E2DDD5] text-[#292929] text-xs font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#E78260] animate-pulse" />
              <span>Next-Gen Placement &amp; Career Operating System</span>
              <span className="text-[#E78260] font-serif font-bold">✦</span>
            </div>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#292929] leading-[1.1] max-w-4xl mx-auto">
            A clearer path <br />
            for a <span className="font-serif italic font-normal text-[#E78260]">brighter career.</span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-lg text-[#5C5850] max-w-2xl mx-auto leading-relaxed mt-6">
            HireSense AI evaluates your resumes, simulates real-time AI mock interviews, and personalizes your roadmap to top tech offers — all in one calm, beautifully structured workspace.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <Link
              to="/login"
              className="px-8 py-4 rounded-full text-sm font-semibold bg-[#E78260] text-white hover:bg-[#d46845] transition-all flex items-center gap-2.5 shadow-lg shadow-[#E78260]/25 transform hover:-translate-y-0.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#ecosystem"
              className="px-7 py-4 rounded-full text-sm font-medium bg-white hover:bg-[#FAF8F5] text-[#292929] border border-[#E2DDD5] transition-all flex items-center gap-2 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-[#E78260] fill-[#E78260]" />
              Explore AI Suite
            </a>
          </div>

          {/* Visual Showcase (Clean, Unobstructed Stage) */}
          <div className="mt-14 relative max-w-5xl mx-auto">

            {/* Main Interactive Stage Card */}
            <div className="bg-white rounded-[2rem] border border-[#E2DDD5] p-6 sm:p-10 shadow-xl shadow-black/[0.04]">

              {/* Card Header Pills */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E2DDD5]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#E78260]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5850]">
                    Placement Readiness Command Center
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#292929] bg-[#FAF8F5] border border-[#E2DDD5] px-3 py-1 rounded-full">
                    Amazon / Google / TCS Track
                  </span>
                </div>
              </div>

              {/* Three Pill Modules (Mindly visual style: Focus, Ideas, Plan) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">

                {/* Module 1: Diagnostic */}
                <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-2xl p-5 text-left hover:border-[#E78260]/60 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#292929]">01. Diagnostic</span>
                    <span className="text-xs font-bold text-[#E78260]">88%</span>
                  </div>
                  <h5 className="text-sm font-bold text-[#292929]">Core CS &amp; Aptitude</h5>
                  <p className="text-xs text-[#5C5850] mt-1 leading-relaxed">
                    Dynamic MCQ assessments across DSA, OOPs, DBMS, and OS.
                  </p>
                  <div className="mt-4 w-full bg-[#E2DDD5] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#E78260] h-full rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                {/* Module 2: Resume Engine */}
                <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-2xl p-5 text-left hover:border-[#E78260]/60 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#292929]">02. Resume ATS</span>
                    <span className="text-xs font-bold text-[#27AE60]">94%</span>
                  </div>
                  <h5 className="text-sm font-bold text-[#292929]">Tailored Per Vacancy</h5>
                  <p className="text-xs text-[#5C5850] mt-1 leading-relaxed">
                    Bullet impact scoring, missing JD keywords, and 20 templates.
                  </p>
                  <div className="mt-4 w-full bg-[#E2DDD5] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#27AE60] h-full rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>

                {/* Module 3: Interview Coach */}
                <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-2xl p-5 text-left hover:border-[#E78260]/60 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#292929]">03. Mock AI</span>
                    <span className="text-xs font-bold text-[#E78260]">Live</span>
                  </div>
                  <h5 className="text-sm font-bold text-[#292929]">Conversational Agent</h5>
                  <p className="text-xs text-[#5C5850] mt-1 leading-relaxed">
                    Audio &amp; text simulation with rubric-graded candidate evaluation.
                  </p>
                  <div className="mt-4 w-full bg-[#E2DDD5] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#292929] h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>

              {/* Bottom Social Proof Bar */}
              <div className="mt-8 pt-6 border-t border-[#E2DDD5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C5850]">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#E78260] text-white flex items-center justify-center font-bold text-[9px]">A</div>
                    <div className="w-6 h-6 rounded-full bg-[#292929] text-white flex items-center justify-center font-bold text-[9px]">K</div>
                    <div className="w-6 h-6 rounded-full bg-[#8E8A82] text-white flex items-center justify-center font-bold text-[9px]">P</div>
                  </div>
                  <span>Trusted by <strong>10,000+</strong> candidates worldwide</span>
                </div>
                <div className="font-serif italic text-sm text-[#292929]">
                  — Less chaos. More clarity.
                </div>
              </div>

            </div>

          </div>

          {/* Metrics Strip */}
          <div className="mt-16 pt-10 border-t border-[#E2DDD5] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#292929]">0 - 100</div>
              <div className="text-xs font-medium text-[#5C5850] mt-1">Readiness Metric (PRS)</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#292929]">20+</div>
              <div className="text-xs font-medium text-[#5C5850] mt-1">ATS Resume Templates</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#292929]">100%</div>
              <div className="text-xs font-medium text-[#5C5850] mt-1">Transparent JD Match</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#E78260]">AI-Calibrated</div>
              <div className="text-xs font-medium text-[#5C5850] mt-1">Mock Interview Feedback</div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Ecosystem Grid */}
      <section id="ecosystem" className="py-20 bg-white border-y border-[#E2DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-semibold text-[#E78260] uppercase tracking-widest">Unified Suite</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-[#292929] tracking-tight">
              One Profile. Zero Redundant Tools.
            </h3>
            <p className="text-[#5C5850] text-sm sm:text-base leading-relaxed">
              Harmonize your academic accomplishments across diagnostics, tailoring, interviews, coding sandbox, and placement roadmaps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card 1: Resume Builder */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E2DDD5] hover:border-[#E78260]/60 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#FBEDE8] text-[#E78260] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#292929] mb-2">Resume Builder &amp; Engine</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed mb-5">
                Split-screen live editor with 20 ATS-optimized templates, direct PDF/DOCX export, and revision versioning.
              </p>
              <Link to="/resume/builder" className="text-xs font-semibold text-[#E78260] flex items-center gap-1.5 hover:underline">
                Open Builder <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Resume Tailoring */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E2DDD5] hover:border-[#E78260]/60 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#FBEDE8] text-[#E78260] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#292929] mb-2">Job Tailoring Engine</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed mb-5">
                Compare your resume against specific employer JDs with bullet-by-bullet recommendations and instant score uplift.
              </p>
              <Link to="/resume/tailor" className="text-xs font-semibold text-[#E78260] flex items-center gap-1.5 hover:underline">
                Tailor Resume <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Job Search */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E2DDD5] hover:border-[#E78260]/60 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#FBEDE8] text-[#E78260] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#292929] mb-2">Intelligent Job Matching</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed mb-5">
                Discover verified vacancies with match breakdowns across skills, degree, and track requirements.
              </p>
              <Link to="/jobs" className="text-xs font-semibold text-[#E78260] flex items-center gap-1.5 hover:underline">
                Search Vacancies <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Application Tracker */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E2DDD5] hover:border-[#E78260]/60 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#FBEDE8] text-[#E78260] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#292929] mb-2">Application Kanban Tracker</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed mb-5">
                Organize pipeline stages from Applied through OA, Technical Rounds, and final Placement Offer.
              </p>
              <Link to="/applications" className="text-xs font-semibold text-[#E78260] flex items-center gap-1.5 hover:underline">
                Open Kanban <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 5: Coding Practice */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E2DDD5] hover:border-[#E78260]/60 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#FBEDE8] text-[#E78260] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#292929] mb-2">Coding Sandbox &amp; Practice</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed mb-5">
                Solve DSA algorithms across Arrays, Trees, Graphs, and DP in Java, Python, or C++ with automated test runner.
              </p>
              <Link to="/coding" className="text-xs font-semibold text-[#E78260] flex items-center gap-1.5 hover:underline">
                Practice Coding <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 6: Mock Interview */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E2DDD5] hover:border-[#E78260]/60 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#FBEDE8] text-[#E78260] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#292929] mb-2">AI Mock Interview Room</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed mb-5">
                Interactive dialogue evaluating technical precision, reasoning depth, and communication rubrics.
              </p>
              <Link to="/interview" className="text-xs font-semibold text-[#E78260] flex items-center gap-1.5 hover:underline">
                Start Interview <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Structured Methodology */}
      <section id="how-it-works" className="py-20 bg-[#F3EFE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-semibold text-[#E78260] uppercase tracking-widest">Methodology</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-[#292929] tracking-tight">Your Direct Path to Placement</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-7 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#E78260] text-white font-extrabold text-xs flex items-center justify-center mb-4">1</div>
              <h4 className="text-sm font-bold text-[#292929] mb-2">Build Profile &amp; Resume</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed">Complete onboarding, select target tier, and generate master resume with verified templates.</p>
            </div>
            <div className="p-7 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#E78260] text-white font-extrabold text-xs flex items-center justify-center mb-4">2</div>
              <h4 className="text-sm font-bold text-[#292929] mb-2">Diagnose &amp; Benchmark</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed">Take diagnostic MCQs, calculate ATS match, and pinpoint skill gaps against target jobs.</p>
            </div>
            <div className="p-7 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#E78260] text-white font-extrabold text-xs flex items-center justify-center mb-4">3</div>
              <h4 className="text-sm font-bold text-[#292929] mb-2">Tailor &amp; Practice</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed">Tailor per JD, generate cover letters, solve coding questions, and rehearse AI interviews.</p>
            </div>
            <div className="p-7 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#E78260] text-white font-extrabold text-xs flex items-center justify-center mb-4">4</div>
              <h4 className="text-sm font-bold text-[#292929] mb-2">Track &amp; Secure Offer</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed">Manage applications on Kanban, follow company-specific rounds, and achieve your Day-1 offer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white border-t border-[#E2DDD5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-2">
            <h2 className="text-xs font-semibold text-[#E78260] uppercase tracking-widest">Questions &amp; Answers</h2>
            <h3 className="text-3xl font-bold text-[#292929] tracking-tight">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            <div className="p-7 rounded-3xl bg-[#FAF8F5] border border-[#E2DDD5]">
              <h4 className="text-sm font-bold text-[#292929] mb-2">Does the AI Resume Agent invent experience or metrics?</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed">
                No. HireSense AI strictly adheres to zero-fabrication safety principles. It improves clarity, formatting, and keyword placement based only on what you confirm.
              </p>
            </div>
            <div className="p-7 rounded-3xl bg-[#FAF8F5] border border-[#E2DDD5]">
              <h4 className="text-sm font-bold text-[#292929] mb-2">How does the Placement Readiness Score (PRS) work?</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed">
                The PRS is an explainable weighted benchmark (0-100) calibrated across coding ability, technical concepts, aptitude, resume ATS fit, mock interview performance, and communication.
              </p>
            </div>
            <div className="p-7 rounded-3xl bg-[#FAF8F5] border border-[#E2DDD5]">
              <h4 className="text-sm font-bold text-[#292929] mb-2">Can I create multiple versions of my resume?</h4>
              <p className="text-xs text-[#5C5850] leading-relaxed">
                Yes. You can maintain a protected Master Resume alongside tailored versions for specific roles (e.g. Java Backend, React Frontend, or Data Analyst).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#E2DDD5] bg-[#EFE9DE]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tight text-[#292929]">
              HireSense<span className="font-serif text-[#E78260] font-bold">*</span>
            </span>
            <span className="text-xs text-[#8E8A82]">© 2026. Enterprise Placement Intelligence.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#5C5850]">
            <Link to="/jobs" className="hover:text-[#E78260] transition-colors">Jobs</Link>
            <Link to="/resume/builder" className="hover:text-[#E78260] transition-colors">Resume Builder</Link>
            <Link to="/coding" className="hover:text-[#E78260] transition-colors">Coding</Link>
            <Link to="/company-prep" className="hover:text-[#E78260] transition-colors">Company Guides</Link>
            <Link to="/login" className="hover:text-[#E78260] transition-colors">Student Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;