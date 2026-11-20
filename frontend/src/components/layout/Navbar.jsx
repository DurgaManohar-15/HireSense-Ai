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
    <header className="flex-shrink-0 z-40 h-[68px] bg-[#F3EFE6]/90 backdrop-blur-[18px] border-b border-[#E2DDD5] px-5 sm:px-8 flex items-center justify-between transition-colors shadow-sm">
      {/* Left: Premium HireSense Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-1.5 group">
          <span className="font-black text-xl tracking-tight text-[#292929]">
            HireSense
          </span>
          <span className="text-xl font-serif text-[#E78260] font-bold group-hover:rotate-45 transition-transform duration-300">
            *
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#FBEDE8] text-[#E78260] border border-[#E78260]/30 ml-1">
            AI
          </span>
        </Link>
      </div>

      {/* Center: Floating Pill Navigation */}
      <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white border border-[#E2DDD5] shadow-xs">
        <Link
          to="/jobs"
          className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
            isJobsActive
              ? 'bg-[#292929] text-white font-semibold shadow-xs'
              : 'text-[#5C5850] hover:text-[#292929] hover:bg-[#FAF8F5]'
          }`}
        >
          <Briefcase className={`w-3.5 h-3.5 ${isJobsActive ? 'text-[#E78260]' : 'text-[#8E8A82]'}`} />
          <span>Jobs</span>
        </Link>

        <Link
          to="/resume/builder"
          className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
            isResumeActive
              ? 'bg-[#292929] text-white font-semibold shadow-xs'
              : 'text-[#5C5850] hover:text-[#292929] hover:bg-[#FAF8F5]'
          }`}
        >
          <FileText className={`w-3.5 h-3.5 ${isResumeActive ? 'text-[#E78260]' : 'text-[#8E8A82]'}`} />
          <span>Resume</span>
        </Link>

        <Link
          to="/coding"
          className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
            isPracticeActive
              ? 'bg-[#292929] text-white font-semibold shadow-xs'
              : 'text-[#5C5850] hover:text-[#292929] hover:bg-[#FAF8F5]'
          }`}
        >
          <Code2 className={`w-3.5 h-3.5 ${isPracticeActive ? 'text-[#E78260]' : 'text-[#8E8A82]'}`} />
          <span>Practice</span>
        </Link>

        <Link
          to="/onboarding"
          className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
            isSetupActive
              ? 'bg-[#292929] text-white font-semibold shadow-xs'
              : 'text-[#5C5850] hover:text-[#292929] hover:bg-[#FAF8F5]'
          }`}
        >
          <Compass className={`w-3.5 h-3.5 ${isSetupActive ? 'text-[#E78260]' : 'text-[#8E8A82]'}`} />
          <span>Setup</span>
        </Link>
      </nav>

      {/* Right: Search, Notifications & Profile Pill */}
      <div className="flex items-center gap-3">
        {/* Command Search Bar (320px) */}
        <div
          onClick={() => navigate('/jobs')}
          className="hidden xl:flex items-center justify-between w-[320px] px-3.5 py-2 rounded-full bg-white border border-[#E2DDD5] text-xs text-[#8E8A82] hover:border-[#E78260]/40 hover:text-[#292929] transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#8E8A82]" />
            <span className="font-normal truncate">Search jobs, skills, or anything...</span>
          </div>
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E2DDD5] text-[#5C5850]">
            Ctrl K
          </kbd>
        </div>

        {/* Campus Announcements */}
        <Link
          to={isAdmin ? '/admin/announcements' : '/announcements'}
          title="Campus Announcements"
          className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#5C5850] hover:text-[#E78260] hover:bg-white transition-all"
        >
          <Megaphone className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E78260] shadow-[0_0_8px_#E78260] animate-pulse" />
          )}
        </Link>

        {/* Notifications */}
        <Link
          to="/notifications"
          title="Notifications"
          className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#5C5850] hover:text-[#292929] hover:bg-white transition-all"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E78260] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          title="Settings"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C5850] hover:text-[#292929] hover:bg-white transition-all"
        >
          <Settings className="w-4 h-4" />
        </Link>

        <div className="w-[1px] h-4 bg-[#E2DDD5] mx-0.5"></div>

        {/* Premium Profile Pill */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-[#E2DDD5] hover:border-[#E78260]/40 transition-all group shadow-xs"
          title="Candidate Profile"
        >
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={displayName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#E78260]/30"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#FBEDE8] border border-[#E78260]/30 text-[#E78260] flex items-center justify-center text-[10px] font-bold shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#292929] group-hover:text-[#E78260] leading-tight max-w-[110px] truncate transition-colors">
              {displayName}
            </span>
            <span className="text-[10px] text-[#8E8A82] leading-none">
              {userRole}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-[#8E8A82] group-hover:text-[#292929] transition-colors ml-0.5" />
        </Link>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E8A82] hover:text-[#E74C3C] hover:bg-white transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
