import React, { useState } from 'react';
import { X, Plus, Copy, Trash2, Check, Layers, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const VersionManagerModal = ({
  isOpen,
  onClose,
  versions = [],
  activeVersionId,
  onSelectVersion,
  onCreateVersion,
  onDuplicateVersion,
  onDeleteVersion
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [newRole, setNewRole] = useState("Software Engineer");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!newTitle.trim()) {
      toast.error("Please provide a name for this resume version.");
      return;
    }
    onCreateVersion({
      title: newTitle.trim(),
      targetRole: newRole
    });
    setNewTitle("");
    toast.success(`Created "${newTitle}" version!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Resume Versions Management</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tailor specialized resumes for distinct target engineering positions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Create New Version Bar */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Create New Specialized Version
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="e.g. AI/ML Engineering Resume, Java Backend"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
                <option value="Cloud / DevOps Engineer">Cloud / DevOps</option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Create
              </button>
            </div>
          </div>

          {/* Existing Versions List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Your Saved Versions ({versions.length})
            </h3>
            <div className="space-y-2">
              {versions.map((ver) => {
                const isActive = activeVersionId === ver.id;
                return (
                  <div
                    key={ver.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                      isActive
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-400 dark:border-blue-700 ring-1 ring-blue-500/30'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{ver.title || 'Untitled Version'}</span>
                          {ver.master && (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                              Master Profile
                            </span>
                          )}
                          {isActive && (
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Current
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Role: {ver.targetRole || 'Software Engineer'} • Template: {ver.templateId || 'SWE Resume'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isActive && (
                        <button
                          onClick={() => {
                            onSelectVersion(ver);
                            onClose();
                          }}
                          className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition"
                        >
                          Switch
                        </button>
                      )}
                      <button
                        onClick={() => onDuplicateVersion(ver)}
                        title="Duplicate as new version"
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {versions.length > 1 && !ver.master && (
                        <button
                          onClick={() => onDeleteVersion(ver.id)}
                          title="Delete version"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
