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
    <aside className="w-[280px] flex-shrink-0 bg-[#FAF8F5] text-[#5C5850] h-full flex flex-col py-4 px-3.5 border-r border-[#E2DDD5] overflow-y-auto overscroll-none select-none">
      {/* Career Copilot Identity Block */}
      <div className="px-3.5 py-3 mb-4 rounded-2xl bg-white border border-[#E2DDD5] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#27AE60] shadow-[0_0_8px_#27AE60]" />
            <span className="text-xs font-bold text-[#292929] tracking-tight">
              {isAdmin ? 'Institutional Admin' : 'Career Copilot'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#E78260] bg-[#FBEDE8] px-1.5 py-0.5 rounded-full border border-[#E78260]/30 font-semibold">
            v1.0.0
          </span>
        </div>
        <p className="text-[11px] text-[#8E8A82] mt-1.5 leading-snug">
          Your AI Partner in Career Success
        </p>
      </div>

      {/* Navigation Sections */}
      <div className="space-y-6 flex-1">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="text-[10px] font-bold text-[#8E8A82] tracking-wider uppercase px-3 py-1">
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
                          ? 'bg-white border border-[#E2DDD5] text-[#292929] shadow-xs font-semibold'
                          : 'text-[#5C5850] hover:text-[#292929] hover:bg-white/70 border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Terracotta Vertical Active Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#E78260] rounded-r-full shadow-[0_0_8px_rgba(231,130,96,0.6)]" />
                        )}
                        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[#E78260]' : 'text-[#8E8A82] group-hover:text-[#292929]'}`} />
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
          <div className="pt-3 border-t border-[#E2DDD5] space-y-1">
            <div className="text-[10px] font-bold text-[#8E8A82] tracking-wider uppercase px-3 py-1">
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
                          ? 'bg-white border border-[#E2DDD5] text-[#292929] shadow-xs font-semibold'
                          : 'text-[#5C5850] hover:text-[#292929] hover:bg-white/70 border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#E78260] rounded-r-full shadow-[0_0_8px_rgba(231,130,96,0.6)]" />
                        )}
                        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[#E78260]' : 'text-[#8E8A82] group-hover:text-[#292929]'}`} />
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
      <div className="pt-3 border-t border-[#E2DDD5] text-xs px-3 text-[#8E8A82]">
        <div className="flex items-center gap-2 text-[#292929] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#E78260]" />
          <span>HireSense Engine</span>
        </div>
        <p className="mt-0.5 text-[10px] text-[#8E8A82]">AI Placement Intelligence System</p>
      </div>
    </aside>
  );
};

export default Sidebar;
