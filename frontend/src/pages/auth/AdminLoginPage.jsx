import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, Sparkles, ArrowLeft, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

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
      await login('admin@hiresense.ai', 'Admin@HireSense2026');
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Failed to login with default admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-rose-500 selection:text-white">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[45rem] h-[45rem] bg-rose-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* High-tech Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-slate-900/85 border border-slate-800/90 rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">
          {/* Top Glowing Edge (Amber/Rose for Admin Authority) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500" />

          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Candidate Login
            </Link>
            
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-rose-500/25 mb-3">
              <Shield className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white">
              Placement Officer &amp; Admin Portal
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Institutional cohort analytics, skill gap heatmaps &amp; CSV exports
            </p>
          </div>

          {/* 1-Click Admin Demo */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleQuickAdminDemo}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-between bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-indigo-500/15 hover:from-rose-500/25 hover:to-indigo-500/25 border border-rose-500/30 hover:border-rose-400 text-white shadow-md shadow-rose-500/10"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs">1-Click Institutional Admin Demo</span>
              </div>
              <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded text-rose-300 font-bold">
                Auto-fill &rarr;
              </span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@hiresense.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700/80 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700/80 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl font-semibold text-xs transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 hover:shadow-rose-600/40 disabled:opacity-50 mt-1"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-500 mt-5 flex items-center justify-center gap-1.5 border-t border-slate-800 pt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Restricted Access: Institutional Placement Cell Only</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
