import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  BrainCircuit,
  Compass,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Award,
  Activity,
  Users,
  Megaphone,
  Bell,
  Briefcase,
  Bookmark,
  Send,
  Code2,
  Calculator,
  Building2,
  FolderArchive,
  Settings,
  Target,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const { isAdmin, user } = useAuth();

  const sections = [
    {
      title: 'READINESS & PROFILE',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/profile', label: 'Student Profile', icon: UserCheck },
        { to: '/readiness', label: 'Placement Readiness', icon: Award },
        { to: '/skill-gaps', label: 'Skill Gap', icon: Layers },
        { to: '/roadmap', label: 'Preparation Roadmap', icon: Compass },
        { to: '/career-assistant', label: 'Career Guidance', icon: Target },
      ]
    },
    {
      title: 'RESUME & APPLICATIONS',
      items: [
        { to: '/resume/builder', label: 'Resume Builder', icon: FileText },
        { to: '/resume/tailor', label: 'Resume Tailoring', icon: Target },
        { to: '/resume', label: 'Resume ATS Review', icon: ShieldCheck },
        { to: '/cover-letters', label: 'Cover Letters', icon: Send },
        { to: '/applications', label: 'Job Applications', icon: Briefcase },
      ]
    },
    {
      title: 'JOBS',
      items: [
        { to: '/jobs', label: 'Job Search & Matches', icon: Briefcase },
        { to: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
      ]
    },
    {
      title: 'PRACTICE & PREPARATION',
      items: [
        { to: '/coding', label: 'Coding Practice', icon: Code2 },
        { to: '/aptitude', label: 'Aptitude Practice', icon: Calculator },
        { to: '/company-prep', label: 'Company Prep', icon: Building2 },
        { to: '/interview', label: 'Mock Interview', icon: Users },
        { to: '/assessments', label: 'Assessments', icon: BrainCircuit },
      ]
    },
    {
      title: 'WORKSPACE',
      items: [
        { to: '/announcements', label: 'Campus Circulars', icon: Megaphone },
        { to: '/documents', label: 'Documents', icon: FolderArchive },
        { to: '/notifications', label: 'Notifications', icon: Bell },
        { to: '/settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'Cohort Analytics', icon: ShieldCheck },
    { to: '/admin/students', label: 'Student Registry', icon: Users },
    { to: '/admin/announcements', label: 'Broadcasts', icon: Megaphone },
    { to: '/admin/research', label: 'Research Data', icon: Activity },
    { to: '/admin/questions', label: 'Question Bank', icon: BrainCircuit },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <aside className="w-[280px] flex-shrink-0 bg-[#070A0D] text-[#A9B0BA] h-full flex flex-col py-4 px-3.5 border-r border-white/[0.08] overflow-y-auto overscroll-none select-none">
      {/* Career Copilot Identity Block */}
      <div className="px-3.5 py-3 mb-4 rounded-xl bg-gradient-to-b from-[#11171D] to-[#0D1217] border border-[#252C34] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#35D07F] shadow-[0_0_8px_#35D07F]" />
            <span className="text-xs font-bold text-[#F7F7F5] tracking-tight">
              {isAdmin ? 'Institutional Admin' : 'Career Copilot'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#E8C982] bg-[#E8C982]/10 px-1.5 py-0.5 rounded border border-[#E8C982]/25">
            v1.0.0
          </span>
        </div>
        <p className="text-[11px] text-[#68717D] mt-1.5 leading-snug">
          Your AI Partner in Career Success
        </p>
      </div>

      {/* Navigation Sections */}
      <div className="space-y-6 flex-1">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="text-[10px] font-semibold text-[#68717D] tracking-wider uppercase px-3 py-1">
              {sec.title}
            </div>
            <nav className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/resume' || item.to === '/jobs' || item.to === '/interview' || item.to === '/coding' || item.to === '/dashboard' || item.to === '/'}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-[#E8C982]/[0.14] border border-[#E8C982]/[0.18] text-white shadow-xs font-semibold'
                          : 'text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-white/[0.04] border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Champagne Gold Vertical Active Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#E8C982] rounded-r-full shadow-[0_0_8px_rgba(232,201,130,0.7)]" />
                        )}
                        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[#E8C982]' : 'text-[#68717D] group-hover:text-[#A9B0BA]'}`} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}

        {isAdmin && (
          <div className="pt-3 border-t border-white/[0.08] space-y-1">
            <div className="text-[10px] font-semibold text-[#68717D] tracking-wider uppercase px-3 py-1">
              ADMINISTRATION
            </div>
            <nav className="space-y-0.5">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-[#E8C982]/[0.14] border border-[#E8C982]/[0.18] text-white shadow-xs font-semibold'
                          : 'text-[#A9B0BA] hover:text-[#F7F7F5] hover:bg-white/[0.04] border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#E8C982] rounded-r-full shadow-[0_0_8px_rgba(232,201,130,0.7)]" />
                        )}
                        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[#E8C982]' : 'text-[#68717D] group-hover:text-[#A9B0BA]'}`} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer Minimal Indicator */}
      <div className="pt-3 border-t border-[#252B33] text-xs px-3 text-[#6F7783]">
        <div className="flex items-center gap-2 text-[#A7AFBB] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#E7C98A]" />
          <span>HireSense Engine</span>
        </div>
        <p className="mt-0.5 text-[10px] text-[#6F7783]">AI Career Intelligence System</p>
      </div>
    </aside>
  );
};

export default Sidebar;
