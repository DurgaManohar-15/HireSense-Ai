import React from 'react';
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
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] selection:bg-white selection:text-black font-sans">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/85 border-b border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-extrabold text-sm shadow-sm">
              H
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">HireSense</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#A1A1AA]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#ecosystem" className="hover:text-white transition-colors">Career Suite</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Methodology</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link to="/jobs" className="hover:text-white transition-colors">Explore Jobs</Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-[#E5E5E5] transition-all flex items-center gap-2 shadow-sm"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-[#151515] transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-[#E5E5E5] shadow-sm transition-all flex items-center gap-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-28 overflow-hidden">
        {/* Subtle Monochrome Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#292929] text-[#A1A1AA] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Next-Gen Placement &amp; Career Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Your Placement Readiness <br />
            <span className="text-[#A1A1AA]">Engineered with AI.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            Build ATS-compliant resumes, calibrate diagnostic readiness scores, practice coding challenges, and track every campus application in one unified workspace.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl text-xs font-semibold bg-white text-black hover:bg-[#E5E5E5] transition-all flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5"
            >
              Get Started Free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/resume/builder"
              className="px-6 py-3 rounded-xl text-xs font-medium bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#292929] hover:border-[#3A3A3A] transition-all flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-[#A1A1AA]" /> Build Resume
            </Link>
            <Link
              to="/jobs"
              className="px-6 py-3 rounded-xl text-xs font-medium bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#292929] hover:border-[#3A3A3A] transition-all flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5 text-[#A1A1AA]" /> Explore Jobs
            </Link>
            <Link
              to="/login"
              className="px-5 py-3 rounded-xl text-xs font-medium text-[#71717A] hover:text-white transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Metrics Strip */}
          <div className="mt-16 pt-8 border-t border-[#222222] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">0-100</div>
              <div className="text-xs text-[#71717A] mt-1">Readiness Metric (PRS)</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">20+</div>
              <div className="text-xs text-[#71717A] mt-1">ATS Resume Templates</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-[#71717A] mt-1">Transparent JD Match</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">AI-Driven</div>
              <div className="text-xs text-[#71717A] mt-1">Mock Interview Calibration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Ecosystem Grid */}
      <section id="ecosystem" className="py-20 bg-[#080808] border-y border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-semibold text-[#71717A] uppercase tracking-widest">Unified Suite</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              One Profile. Zero Redundant Tools.
            </h3>
            <p className="text-[#A1A1AA] text-sm sm:text-base leading-relaxed">
              Harmonize your academic accomplishments across diagnostics, tailoring, interviews, coding sandbox, and placement roadmaps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Resume Builder */}
            <div className="p-7 rounded-2xl bg-[#101010] border border-[#222222] hover:border-[#3A3A3A] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#292929] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Resume Builder &amp; Engine</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                Split-screen live editor with 20 ATS-optimized templates, direct PDF/DOCX export, and revision versioning.
              </p>
              <Link to="/resume/builder" className="text-xs font-semibold text-white flex items-center gap-1 hover:underline">
                Open Builder <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Resume Tailoring */}
            <div className="p-7 rounded-2xl bg-[#101010] border border-[#222222] hover:border-[#3A3A3A] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#292929] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Job Tailoring Engine</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                Compare your resume against specific employer JDs with bullet-by-bullet recommendations and instant score uplift.
              </p>
              <Link to="/resume/tailor" className="text-xs font-semibold text-white flex items-center gap-1 hover:underline">
                Tailor Resume <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Job Search */}
            <div className="p-7 rounded-2xl bg-[#101010] border border-[#222222] hover:border-[#3A3A3A] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#292929] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Intelligent Job Matching</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                Discover verified vacancies with match breakdowns across skills, degree, and track requirements.
              </p>
              <Link to="/jobs" className="text-xs font-semibold text-white flex items-center gap-1 hover:underline">
                Search Vacancies <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Application Tracker */}
            <div className="p-7 rounded-2xl bg-[#101010] border border-[#222222] hover:border-[#3A3A3A] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#292929] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Application Kanban Tracker</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                Organize pipeline stages from Applied through OA, Technical Rounds, and final Placement Offer.
              </p>
              <Link to="/applications" className="text-xs font-semibold text-white flex items-center gap-1 hover:underline">
                Open Kanban <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 5: Coding Practice */}
            <div className="p-7 rounded-2xl bg-[#101010] border border-[#222222] hover:border-[#3A3A3A] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#292929] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Coding Sandbox &amp; Practice</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                Solve DSA algorithms across Arrays, Trees, Graphs, and DP in Java, Python, or C++ with automated test runner.
              </p>
              <Link to="/coding" className="text-xs font-semibold text-white flex items-center gap-1 hover:underline">
                Practice Coding <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 6: Mock Interview */}
            <div className="p-7 rounded-2xl bg-[#101010] border border-[#222222] hover:border-[#3A3A3A] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#292929] text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">AI Mock Interview Room</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                Interactive dialogue evaluating technical precision, reasoning depth, and communication rubrics.
              </p>
              <Link to="/interview" className="text-xs font-semibold text-white flex items-center gap-1 hover:underline">
                Start Interview <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Methodology */}
      <section id="how-it-works" className="py-20 bg-[#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-semibold text-[#71717A] uppercase tracking-widest">Methodology</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Your Direct Path to Placement</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#101010] border border-[#222222]">
              <div className="w-7 h-7 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center mb-4">1</div>
              <h4 className="text-sm font-bold text-white mb-2">Build Profile &amp; Resume</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">Complete onboarding, select target tier, and generate master resume with verified templates.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#101010] border border-[#222222]">
              <div className="w-7 h-7 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center mb-4">2</div>
              <h4 className="text-sm font-bold text-white mb-2">Diagnose &amp; Benchmark</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">Take diagnostic MCQs, calculate ATS match, and pinpoint skill gaps against target jobs.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#101010] border border-[#222222]">
              <div className="w-7 h-7 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center mb-4">3</div>
              <h4 className="text-sm font-bold text-white mb-2">Tailor &amp; Practice</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">Tailor per JD, generate cover letters, solve coding questions, and rehearse AI interviews.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#101010] border border-[#222222]">
              <div className="w-7 h-7 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center mb-4">4</div>
              <h4 className="text-sm font-bold text-white mb-2">Track &amp; Secure Offer</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">Manage applications on Kanban, follow company-specific rounds, and achieve your Day-1 offer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#080808] border-t border-[#222222]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-2">
            <h2 className="text-xs font-semibold text-[#71717A] uppercase tracking-widest">Questions &amp; Answers</h2>
            <h3 className="text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#101010] border border-[#222222]">
              <h4 className="text-sm font-bold text-white mb-2">Does the AI Resume Agent invent experience or metrics?</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                No. HireSense AI strictly adheres to zero-fabrication safety principles. It improves clarity, formatting, and keyword placement based only on what you confirm.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#101010] border border-[#222222]">
              <h4 className="text-sm font-bold text-white mb-2">How does the Placement Readiness Score (PRS) work?</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                The PRS is an explainable weighted benchmark (0-100) calibrated across coding ability, technical concepts, aptitude, resume ATS fit, mock interview performance, and communication.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#101010] border border-[#222222]">
              <h4 className="text-sm font-bold text-white mb-2">Can I create multiple versions of my resume?</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Yes. You can maintain a protected Master Resume alongside tailored versions for specific roles (e.g. Java Backend, React Frontend, or Data Analyst).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#222222] bg-[#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black font-extrabold text-xs">
              H
            </div>
            <span className="text-sm font-bold text-white">HireSense AI</span>
            <span className="text-xs text-[#71717A]">© 2026. Enterprise Placement Intelligence.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#A1A1AA]">
            <Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link>
            <Link to="/resume/builder" className="hover:text-white transition-colors">Resume Builder</Link>
            <Link to="/coding" className="hover:text-white transition-colors">Coding</Link>
            <Link to="/company-prep" className="hover:text-white transition-colors">Company Guides</Link>
            <Link to="/login" className="hover:text-white transition-colors">Student Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
