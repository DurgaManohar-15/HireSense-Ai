import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        password: formData.password
      });
      toast.success('Registration successful! Welcome to HireSense.');
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#292929] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-[#E78260]/20 selection:text-[#E78260]">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[45rem] h-[45rem] bg-[#E78260]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-[#292929]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 py-6">
        
        {/* Left Column: Why Join HireSense */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E2DDD5] text-[#292929] text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#E78260]" />
            <span>Join 10,000+ Pre-Placement Candidates</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-[#292929]">
              Activate Your AI <br />
              <span className="font-serif italic font-normal text-[#E78260]">
                Career Operating System.
              </span>
            </h1>
            <p className="text-[#5C5850] text-sm sm:text-base leading-relaxed max-w-lg">
              Set up your profile in 60 seconds to unlock automated skill gap detection, 
              ATS resume scorecards, and live mock interview feedback.
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-3 pt-2">
            {[
              { title: 'Personalized Placement Readiness Score (PRS)', desc: 'Know exactly where you stand against target tier-1 benchmarks.' },
              { title: 'Turn-by-Turn AI Mock Interviews', desc: 'Real-time speech & text evaluation with Gemini LLM feedback.' },
              { title: 'Instant Resume Diagnostic', desc: 'Bullet point impact scoring and missing keywords identification.' },
              { title: 'Custom Daily Roadmaps', desc: 'Adaptive pacing that recalibrates as you complete assessments.' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm">
                <div className="w-6 h-6 rounded-full bg-[#FBEDE8] text-[#E78260] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E78260]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#292929]">{item.title}</h4>
                  <p className="text-[11px] text-[#5C5850] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Registration Card */}
        <div className="lg:col-span-6 w-full">
          <div className="bg-white border border-[#E2DDD5] rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-black/[0.04] relative overflow-hidden">
            
            {/* Header */}
            <div className="text-center mb-6">
              <Link to="/" className="inline-flex items-center justify-center gap-1 mb-2 group">
                <span className="text-2xl font-black tracking-tight text-[#292929]">HireSense</span>
                <span className="text-2xl font-serif text-[#E78260] font-bold group-hover:rotate-45 transition-transform duration-300">*</span>
              </Link>
              <h2 className="text-lg font-bold text-[#292929] mt-1">
                Create Candidate Account
              </h2>
              <p className="text-[#5C5850] text-xs">
                Free for students preparing for campus drives
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#FBEDE8] border border-[#E78260]/30 rounded-2xl flex items-start gap-2.5 text-[#D46845] text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#E78260]" />
                <div className="flex-1">
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5850] uppercase tracking-wider mb-1.5">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8E8A82] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Alex"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E2DDD5] text-[#292929] rounded-2xl pl-9 pr-3 py-2.5 text-xs placeholder-[#A8A39B] focus:outline-none focus:border-[#E78260] focus:ring-2 focus:ring-[#E78260]/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5850] uppercase tracking-wider mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sharma"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E2DDD5] text-[#292929] rounded-2xl px-3 py-2.5 text-xs placeholder-[#A8A39B] focus:outline-none focus:border-[#E78260] focus:ring-2 focus:ring-[#E78260]/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5C5850] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8A82] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E2DDD5] text-[#292929] rounded-2xl pl-10 pr-3 py-2.5 text-xs placeholder-[#A8A39B] focus:outline-none focus:border-[#E78260] focus:ring-2 focus:ring-[#E78260]/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5C5850] uppercase tracking-wider mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8E8A82] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E2DDD5] text-[#292929] rounded-2xl pl-10 pr-3 py-2.5 text-xs placeholder-[#A8A39B] focus:outline-none focus:border-[#E78260] focus:ring-2 focus:ring-[#E78260]/20 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5850] uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E8A82] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E2DDD5] text-[#292929] rounded-2xl pl-9 pr-3 py-2.5 text-xs placeholder-[#A8A39B] focus:outline-none focus:border-[#E78260] focus:ring-2 focus:ring-[#E78260]/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#5C5850] uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E2DDD5] text-[#292929] rounded-2xl px-3 py-2.5 text-xs placeholder-[#A8A39B] focus:outline-none focus:border-[#E78260] focus:ring-2 focus:ring-[#E78260]/20 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#E78260] hover:bg-[#d46845] text-white rounded-full font-semibold text-xs transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#E78260]/25 disabled:opacity-50 mt-2 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Free Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-[#5C5850] pt-3 border-t border-[#E2DDD5]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#E78260] hover:text-[#d46845] font-semibold underline underline-offset-2">
                Sign In here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;