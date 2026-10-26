import React, { useState, useEffect } from 'react';
import { 
  Settings, User, Bell, Shield, Sparkles, Download, 
  Trash2, Save, Key, CheckCircle, AlertCircle, Laptop
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form State
  const [profile, setProfile] = useState({
    name: user?.name || 'Candidate',
    email: user?.email || '',
    phone: '+91 9876543210',
    college: 'Vellore Institute of Technology',
    degree: 'B.Tech Computer Science and Engineering',
    gradYear: '2026',
    targetRole: 'Software Development Engineer'
  });

  // AI Preferences
  const [aiSettings, setAiSettings] = useState({
    strictZeroFabrication: true,
    autoSuggestBullets: true,
    matchThreshold: 75,
    agentFeedbackTone: 'Constructive & Rigorous'
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    jobMatches: true,
    deadlineReminders: true,
    interviewReminders: true,
    weeklyReadinessSummary: true
  });

  // Security Form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    toast.success('Profile preferences updated successfully!');
  };

  const handleAiSave = (e) => {
    e.preventDefault();
    toast.success('AI & Tailoring engine preferences saved!');
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('Please complete all password fields');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully!');
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const exportData = () => {
    const data = {
      user: { name: profile.name, email: profile.email },
      profile,
      aiSettings,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HireSense_DataExport_${Date.now()}.json`;
    a.click();
    toast.success('Career data package exported');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account & Platform Settings</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage your personal profile, AI tailoring parameters, notifications, and security credentials.
          </p>
        </div>
      </div>

      {/* Main Settings Tabs & Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-3 space-y-1">
          {[
            { id: 'profile', label: 'Candidate Profile', icon: User },
            { id: 'ai', label: 'AI Agent & Tailoring', icon: Sparkles },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security & Auth', icon: Shield },
            { id: 'data', label: 'Data & Privacy', icon: Download }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Form Content Area */}
        <div className="md:col-span-9">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Tab: Profile */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Candidate Profile</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 dark:border-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Target Role</label>
                    <input
                      type="text"
                      value={profile.targetRole}
                      onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">University / College</label>
                    <input
                      type="text"
                      value={profile.college}
                      onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Degree Program</label>
                    <input
                      type="text"
                      value={profile.degree}
                      onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t dark:border-gray-700 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Tab: AI Preferences */}
            {activeTab === 'ai' && (
              <form onSubmit={handleAiSave} className="space-y-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">AI Agent & Tailoring Rules</h3>
                
                <div className="space-y-4 text-xs">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSettings.strictZeroFabrication}
                      onChange={(e) => setAiSettings({ ...aiSettings, strictZeroFabrication: e.target.checked })}
                      className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Strict Zero-Fabrication Guarantee
                      </span>
                      <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                        Never permit the AI Resume Agent or Tailoring Engine to invent unverified companies, metrics, or credentials.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSettings.autoSuggestBullets}
                      onChange={(e) => setAiSettings({ ...aiSettings, autoSuggestBullets: e.target.checked })}
                      className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Proactive Google XYZ Bullet Optimization
                      </span>
                      <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                        Format project and experience points using the "Accomplished [X] as measured by [Y] by doing [Z]" paradigm.
                      </p>
                    </div>
                  </label>

                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Minimum Job Match Threshold: {aiSettings.matchThreshold}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="5"
                      value={aiSettings.matchThreshold}
                      onChange={(e) => setAiSettings({ ...aiSettings, matchThreshold: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                    <span className="text-[11px] text-gray-400">
                      Opportunities below this score will be flagged with a detailed skill gap alert.
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t dark:border-gray-700 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Save AI Preferences
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Notification Preferences</h3>
                
                {[
                  { key: 'jobMatches', title: 'New Job Matches', desc: 'Alert when a role with >80% match is published' },
                  { key: 'deadlineReminders', title: 'Application Deadlines', desc: 'Reminders 48h before recruitment round closure' },
                  { key: 'interviewReminders', title: 'Mock Interview Prep Tips', desc: 'Personalized practice suggestions before scheduled sessions' },
                  { key: 'weeklyReadinessSummary', title: 'Weekly Placement Readiness Digest', desc: 'Summary of skills mastered and upcoming drive requirements' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</h4>
                      <p className="text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={(e) => {
                        setNotifications({ ...notifications, [item.key]: e.target.checked });
                        toast.success('Notification settings updated');
                      }}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Security */}
            {activeTab === 'security' && (
              <form onSubmit={handleSecuritySave} className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Security & Credentials</h3>
                
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t dark:border-gray-700 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Key className="w-3.5 h-3.5" /> Update Password
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Data & Privacy */}
            {activeTab === 'data' && (
              <div className="space-y-5 text-xs">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Data & Privacy Control</h3>
                
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 space-y-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Export All Profile & Career Data</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Download a complete JSON package of your resume versions, test performances, and applications.
                  </p>
                  <button
                    onClick={exportData}
                    className="mt-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Data Archive
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                  <h4 className="font-semibold text-rose-700 dark:text-rose-400">Clear Session Cache</h4>
                  <p className="text-rose-600/80 dark:text-rose-400/80">
                    Reset cached interview audio transcripts and temporary resume preview drafts.
                  </p>
                  <button
                    onClick={() => {
                      sessionStorage.clear();
                      toast.success('Local cache cleared successfully');
                    }}
                    className="mt-2 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Reset Cache
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
