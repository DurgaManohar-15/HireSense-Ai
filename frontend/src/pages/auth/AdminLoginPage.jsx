import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

export const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter administrator email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await login(email.trim().toLowerCase(), password);
      if (user.roles?.includes('ROLE_ADMIN')) {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. This account does not possess institutional administrator privileges.');
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminDemo = async () => {
    setEmail('admin@hiresense.ai');
    setPassword('Admin@HireSense2026');
    setError('');
    setLoading(true);
    try {
      const user = await login('admin@hiresense.ai', 'Admin@HireSense2026');
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Failed to login with default admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] px-4 py-12 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Subtle Monochrome Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#101010] border border-[#222222] rounded-3xl p-8 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]">
          
          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white text-black font-extrabold mb-4 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Placement Officer Portal
            </h1>
            <p className="text-[#71717A] text-xs mt-1 font-medium">
              Institutional Administration &amp; Cohort Analytics
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

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@hiresense.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#252525] text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#666666] focus:ring-2 focus:ring-white/[0.06] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#252525] text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#666666] focus:ring-2 focus:ring-white/[0.06] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white hover:bg-[#E5E5E5] text-black font-semibold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 transform hover:-translate-y-0.5"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="mt-5 pt-5 border-t border-[#222222] text-center">
            <button
              type="button"
              onClick={handleQuickAdminDemo}
              disabled={loading}
              className="text-xs text-[#A1A1AA] hover:text-white font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Click to auto-fill default admin credentials</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-xs text-[#71717A] hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Candidate Sign-In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
