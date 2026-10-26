import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, AlertCircle, ShieldCheck, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
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

  const handleGoogleOAuthRedirect = () => {
    const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    window.location.href = `${backendBaseUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] px-4 py-12 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Subtle Monochrome Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#101010] border border-[#222222] rounded-3xl p-8 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]">
          
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center justify-center gap-2 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-black font-extrabold text-base shadow-sm">
                H
              </div>
            </Link>
            
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create Candidate Account
            </h1>
            <p className="text-[#71717A] text-xs mt-1 font-medium">
              Start your automated placement readiness journey today
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-[#141414] border border-[#EF4444]/30 rounded-xl flex items-start gap-2.5 text-[#EF4444] text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5 mb-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  First Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Alex"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#0B0B0B] border border-[#252525] text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#666666] focus:ring-2 focus:ring-white/[0.06] transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sharma"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-[#0B0B0B] border border-[#252525] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#666666] focus:ring-2 focus:ring-white/[0.06] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                College / Work Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="alex.sharma@vit.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0B0B0B] border border-[#252525] text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#666666] focus:ring-2 focus:ring-white/[0.06] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full bg-[#0B0B0B] border border-[#252525] text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#666666] focus:ring-2 focus:ring-white/[0.06] transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[#0B0B0B] border border-[#252525] text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#666666] focus:ring-2 focus:ring-white/[0.06] transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Confirm *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-[#0B0B0B] border border-[#252525] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#666666] focus:ring-2 focus:ring-white/[0.06] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-white hover:bg-[#E5E5E5] text-black font-semibold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 transform hover:-translate-y-0.5"
            >
              {loading ? 'Creating Profile...' : 'Complete Registration'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#222222]"></div>
            <span className="flex-shrink mx-3 text-[#52525B] text-[11px] uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-[#222222]"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleOAuthRedirect}
            className="w-full mt-2 py-2.5 px-4 bg-[#141414] hover:bg-[#1A1A1A] border border-[#292929] hover:border-[#3A3A3A] text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2.5 transition"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#FFFFFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#CCCCCC" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#999999" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#E5E5E5" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="text-center text-xs text-[#71717A] mt-4">
            Already have an account? <Link to="/login" className="text-white hover:underline font-medium">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
