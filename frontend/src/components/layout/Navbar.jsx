import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  User as UserIcon,
  Code2,
  Briefcase,
  FileText,
  Settings,
  Compass,
  Bell,
  Megaphone,
  Search,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { platformApi } from '../../api/platformApi';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await platformApi.getUnreadNotificationsCount();
        if (res && res.data !== undefined) {
          setUnreadCount(typeof res.data === 'number' ? res.data : (res.data.count || 0));
        }
      } catch (err) {
        // Silently ignore if not logged in
      }
    };
    if (user) {
      fetchUnread();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = [
    user?.firstName,
    user?.lastName && user.lastName !== 'Student' && user.lastName !== user.firstName ? user.lastName : ''
  ].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'User';

  const userRole = isAdmin ? 'Institutional Admin' : 'Career Candidate';

  // Navigation active states
  const pathname = location.pathname;
  const isJobsActive = pathname.startsWith('/jobs') || pathname.startsWith('/saved-jobs');
  const isResumeActive = pathname.startsWith('/resume') || pathname.startsWith('/cover-letters');
  const isPracticeActive = pathname.startsWith('/coding') || pathname.startsWith('/aptitude') || pathname.startsWith('/company-prep') || pathname.startsWith('/interview') || pathname.startsWith('/assessments');
  const isSetupActive = pathname.startsWith('/onboarding') || pathname.startsWith('/settings');

  return (
    <header className="flex-shrink-0 z-40 h-[68px] bg-[#05070A]/88 backdrop-blur-[18px] border-b border-white/[0.08] px-5 sm:px-8 flex items-center justify-between transition-colors shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      {/* Left: Premium HireSense Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#151B22] to-[#0A0D11] border border-[#E8C982]/30 flex items-center justify-center shadow-[0_0_16px_rgba(232,201,130,0.12)] transition-all duration-300 group-hover:border-[#E8C982]/60 group-hover:shadow-[0_0_24px_rgba(232,201,130,0.25)]">
            <span className="font-black text-sm tracking-tight text-[#E8C982]">H</span>
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#E8C982] shadow-[0_0_6px_#E8C982]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-[#F7F7F5] group-hover:text-white transition-colors">
              HireSense
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[#B18D4F]/20 text-[#E8C982] border border-[#E8C982]/30">
              AI
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Floating Pill Navigation */}
      <nav className="hidden md:flex items-center gap-1 p-1 rounded-[22px] bg-[#14191F]/85 border border-[#252C34] backdrop-blur-[14px] shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <Link
          to="/jobs"
          className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
            isJobsActive
              ? 'bg-[#1F2731] text-[#F7F7F5] font-semibold shadow-xs'
              : 'text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-white/[0.05]'
          }`}
        >
          <Briefcase className={`w-3.5 h-3.5 ${isJobsActive ? 'text-[#E8C982]' : 'text-[#68717D]'}`} />
          <span>Jobs</span>
        </Link>

        <Link
          to="/resume/builder"
          className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
            isResumeActive
              ? 'bg-[#1F2731] text-[#F7F7F5] font-semibold shadow-xs'
              : 'text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-white/[0.05]'
          }`}
        >
          <FileText className={`w-3.5 h-3.5 ${isResumeActive ? 'text-[#E8C982]' : 'text-[#68717D]'}`} />
          <span>Resume</span>
        </Link>

        <Link
          to="/coding"
          className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
            isPracticeActive
              ? 'bg-[#1F2731] text-[#F7F7F5] font-semibold shadow-xs'
              : 'text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-white/[0.05]'
          }`}
        >
          <Code2 className={`w-3.5 h-3.5 ${isPracticeActive ? 'text-[#E8C982]' : 'text-[#68717D]'}`} />
          <span>Practice</span>
        </Link>

        <Link
          to="/onboarding"
          className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
            isSetupActive
              ? 'bg-[#1F2731] text-[#F7F7F5] font-semibold shadow-xs'
              : 'text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-white/[0.05]'
          }`}
        >
          <Compass className={`w-3.5 h-3.5 ${isSetupActive ? 'text-[#E8C982]' : 'text-[#68717D]'}`} />
          <span>Setup</span>
        </Link>
      </nav>

      {/* Right: Search, Notifications & Profile Pill */}
      <div className="flex items-center gap-3">
        {/* Command Search Bar (320px) */}
        <div
          onClick={() => navigate('/jobs')}
          className="hidden xl:flex items-center justify-between w-[320px] px-3.5 py-2 rounded-[12px] bg-[#11171D] border border-[#252C34] text-xs text-[#68717D] hover:border-[#E8C982]/40 hover:text-[#A9B0BA] transition-all cursor-pointer shadow-xs backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#68717D]" />
            <span className="font-normal truncate">Search jobs, skills, or anything...</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151B22] border border-[#252C34] text-[#A9B0BA] shadow-xs">
            Ctrl K
          </kbd>
        </div>

        {/* Campus Announcements */}
        <Link
          to={isAdmin ? '/admin/announcements' : '/announcements'}
          title="Campus Announcements"
          className="relative w-8 h-8 rounded-xl flex items-center justify-center text-[#A9B0BA] hover:text-[#E8C982] hover:bg-white/[0.04] transition-all"
        >
          <Megaphone className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E8C982] shadow-[0_0_8px_#E8C982] animate-pulse" />
          )}
        </Link>

        {/* Notifications */}
        <Link
          to="/notifications"
          title="Notifications"
          className="relative w-8 h-8 rounded-xl flex items-center justify-center text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-white/[0.04] transition-all"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E8C982] text-[#05070A] text-[9px] font-extrabold flex items-center justify-center shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          title="Settings"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-white/[0.04] transition-all"
        >
          <Settings className="w-4 h-4" />
        </Link>

        <div className="w-[1px] h-4 bg-white/[0.08] mx-0.5"></div>

        {/* Premium Profile Pill */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-[14px] bg-[#10161C] border border-[#252C34] hover:border-[#E8C982]/35 transition-all group shadow-xs"
          title="Candidate Profile"
        >
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={displayName}
              className="w-6 h-6 rounded-lg object-cover ring-1 ring-[#E8C982]/30"
            />
          ) : (
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#181E25] to-[#10161C] border border-[#E8C982]/30 text-[#E8C982] flex items-center justify-center text-[10px] font-bold shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#F7F7F5] group-hover:text-white leading-tight max-w-[110px] truncate">
              {displayName}
            </span>
            <span className="text-[10px] text-[#68717D] leading-none">
              {userRole}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-[#68717D] group-hover:text-[#A9B0BA] transition-colors ml-0.5" />
        </Link>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#68717D] hover:text-[#FF5A5F] hover:bg-white/[0.04] transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
