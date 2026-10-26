import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, AlertCircle, ShieldCheck, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Check URL query error parameter (e.g. redirected back from Google OAuth error)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCandidateLogin = async () => {
    const demoEmail = 'candidate.demo@hiresense.ai';
    const demoPassword = 'Password123!';
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      // First try to login
      await login(demoEmail, demoPassword);
      toast.success('Logged in as Demo Candidate!');
      navigate('/dashboard');
    } catch (loginErr) {
      // If candidate account does not exist yet, auto-register it
      try {
        await register({
          firstName: 'Alex',
          lastName: 'Sharma',
          email: demoEmail,
          password: demoPassword,
          phoneNumber: '+91 9876543210'
        });
        toast.success('Demo Candidate workspace activated!');
        navigate('/dashboard');
      } catch (regErr) {
        setError('Failed to initiate demo candidate session.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth 2.0 Authorization Code Flow Entrypoint
  const handleGoogleOAuthRedirect = () => {
    setError('');
    setRedirecting(true);
    const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    window.location.href = `${backendBaseUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] px-4 py-12 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Subtle Monochrome Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Main Monochrome Card */}
        <div className="bg-[#101010] border border-[#222222] rounded-3xl p-8 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]">
          
          {/* Header & Minimal Logo */}
          <div className="text-center mb-7">
            <Link to="/" className="inline-flex items-center justify-center gap-2 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-black font-extrabold text-base shadow-sm">
                H
              </div>
            </Link>
            
            <h1 className="text-2xl font-bold tracking-tight text-white">
              HireSense
            </h1>
            <p className="text-[#71717A] text-xs mt-1 font-medium">
              Student Placement Readiness &amp; Career Operating System
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

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-5">
            <div>
              <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#252525] text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#666666] focus:ring-2 focus:ring-white/[0.06] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#252525] text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#666666] focus:ring-2 focus:ring-white/[0.06] transition"
                />
              </div>
            </div>

            {/* Primary Button: Pure White on Black */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white hover:bg-[#E5E5E5] text-black rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 transform hover:-translate-y-0.5 shadow-sm"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick 1-Click Candidate Demo Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleDemoCandidateLogin}
              disabled={loading}
              className="w-full py-2 bg-[#161616] hover:bg-[#202020] text-white rounded-xl font-medium text-xs border border-[#292929] hover:border-[#3A3A3A] transition flex items-center justify-center gap-2 shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#A1A1AA]" />
              <span>1-Click Demo Candidate Login</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#222222]"></div>
            <span className="flex-shrink mx-3 text-[#52525B] text-[11px] uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-[#222222]"></div>
          </div>

          {/* Google OAuth Button */}
          <div className="mt-2 space-y-3">
            <button
              type="button"
              id="google-oauth-btn"
              onClick={handleGoogleOAuthRedirect}
              disabled={redirecting}
              className="w-full py-2.5 px-4 bg-[#141414] hover:bg-[#1A1A1A] border border-[#292929] hover:border-[#3A3A3A] text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2.5 transition disabled:opacity-70"
            >
              {redirecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#FFFFFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#CCCCCC" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#999999" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#E5E5E5" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-[#71717A] pt-2">
              <span>New to HireSense? <Link to="/register" className="text-white hover:underline font-medium">Create account</Link></span>
              <Link to="/admin/login" className="text-[#71717A] hover:text-white transition-colors">Admin Portal &rarr;</Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#52525B] mt-6">
          HireSense AI securely authenticates and links your student academic workspace.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
