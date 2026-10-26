import React, { useState, useEffect, useRef } from 'react';
import { resumeBuilderApi } from '../../../api/resumeBuilderApi';
import { DEFAULT_RESUME_DATA, COLOR_PALETTES, FONT_OPTIONS, SPACING_OPTIONS, FONT_SIZE_OPTIONS } from '../../../components/resume-engine/data/resumeSchema';
import { TEMPLATES_METADATA } from '../../../components/resume-engine/data/templatesMetadata';
import { analyzeResumeATS } from '../../../components/resume-engine/services/atsAnalyzer';
import { ResumeRenderer } from '../../../components/resume-engine/components/ResumeRenderer';
import { CustomizationToolbar } from '../../../components/resume-engine/components/CustomizationToolbar';
import { TemplateGalleryModal } from '../../../components/resume-engine/components/TemplateGalleryModal';
import { AtsScoreModal } from '../../../components/resume-engine/components/AtsScoreModal';
import { JobMatcherModal } from '../../../components/resume-engine/components/JobMatcherModal';
import { FitToOnePageModal } from '../../../components/resume-engine/components/FitToOnePageModal';
import { BulletGeneratorModal } from '../../../components/resume-engine/components/BulletGeneratorModal';
import { ExportModal } from '../../../components/resume-engine/components/ExportModal';
import { VersionManagerModal } from '../../../components/resume-engine/components/VersionManagerModal';
import { ResumeFormEditor } from '../../../components/resume-engine/components/ResumeFormEditor';

import {
  FileText,
  Sparkles,
  Download,
  Save,
  Layers,
  ShieldCheck,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  LayoutTemplate,
  Briefcase,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

function safeParseJson(jsonString, fallback) {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function dtoToResumeData(dto) {
  const rawCerts = safeParseJson(dto.certificationsJson, DEFAULT_RESUME_DATA.certifications) || [];
  const cleanCerts = Array.isArray(rawCerts) ? rawCerts.filter(c => (c.name && c.name.trim()) || (c.issuer && c.issuer.trim())) : [];
  
  const rawAchievements = safeParseJson(dto.achievementsJson, DEFAULT_RESUME_DATA.achievements) || [];
  const cleanAchievements = Array.isArray(rawAchievements) ? rawAchievements.filter(a => (a.title && a.title.trim()) || (a.description && a.description.trim())) : [];

  return {
    personal: {
      name: dto.fullName || DEFAULT_RESUME_DATA.personal.name,
      email: dto.email || DEFAULT_RESUME_DATA.personal.email,
      phone: dto.phone || DEFAULT_RESUME_DATA.personal.phone,
      location: dto.location || DEFAULT_RESUME_DATA.personal.location,
      linkedin: dto.linkedinUrl || DEFAULT_RESUME_DATA.personal.linkedin,
      github: dto.githubUrl || DEFAULT_RESUME_DATA.personal.github,
      portfolio: dto.portfolioUrl || DEFAULT_RESUME_DATA.personal.portfolio,
    },
    summary: dto.summary !== undefined && dto.summary !== null ? dto.summary : DEFAULT_RESUME_DATA.summary,
    education: safeParseJson(dto.educationsJson, DEFAULT_RESUME_DATA.education),
    experience: safeParseJson(dto.experiencesJson, DEFAULT_RESUME_DATA.experience),
    projects: safeParseJson(dto.projectsJson, DEFAULT_RESUME_DATA.projects),
    skills: safeParseJson(dto.skillsJson, DEFAULT_RESUME_DATA.skills),
    certifications: cleanCerts.length > 0 ? cleanCerts : DEFAULT_RESUME_DATA.certifications,
    achievements: cleanAchievements.length > 0 ? cleanAchievements : DEFAULT_RESUME_DATA.achievements,
    languages: safeParseJson(dto.languagesJson, DEFAULT_RESUME_DATA.languages),
    additional: DEFAULT_RESUME_DATA.additional,
    targetRole: dto.targetRole || "Software Engineer"
  };
}

function resumeDataToDto(data, currentVersion, templateId) {
  return {
    ...currentVersion,
    fullName: data.personal?.name,
    email: data.personal?.email,
    phone: data.personal?.phone,
    location: data.personal?.location,
    linkedinUrl: data.personal?.linkedin,
    githubUrl: data.personal?.github,
    portfolioUrl: data.personal?.portfolio,
    summary: data.summary,
    targetRole: data.targetRole,
    templateId: templateId,
    skillsJson: JSON.stringify(data.skills || {}),
    experiencesJson: JSON.stringify(data.experience || []),
    educationsJson: JSON.stringify(data.education || []),
    projectsJson: JSON.stringify(data.projects || []),
    certificationsJson: JSON.stringify(data.certifications || []),
    achievementsJson: JSON.stringify(data.achievements || []),
    languagesJson: JSON.stringify(data.languages || [])
  };
}

export const ResumeBuilderPage = () => {
  const [versions, setVersions] = useState([]);
  const [activeVersion, setActiveVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Resume Data Model (Independent of template)
  const [resumeData, setResumeData] = useState(DEFAULT_RESUME_DATA);
  const [selectedTemplateId, setSelectedTemplateId] = useState('template-01');

  // Customization Options
  const [customization, setCustomization] = useState({
    color: '#111827',
    font: FONT_OPTIONS[0],
    spacing: SPACING_OPTIONS[1],
    fontSize: FONT_SIZE_OPTIONS[1]
  });

  // Zoom scale for preview
  const [previewZoom, setPreviewZoom] = useState(1.0);

  // Modal States
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [atsScoreModalOpen, setAtsScoreModalOpen] = useState(false);
  const [jobMatcherOpen, setJobMatcherOpen] = useState(false);
  const [onePageModalOpen, setOnePageModalOpen] = useState(false);
  const [bulletGeneratorOpen, setBulletGeneratorOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  // Load versions from API on mount
  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const res = await resumeBuilderApi.getMyResumeVersions();
      if (res && res.length > 0) {
        setVersions(res);
        selectVersion(res[0]);
      } else {
        // Fallback to initial local version
        const initial = {
          id: Date.now(),
          title: "Master Resume (SWE)",
          targetRole: "Software Engineer",
          templateId: "template-01",
          master: true
        };
        setVersions([initial]);
        setActiveVersion(initial);
      }
    } catch (err) {
      console.warn('Backend resume versions not fetched, using local mode:', err);
      const initial = {
        id: Date.now(),
        title: "Master Resume (SWE)",
        targetRole: "Software Engineer",
        templateId: "template-01",
        master: true
      };
      setVersions([initial]);
      setActiveVersion(initial);
    } finally {
      setLoading(false);
    }
  };

  const selectVersion = (v) => {
    setActiveVersion(v);
    const converted = dtoToResumeData(v);
    setResumeData(converted);
    if (v.templateId) {
      setSelectedTemplateId(v.templateId);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = resumeDataToDto(resumeData, activeVersion || {}, selectedTemplateId);
      if (activeVersion?.id && typeof activeVersion.id === 'number') {
        const res = await resumeBuilderApi.updateResumeVersion(activeVersion.id, payload);
        toast.success("Resume saved successfully!");
      } else {
        const res = await resumeBuilderApi.createResumeVersion(payload);
        toast.success("New resume version created!");
      }
    } catch (err) {
      // Local fallback save
      localStorage.setItem(`hiresense_resume_${activeVersion?.id || 'draft'}`, JSON.stringify({
        data: resumeData,
        templateId: selectedTemplateId,
        customization
      }));
      toast.success("Resume saved locally!");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVersion = async (meta) => {
    const newVersion = {
      id: Date.now(),
      title: meta.title,
      targetRole: meta.targetRole,
      templateId: selectedTemplateId,
      master: false
    };
    try {
      const payload = resumeDataToDto(resumeData, newVersion, selectedTemplateId);
      const res = await resumeBuilderApi.createResumeVersion(payload);
      const created = res?.data || res || newVersion;
      setVersions([created, ...versions]);
      selectVersion(created);
    } catch {
      setVersions([newVersion, ...versions]);
      selectVersion(newVersion);
    }
  };

  const handleDuplicateVersion = async (ver) => {
    const dup = {
      ...ver,
      id: Date.now(),
      title: `${ver.title} (Copy)`,
      master: false
    };
    setVersions([dup, ...versions]);
    selectVersion(dup);
    toast.success(`Duplicated "${ver.title}"`);
  };

  const handleDeleteVersion = async (id) => {
    try {
      await resumeBuilderApi.deleteResumeVersion(id);
    } catch {
      // Local fallback
    }
    const filtered = versions.filter(v => v.id !== id);
    setVersions(filtered);
    if (activeVersion?.id === id && filtered.length > 0) {
      selectVersion(filtered[0]);
    }
    toast.success("Version deleted");
  };

  const handleAddSkillsFromJobMatcher = (newSkills) => {
    const current = { ...(resumeData.skills || {}) };
    const tools = [...(current.tools || [])];
    newSkills.forEach(s => {
      if (!tools.includes(s)) tools.push(s);
    });
    setResumeData({
      ...resumeData,
      skills: { ...current, tools }
    });
  };

  const handleInsertBulletPoint = (bullet) => {
    if (resumeData.experience && resumeData.experience.length > 0) {
      const expList = [...resumeData.experience];
      expList[0] = {
        ...expList[0],
        bullets: [...(expList[0].bullets || []), bullet]
      };
      setResumeData({ ...resumeData, experience: expList });
    } else {
      navigator.clipboard.writeText(bullet);
      toast.success("Copied to clipboard!");
    }
  };

  // Find active template metadata
  const activeTemplate = TEMPLATES_METADATA.find(t => t.id === selectedTemplateId) || TEMPLATES_METADATA[0];

  // ATS Heuristic Analysis
  const atsAnalysis = analyzeResumeATS(resumeData, activeTemplate, customization);

  return (
    <div className="h-full w-full bg-slate-100 flex flex-col font-sans overflow-hidden">
      {/* 1. Print Specific Global CSS */}
      <style>{`
        @media print {
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide EVERYTHING on the entire page */
          body * {
            visibility: hidden !important;
          }
          /* Only display the resume sheet and its children */
          #resume-preview-sheet,
          #resume-preview-sheet * {
            visibility: visible !important;
          }
          #resume-preview-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            transform: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      {/* 2. Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-slate-800 shadow-2xs">
        {/* Left: Title & Active Version Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Resume Builder
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-600 border border-slate-200 font-medium px-2 py-0.5 rounded">
                  20 Templates
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Version: <strong className="text-slate-700">{activeVersion?.title || 'Master Resume'}</strong></span>
                <span>•</span>
                <span>Role: <strong className="text-slate-700">{resumeData.targetRole || 'Software Engineer'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Tools (Score, Job Match, 1-Page, Bullet Suggestions) */}
        <div className="hidden lg:flex items-center gap-2">
          {/* ATS Score */}
          <button
            onClick={() => setAtsScoreModalOpen(true)}
            title="Inspect ATS Compatibility Score"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Score:</span>
            <span className="font-bold text-emerald-700">{atsAnalysis.score}/100</span>
          </button>

          {/* Job Match */}
          <button
            onClick={() => setJobMatcherOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition shadow-2xs"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span>Job Match</span>
          </button>

          {/* Fit to 1-Page */}
          <button
            onClick={() => setOnePageModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition shadow-2xs"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-600" />
            <span>1-Page Fit</span>
          </button>

          {/* Bullet Suggestions (normalized, no AI buzzwords) */}
          <button
            onClick={() => setBulletGeneratorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Bullet Suggestions</span>
          </button>
        </div>

        {/* Right: Versions, Save & Export */}
        <div className="flex items-center gap-2">
          {/* Versions */}
          <button
            onClick={() => setVersionModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Versions ({versions.length})</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Resume</span>
          </button>
        </div>
      </header>

      {/* 3. Customization Toolbar */}
      <CustomizationToolbar
        customization={customization}
        onChangeCustomization={setCustomization}
        targetRole={resumeData.targetRole || "Software Engineer"}
        onChangeTargetRole={(role) => setResumeData({ ...resumeData, targetRole: role })}
        onOpenGallery={() => setGalleryOpen(true)}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={(id) => {
          setSelectedTemplateId(id);
          const tpl = TEMPLATES_METADATA.find(t => t.id === id);
          toast.success(`Applied template: ${tpl?.name || id}`);
        }}
      />

      {/* 4. Main Split Workspace (Left Form Editor / Right Live Preview) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Side: Structured Form Editor (45% on desktop) */}
        <div className="w-full lg:w-[45%] h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden">
          <ResumeFormEditor
            data={resumeData}
            onChangeData={setResumeData}
            onOpenBulletGenerator={() => setBulletGeneratorOpen(true)}
          />
        </div>

        {/* Right Side: Live Resume Preview (55% on desktop) */}
        <div className="w-full lg:w-[55%] h-full bg-slate-100 p-6 overflow-y-auto flex flex-col items-center">
          {/* Preview Canvas Bar (Zoom & Page Status) */}
          <div className="w-full max-w-[800px] flex items-center justify-between pb-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                Template: {activeTemplate.name}
              </span>
              <span className="text-[11px] bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-mono shadow-2xs">
                {activeTemplate.layout === 'single-column' ? '1 Column' : '2 Columns'}
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-slate-700">
              <button
                onClick={() => setPreviewZoom(Math.max(0.6, previewZoom - 0.1))}
                className="p-1 hover:text-slate-900 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] min-w-[35px] text-center font-semibold text-slate-800">
                {Math.round(previewZoom * 100)}%
              </span>
              <button
                onClick={() => setPreviewZoom(Math.min(1.3, previewZoom + 0.1))}
                className="p-1 hover:text-slate-900 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewZoom(1.0)}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold ml-1 transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Scaled Resume Sheet Container */}
          <div
            className="w-full max-w-[800px] transition-transform origin-top flex justify-center"
            style={{ transform: `scale(${previewZoom})` }}
          >
            <ResumeRenderer
              templateId={selectedTemplateId}
              data={resumeData}
              customization={customization}
            />
          </div>
        </div>
      </div>

      {/* 5. Modals Suite */}
      <TemplateGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        currentTemplateId={selectedTemplateId}
        onSelectTemplate={(id) => {
          setSelectedTemplateId(id);
          toast.success("Switched template without altering resume content!");
        }}
        targetRole={resumeData.targetRole}
      />

      <AtsScoreModal
        isOpen={atsScoreModalOpen}
        onClose={() => setAtsScoreModalOpen(false)}
        analysis={atsAnalysis}
      />

      <JobMatcherModal
        isOpen={jobMatcherOpen}
        onClose={() => setJobMatcherOpen(false)}
        resumeData={resumeData}
        onAddSkillsToResume={handleAddSkillsFromJobMatcher}
      />

      <FitToOnePageModal
        isOpen={onePageModalOpen}
        onClose={() => setOnePageModalOpen(false)}
        resumeData={resumeData}
        customization={customization}
        onApplyOnePageSettings={(newCustomization) => setCustomization(newCustomization)}
      />

      <BulletGeneratorModal
        isOpen={bulletGeneratorOpen}
        onClose={() => setBulletGeneratorOpen(false)}
        onInsertBullet={handleInsertBulletPoint}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        resumeData={resumeData}
        onImportJson={(imported) => {
          setResumeData(imported);
          toast.success("Imported resume data applied!");
        }}
      />

      <VersionManagerModal
        isOpen={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        versions={versions}
        activeVersionId={activeVersion?.id}
        onSelectVersion={selectVersion}
        onCreateVersion={handleCreateVersion}
        onDuplicateVersion={handleDuplicateVersion}
        onDeleteVersion={handleDeleteVersion}
      />
    </div>
  );
};
