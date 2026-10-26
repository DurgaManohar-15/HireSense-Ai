import React, { useState } from 'react';
import {
  User,
  FileText,
  Briefcase,
  Code,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  Tag
} from 'lucide-react';

export const ResumeFormEditor = ({
  data,
  onChangeData,
  onOpenBulletGenerator
}) => {
  const [activeTab, setActiveTab] = useState('personal');

  const updatePersonal = (field, value) => {
    onChangeData({
      ...data,
      personal: {
        ...(data.personal || {}),
        [field]: value
      }
    });
  };

  const updateSummary = (value) => {
    onChangeData({ ...data, summary: value });
  };

  // Skills helpers
  const handleAddSkill = (category, skill) => {
    if (!skill || !skill.trim()) return;
    const catList = [...(data.skills?.[category] || [])];
    if (!catList.includes(skill.trim())) {
      catList.push(skill.trim());
      onChangeData({
        ...data,
        skills: {
          ...(data.skills || {}),
          [category]: catList
        }
      });
    }
  };

  const handleRemoveSkill = (category, index) => {
    const catList = [...(data.skills?.[category] || [])];
    catList.splice(index, 1);
    onChangeData({
      ...data,
      skills: {
        ...(data.skills || {}),
        [category]: catList
      }
    });
  };

  // Experience helpers
  const addExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      role: 'Software Engineer',
      company: 'Company Name',
      location: 'City, Country',
      startDate: 'Jan 2025',
      endDate: 'Present',
      current: true,
      bullets: ['Developed core platform features using modern web and backend technologies.']
    };
    onChangeData({
      ...data,
      experience: [...(data.experience || []), newExp]
    });
  };

  const updateExperience = (idx, field, value) => {
    const list = [...(data.experience || [])];
    list[idx] = { ...list[idx], [field]: value };
    onChangeData({ ...data, experience: list });
  };

  const removeExperience = (idx) => {
    const list = [...(data.experience || [])];
    list.splice(idx, 1);
    onChangeData({ ...data, experience: list });
  };

  const addExperienceBullet = (expIdx) => {
    const list = [...(data.experience || [])];
    const bullets = [...(list[expIdx].bullets || []), 'Engineered system components adhering to industry standards.'];
    list[expIdx] = { ...list[expIdx], bullets };
    onChangeData({ ...data, experience: list });
  };

  const updateExperienceBullet = (expIdx, bIdx, value) => {
    const list = [...(data.experience || [])];
    const bullets = [...(list[expIdx].bullets || [])];
    bullets[bIdx] = value;
    list[expIdx] = { ...list[expIdx], bullets };
    onChangeData({ ...data, experience: list });
  };

  const removeExperienceBullet = (expIdx, bIdx) => {
    const list = [...(data.experience || [])];
    const bullets = [...(list[expIdx].bullets || [])];
    bullets.splice(bIdx, 1);
    list[expIdx] = { ...list[expIdx], bullets };
    onChangeData({ ...data, experience: list });
  };

  // Projects helpers
  const addProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: 'New Technical Project',
      role: 'Lead Developer',
      technologies: 'React, Node.js, SQL',
      link: '',
      github: '',
      bullets: ['Built full-stack application featuring responsive user interface and REST endpoints.']
    };
    onChangeData({
      ...data,
      projects: [...(data.projects || []), newProj]
    });
  };

  const updateProject = (idx, field, value) => {
    const list = [...(data.projects || [])];
    list[idx] = { ...list[idx], [field]: value };
    onChangeData({ ...data, projects: list });
  };

  const removeProject = (idx) => {
    const list = [...(data.projects || [])];
    list.splice(idx, 1);
    onChangeData({ ...data, projects: list });
  };

  const addProjectBullet = (pIdx) => {
    const list = [...(data.projects || [])];
    const bullets = [...(list[pIdx].bullets || []), 'Implemented responsive UI and clean modular data architecture.'];
    list[pIdx] = { ...list[pIdx], bullets };
    onChangeData({ ...data, projects: list });
  };

  const updateProjectBullet = (pIdx, bIdx, value) => {
    const list = [...(data.projects || [])];
    const bullets = [...(list[pIdx].bullets || [])];
    bullets[bIdx] = value;
    list[pIdx] = { ...list[pIdx], bullets };
    onChangeData({ ...data, projects: list });
  };

  const removeProjectBullet = (pIdx, bIdx) => {
    const list = [...(data.projects || [])];
    const bullets = [...(list[pIdx].bullets || [])];
    bullets.splice(bIdx, 1);
    list[pIdx] = { ...list[pIdx], bullets };
    onChangeData({ ...data, projects: list });
  };

  // Education helpers
  const addEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      institution: 'University Name',
      degree: 'B.Tech in Computer Science',
      field: 'Computer Science',
      startDate: '2022',
      endDate: '2026',
      gpa: '8.5 / 10.0',
      location: 'City, Country',
      coursework: 'DSA, DBMS, OS, Computer Networks'
    };
    onChangeData({
      ...data,
      education: [...(data.education || []), newEdu]
    });
  };

  const updateEducation = (idx, field, value) => {
    const list = [...(data.education || [])];
    list[idx] = { ...list[idx], [field]: value };
    onChangeData({ ...data, education: list });
  };

  const removeEducation = (idx) => {
    const list = [...(data.education || [])];
    list.splice(idx, 1);
    onChangeData({ ...data, education: list });
  };

  // Certifications & Achievements helpers
  const addCertification = () => {
    const list = [...(data.certifications || [])];
    list.push({ id: `cert-${Date.now()}`, name: 'New Certification', issuer: 'Issuer Org', date: '2025' });
    onChangeData({ ...data, certifications: list });
  };

  const updateCertification = (idx, field, value) => {
    const list = [...(data.certifications || [])];
    list[idx] = { ...list[idx], [field]: value };
    onChangeData({ ...data, certifications: list });
  };

  const removeCertification = (idx) => {
    const list = [...(data.certifications || [])];
    list.splice(idx, 1);
    onChangeData({ ...data, certifications: list });
  };

  const addAchievement = () => {
    const list = [...(data.achievements || [])];
    list.push({ id: `ach-${Date.now()}`, title: 'Hackathon Finalist', description: 'Awarded top recognition for technical prototype.' });
    onChangeData({ ...data, achievements: list });
  };

  const updateAchievement = (idx, field, value) => {
    const list = [...(data.achievements || [])];
    list[idx] = { ...list[idx], [field]: value };
    onChangeData({ ...data, achievements: list });
  };

  const removeAchievement = (idx) => {
    const list = [...(data.achievements || [])];
    list.splice(idx, 1);
    onChangeData({ ...data, achievements: list });
  };

  const navItems = [
    { id: 'personal', label: 'Contact', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Tag },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'credentials', label: 'Honors', icon: Award }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-xs text-slate-200">
      {/* Modern Segmented Pill Tab Bar (No white stripes & No ugly scrollbars) */}
      <div className="p-3 pb-2 flex-shrink-0 bg-slate-900 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. Personal Contact Info */}
        {activeTab === 'personal' && (
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="font-bold text-white text-sm">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={data.personal?.name || ''}
                  onChange={(e) => updatePersonal('name', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={data.personal?.email || ''}
                  onChange={(e) => updatePersonal('email', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={data.personal?.phone || ''}
                  onChange={(e) => updatePersonal('phone', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={data.personal?.location || ''}
                  onChange={(e) => updatePersonal('location', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={data.personal?.linkedin || ''}
                  onChange={(e) => updatePersonal('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={data.personal?.github || ''}
                  onChange={(e) => updatePersonal('github', e.target.value)}
                  placeholder="github.com/username"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Portfolio / Personal Website</label>
                <input
                  type="text"
                  value={data.personal?.portfolio || ''}
                  onChange={(e) => updatePersonal('portfolio', e.target.value)}
                  placeholder="yourname.dev"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Professional Summary */}
        {activeTab === 'summary' && (
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Professional Summary</h3>
              <span className="text-[11px] text-slate-400">{data.summary?.length || 0} characters</span>
            </div>
            <textarea
              rows={6}
              value={data.summary || ''}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="A concise, impact-focused summary of your background, core strengths, and engineering domain..."
              className="w-full p-3 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              ATS Recommendation: Keep summary between 2 to 4 sentences highlighting demonstrated competencies and technical domain.
            </p>
          </div>
        )}

        {/* 3. Skills Matrix */}
        {activeTab === 'skills' && (
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm">Categorized Technical Skills</h3>
            {['languages', 'frontend', 'backend', 'databases', 'tools', 'core'].map(cat => {
              const label = cat === 'core' ? 'CS Fundamentals' : cat.charAt(0).toUpperCase() + cat.slice(1);
              const items = data.skills?.[cat] || [];
              return (
                <div key={cat} className="p-3.5 rounded-xl border border-slate-700/60 bg-slate-800/50">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-slate-200 uppercase text-[11px] tracking-wider">{label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{items.length} skills</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {items.map((skill, sIdx) => (
                      <span key={sIdx} className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[11.5px] font-medium text-slate-200">
                        <span>{skill}</span>
                        <button
                          onClick={() => handleRemoveSkill(cat, sIdx)}
                          className="text-slate-400 hover:text-rose-400 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder={`Type skill and press Enter to add to ${label}...`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSkill(cat, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Experience */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Work Experience</h3>
              <button
                onClick={addExperience}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {(data.experience || []).map((exp, idx) => (
              <div key={exp.id || idx} className="p-4 rounded-xl border border-slate-700/60 bg-slate-800/50 space-y-3 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-750">
                  <span className="font-bold text-slate-200">Entry #{idx + 1}</span>
                  <button onClick={() => removeExperience(idx)} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Role Title (e.g. Software Engineer)"
                    value={exp.role || ''}
                    onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={exp.company || ''}
                    onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. Jun 2025 – Present)"
                    value={exp.startDate ? `${exp.startDate} – ${exp.endDate || 'Present'}` : ''}
                    onChange={(e) => {
                      const parts = e.target.value.split('–');
                      updateExperience(idx, 'startDate', parts[0]?.trim());
                      updateExperience(idx, 'endDate', parts[1]?.trim() || '');
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g. Hyderabad, India)"
                    value={exp.location || ''}
                    onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Bullets */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-slate-300">Bullet Points</span>
                    <div className="flex gap-2">
                      <button
                        onClick={onOpenBulletGenerator}
                        className="text-[11px] text-purple-400 font-semibold flex items-center gap-1 hover:text-purple-300"
                      >
                        <Sparkles className="w-3 h-3" /> AI Bullet Generator
                      </button>
                      <button
                        onClick={() => addExperienceBullet(idx)}
                        className="text-[11px] text-blue-400 font-semibold hover:text-blue-300"
                      >
                        + Add Bullet
                      </button>
                    </div>
                  </div>
                  {(exp.bullets || []).map((b, bIdx) => (
                    <div key={bIdx} className="flex gap-1.5 items-start">
                      <textarea
                        rows={2}
                        value={b}
                        onChange={(e) => updateExperienceBullet(idx, bIdx, e.target.value)}
                        className="flex-1 p-2 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                      <button onClick={() => removeExperienceBullet(idx, bIdx)} className="text-slate-400 hover:text-rose-400 pt-1.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Technical Projects</h3>
              <button
                onClick={addProject}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {(data.projects || []).map((p, idx) => (
              <div key={p.id || idx} className="p-4 rounded-xl border border-slate-700/60 bg-slate-800/50 space-y-3 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-750">
                  <span className="font-bold text-slate-200">Project #{idx + 1}</span>
                  <button onClick={() => removeProject(idx)} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={p.title || ''}
                    onChange={(e) => updateProject(idx, 'title', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Technologies (e.g. React, Spring Boot)"
                    value={p.technologies || ''}
                    onChange={(e) => updateProject(idx, 'technologies', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Live URL / Demo Link"
                    value={p.link || ''}
                    onChange={(e) => updateProject(idx, 'link', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="GitHub Repo URL"
                    value={p.github || ''}
                    onChange={(e) => updateProject(idx, 'github', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Bullets */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-slate-300">Project Highlights</span>
                    <button onClick={() => addProjectBullet(idx)} className="text-[11px] text-blue-400 font-semibold hover:text-blue-300">
                      + Add Bullet
                    </button>
                  </div>
                  {(p.bullets || []).map((b, bIdx) => (
                    <div key={bIdx} className="flex gap-1.5 items-start">
                      <textarea
                        rows={2}
                        value={b}
                        onChange={(e) => updateProjectBullet(idx, bIdx, e.target.value)}
                        className="flex-1 p-2 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                      <button onClick={() => removeProjectBullet(idx, bIdx)} className="text-slate-400 hover:text-rose-400 pt-1.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. Education */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Education &amp; Academics</h3>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Degree
              </button>
            </div>

            {(data.education || []).map((edu, idx) => (
              <div key={edu.id || idx} className="p-4 rounded-xl border border-slate-700/60 bg-slate-800/50 space-y-3 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-750">
                  <span className="font-bold text-slate-200">Degree #{idx + 1}</span>
                  <button onClick={() => removeEducation(idx)} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Institution (e.g. JNTU Hyderabad)"
                    value={edu.institution || ''}
                    onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Degree (e.g. B.Tech in CSE)"
                    value={edu.degree || ''}
                    onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Graduation Year / Dates"
                    value={edu.startDate ? `${edu.startDate} – ${edu.endDate}` : ''}
                    onChange={(e) => {
                      const parts = e.target.value.split('–');
                      updateEducation(idx, 'startDate', parts[0]?.trim());
                      updateEducation(idx, 'endDate', parts[1]?.trim() || '');
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="GPA / Score (e.g. 8.9 / 10.0)"
                    value={edu.gpa || ''}
                    onChange={(e) => updateEducation(idx, 'gpa', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Relevant Coursework (e.g. DSA, DBMS, Operating Systems, Networks)"
                  value={edu.coursework || ''}
                  onChange={(e) => updateEducation(idx, 'coursework', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        )}

        {/* 7. Certifications & Achievements */}
        {activeTab === 'credentials' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white text-sm">Certifications</h3>
                <button onClick={addCertification} className="text-[11px] text-blue-400 font-semibold hover:text-blue-300">
                  + Add Certification
                </button>
              </div>
              <div className="space-y-2">
                {(data.certifications || []).map((c, idx) => (
                  <div key={c.id || idx} className="p-3 rounded-xl border border-slate-700/60 bg-slate-800/50 flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Certification Name"
                      value={c.name || ''}
                      onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Issuer"
                      value={c.issuer || ''}
                      onChange={(e) => updateCertification(idx, 'issuer', e.target.value)}
                      className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={c.date || ''}
                      onChange={(e) => updateCertification(idx, 'date', e.target.value)}
                      className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 text-center focus:outline-none focus:border-blue-500"
                    />
                    <button onClick={() => removeCertification(idx)} className="text-slate-400 hover:text-rose-400 ml-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white text-sm">Honors &amp; Achievements</h3>
                <button onClick={addAchievement} className="text-[11px] text-blue-400 font-semibold hover:text-blue-300">
                  + Add Achievement
                </button>
              </div>
              <div className="space-y-2">
                {(data.achievements || []).map((a, idx) => (
                  <div key={a.id || idx} className="p-3 rounded-xl border border-slate-700/60 bg-slate-800/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        placeholder="Title (e.g. Smart India Hackathon Finalist)"
                        value={a.title || ''}
                        onChange={(e) => updateAchievement(idx, 'title', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button onClick={() => removeAchievement(idx)} className="text-slate-400 hover:text-rose-400 ml-2">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Brief description of the milestone..."
                      value={a.description || ''}
                      onChange={(e) => updateAchievement(idx, 'description', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
