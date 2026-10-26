import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { coverLetterApi } from '../../../api/coverLetterApi';
import { jobApi } from '../../../api/jobApi';
import { resumeApi } from '../../../api/resumeApi';
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  Save,
  Trash2,
  Check,
  Briefcase,
  Layers,
  Printer,
  Upload,
  FileCheck,
  X,
  FileCode,
  CheckCircle2,
  Clock,
  HelpCircle,
  Eye,
  Edit3,
  Building2,
  ChevronRight,
  Flame,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export const CoverLetterPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedJobId = searchParams.get('jobId');

  // Application Data States
  const [letters, setLetters] = useState([]);
  const [activeLetter, setActiveLetter] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [myResumes, setMyResumes] = useState([]);

  // Form Fields
  const [selectedJobId, setSelectedJobId] = useState(preselectedJobId || '');
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [tone, setTone] = useState('PROFESSIONAL');

  // Optional Resume States
  const [resumeMode, setResumeMode] = useState('SAVED'); // 'SAVED', 'UPLOAD', 'TEXT', 'NONE'
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [customResumeText, setCustomResumeText] = useState('');
  const [resumeFileUploading, setResumeFileUploading] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');

  // Optional Job Description States
  const [jdMode, setJdMode] = useState('PASTE'); // 'PASTE', 'UPLOAD', 'NONE'
  const [customJdText, setCustomJdText] = useState('');
  const [jdFileUploading, setJdFileUploading] = useState(false);
  const [jdFileName, setJdFileName] = useState('');

  // Candidate Custom Add-On Notes / Highlights
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Execution & UI States
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [viewMode, setViewMode] = useState('PREVIEW'); // 'PREVIEW' or 'EDIT'
  const [savingEdit, setSavingEdit] = useState(false);

  const printableRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [letterList, jobList, resumeRes] = await Promise.allSettled([
        coverLetterApi.getMyCoverLetters(),
        jobApi.searchJobs({}),
        resumeApi.getMyResumes(),
      ]);

      if (letterList.status === 'fulfilled' && letterList.value) {
        const list = Array.isArray(letterList.value) ? letterList.value : [];
        setLetters(list);
        if (list.length > 0) {
          selectLetter(list[0]);
        }
      }

      if (jobList.status === 'fulfilled' && jobList.value) {
        const jList = Array.isArray(jobList.value) ? jobList.value : [];
        setJobs(jList);
        if (preselectedJobId) {
          const matched = jList.find((j) => String(j.id) === String(preselectedJobId));
          if (matched) {
            setCompanyName(matched.company);
            setRoleTitle(matched.title);
            setCustomJdText(matched.description + '\n\n' + (matched.requirements || ''));
            setJdMode('PASTE');
          }
        }
      }

      if (resumeRes.status === 'fulfilled' && resumeRes.value?.success) {
        const rList = resumeRes.value.data || [];
        setMyResumes(rList);
        const activeResume = rList.find((r) => r.active) || rList[0];
        if (activeResume) {
          setSelectedResumeId(String(activeResume.id));
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const selectLetter = (cl) => {
    setActiveLetter(cl);
    setEditableContent(cl.content || '');
    setViewMode('PREVIEW');
  };

  // Upload & Extract File Text (Resume)
  const handleResumeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileUploading(true);
    setResumeFileName(file.name);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await coverLetterApi.extractFileText(formData);
      if (res && res.text) {
        setCustomResumeText(res.text);
        toast.success(`Extracted text from ${file.name}`);
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      toast.error('Failed to extract text from resume file');
    } finally {
      setResumeFileUploading(false);
    }
  };

  // Upload & Extract File Text (JD)
  const handleJdFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJdFileUploading(true);
    setJdFileName(file.name);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await coverLetterApi.extractFileText(formData);
      if (res && res.text) {
        setCustomJdText(res.text);
        toast.success(`Extracted text from ${file.name}`);
      }
    } catch (err) {
      console.error('JD upload error:', err);
      toast.error('Failed to extract text from JD file');
    } finally {
      setJdFileUploading(false);
    }
  };

  // Suggested Quick Chips for Custom Notes
  const addQuickChip = (text) => {
    setAdditionalNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return text;
      if (trimmed.includes(text)) return prev;
      return `${trimmed}; ${text}`;
    });
  };

  // AI Cover Letter Generation
  const handleGenerate = async () => {
    if (!companyName.trim() && !roleTitle.trim()) {
      toast.error('Please enter at least a Company Name or Target Role Title.');
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        jobId: selectedJobId ? Number(selectedJobId) : null,
        companyName: companyName.trim() || 'Hiring Company',
        roleTitle: roleTitle.trim() || 'Software Engineer',
        tone,
        additionalInstructions: additionalNotes.trim() || null,
        // Optional JD
        jobDescription: jdMode !== 'NONE' && customJdText.trim() ? customJdText.trim() : null,
        // Optional Resume
        resumeId: resumeMode === 'SAVED' && selectedResumeId ? Number(selectedResumeId) : null,
        resumeText:
          (resumeMode === 'UPLOAD' || resumeMode === 'TEXT') && customResumeText.trim()
            ? customResumeText.trim()
            : null,
      };

      const created = await coverLetterApi.generateCoverLetter(payload);
      if (created) {
        setLetters((prev) => [created, ...prev]);
        selectLetter(created);
        toast.success('AI Cover Letter generated successfully!');
      }
    } catch (err) {
      console.error('Failed to generate cover letter:', err);
      toast.error(err?.response?.data?.message || 'Failed to generate cover letter');
    } finally {
      setGenerating(false);
    }
  };

  // Save manual edits
  const handleSaveEdit = async () => {
    if (!activeLetter) return;
    setSavingEdit(true);
    try {
      const updated = await coverLetterApi.updateCoverLetter(activeLetter.id, {
        ...activeLetter,
        content: editableContent,
      });
      setActiveLetter(updated);
      setLetters((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      toast.success('Cover letter saved successfully!');
    } catch (err) {
      console.error('Failed to save edit:', err);
      toast.error('Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete cover letter
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cover letter?')) return;
    try {
      await coverLetterApi.deleteCoverLetter(id);
      const remaining = letters.filter((l) => l.id !== id);
      setLetters(remaining);
      if (remaining.length > 0) {
        selectLetter(remaining[0]);
      } else {
        setActiveLetter(null);
        setEditableContent('');
      }
      toast.success('Cover letter deleted');
    } catch (err) {
      console.error('Failed to delete cover letter:', err);
      toast.error('Failed to delete cover letter');
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!editableContent) return;
    navigator.clipboard.writeText(editableContent);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download TXT
  const handleDownloadTxt = () => {
    if (!editableContent) return;
    const blob = new Blob([editableContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${companyName || activeLetter?.companyName || 'Company'}_${
      roleTitle || activeLetter?.roleTitle || 'Role'
    }_Cover_Letter.txt`.replace(/\s+/g, '_');
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded as TXT file');
  };

  // Download PDF via dynamic html2pdf
  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    toast.loading('Preparing PDF...', { id: 'pdf-toast' });
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;
      const element = printableRef.current;
      const filename = `${companyName || activeLetter?.companyName || 'Company'}_${
        roleTitle || activeLetter?.roleTitle || 'Role'
      }_Cover_Letter.pdf`.replace(/\s+/g, '_');

      const opt = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('PDF downloaded!', { id: 'pdf-toast' });
    } catch (err) {
      console.error('PDF export failed, falling back to print dialog:', err);
      toast.dismiss('pdf-toast');
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans text-[#F8FAFC]">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#202934] bg-gradient-to-b from-[#151B22] via-[#10161C] to-[#0A0E13] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151B22] border border-[#202934] text-[#E8C982] text-xs font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E8C982] animate-pulse" />
            <span>AI-Driven Application Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Cover Letter Architect</h1>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-1 max-w-2xl leading-relaxed">
            Produce persuasive, role-tailored cover letters structured around your real accomplishments, target Job Description, and custom highlights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-[#151B22] border border-[#202934] text-[#C5CCD5] text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#35D07F] animate-ping"></span>
            <span>Gemini AI / Dual Engine</span>
          </div>
        </div>
      </div>

      {/* Main Builder Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10161C] border border-[#202934] shadow-[0_12px_40px_rgba(0,0,0,0.25)] space-y-6">
        {/* Section 1: Target Opportunity */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-6 h-6 rounded-lg bg-[#E8C982]/15 text-[#E8C982] border border-[#E8C982]/30 flex items-center justify-center text-xs font-bold">1</div>
            <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">Target Opportunity Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#8B949E] mb-1.5">Campus Vacancy (Auto-fill)</label>
              <select
                value={selectedJobId}
                onChange={(e) => {
                  const jId = e.target.value;
                  setSelectedJobId(jId);
                  const matched = jobs.find((j) => String(j.id) === String(jId));
                  if (matched) {
                    setCompanyName(matched.company);
                    setRoleTitle(matched.title);
                    setCustomJdText(matched.description + '\n\n' + (matched.requirements || ''));
                    setJdMode('PASTE');
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11171D] border border-[#202934] text-[#F8FAFC] focus:outline-none focus:border-[#E8C982] font-medium"
              >
                <option value="">-- Manual Employer Entry --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} — {j.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#8B949E] mb-1.5">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Razorpay, Google, Microsoft, Deloitte"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11171D] border border-[#202934] text-[#F8FAFC] placeholder-[#6F7783] focus:outline-none focus:border-[#E8C982] font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#8B949E] mb-1.5">Target Role Title *</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Frontend Software Engineer (React)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11171D] border border-[#202934] text-[#F8FAFC] placeholder-[#6F7783] focus:outline-none focus:border-[#E8C982] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dual Optional Context Cards (Resume & JD) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-[#202934]">
          {/* Card A: Optional Resume */}
          <div className="p-5 rounded-2xl bg-[#151B22]/70 border border-[#202934] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#E8C982]" />
                <span className="font-bold text-xs text-[#F8FAFC]">Candidate Resume</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#11171D] border border-[#202934] text-[#8B949E] text-[10px] font-bold">
                Optional
              </span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#11171D] rounded-xl border border-[#202934] text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setResumeMode('SAVED')}
                className={`flex-1 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  resumeMode === 'SAVED' ? 'bg-[#E8C982] text-[#05070A] font-bold shadow-xs' : 'text-[#8B949E] hover:text-[#F8FAFC]'
                }`}
              >
                Saved Resumes ({myResumes.length})
              </button>
              <button
                type="button"
                onClick={() => setResumeMode('UPLOAD')}
                className={`flex-1 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  resumeMode === 'UPLOAD' ? 'bg-[#E8C982] text-[#05070A] font-bold shadow-xs' : 'text-[#8B949E] hover:text-[#F8FAFC]'
                }`}
              >
                Upload File (.pdf/.txt)
              </button>
              <button
                type="button"
                onClick={() => setResumeMode('TEXT')}
                className={`flex-1 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  resumeMode === 'TEXT' ? 'bg-[#E8C982] text-[#05070A] font-bold shadow-xs' : 'text-[#8B949E] hover:text-[#F8FAFC]'
                }`}
              >
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => {
                  setResumeMode('NONE');
                  setSelectedResumeId('');
                  setCustomResumeText('');
                }}
                className={`px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  resumeMode === 'NONE' ? 'bg-[#FF5A5F] text-white shadow-xs' : 'text-[#6F7783] hover:text-[#FF5A5F]'
                }`}
                title="Skip Resume"
              >
                Skip
              </button>
            </div>

            {/* Mode Content */}
            {resumeMode === 'SAVED' && (
              <div className="space-y-2">
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#11171D] border border-[#202934] text-xs text-[#F8FAFC] font-medium focus:outline-none focus:border-[#E8C982]"
                >
                  <option value="">-- No saved resume selected --</option>
                  {myResumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.originalFilename} (v{r.versionNumber || 1}) — {r.pageCount || 1} pages
                    </option>
                  ))}
                </select>
                {selectedResumeId ? (
                  <p className="text-[11px] text-[#35D07F] font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#35D07F]" />
                    <span>Active resume linked for AI skill mapping.</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-[#6F7783]">Select one of your uploaded profile resumes.</p>
                )}
              </div>
            )}

            {resumeMode === 'UPLOAD' && (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-[#202934] hover:border-[#E8C982]/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#11171D] transition-colors duration-150 group">
                  <Upload className="w-5 h-5 text-[#8B949E] group-hover:text-[#E8C982] mb-1 transition-colors" />
                  <span className="text-xs font-semibold text-[#F8FAFC]">
                    {resumeFileUploading ? 'Extracting text...' : resumeFileName || 'Click to upload Resume (.pdf, .txt)'}
                  </span>
                  <span className="text-[10px] text-[#6F7783] mt-0.5">Maximum size: 5 MB</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleResumeFileUpload}
                    className="hidden"
                    disabled={resumeFileUploading}
                  />
                </label>
                {customResumeText && (
                  <div className="flex items-center justify-between text-[11px] text-[#C5CCD5] bg-[#11171D] px-3 py-1.5 rounded-lg border border-[#202934]">
                    <span className="truncate">✓ Extracted {customResumeText.length} characters</span>
                    <button
                      type="button"
                      onClick={() => setCustomResumeText('')}
                      className="text-[#FF5A5F] hover:text-red-400 ml-2 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}

            {resumeMode === 'TEXT' && (
              <textarea
                value={customResumeText}
                onChange={(e) => setCustomResumeText(e.target.value)}
                placeholder="Paste key achievements, tech stack, or projects from your resume here..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-[#11171D] border border-[#202934] text-xs text-[#F8FAFC] placeholder-[#6F7783] focus:outline-none focus:border-[#E8C982]"
              />
            )}

            {resumeMode === 'NONE' && (
              <div className="p-3 rounded-xl bg-[#11171D] text-center text-[#8B949E] text-xs border border-[#202934]">
                No resume attached. AI will utilize your default profile skills & academic background.
              </div>
            )}
          </div>

          {/* Card B: Optional Job Description */}
          <div className="p-5 rounded-2xl bg-[#151B22]/70 border border-[#202934] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#20D3C2]" />
                <span className="font-bold text-xs text-[#F8FAFC]">Target Job Description</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#11171D] border border-[#202934] text-[#8B949E] text-[10px] font-bold">
                Optional
              </span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#11171D] rounded-xl border border-[#202934] text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setJdMode('PASTE')}
                className={`flex-1 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  jdMode === 'PASTE' ? 'bg-[#E8C982] text-[#05070A] font-bold shadow-xs' : 'text-[#8B949E] hover:text-[#F8FAFC]'
                }`}
              >
                Paste JD Text
              </button>
              <button
                type="button"
                onClick={() => setJdMode('UPLOAD')}
                className={`flex-1 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  jdMode === 'UPLOAD' ? 'bg-[#E8C982] text-[#05070A] font-bold shadow-xs' : 'text-[#8B949E] hover:text-[#F8FAFC]'
                }`}
              >
                Upload JD (.pdf/.txt)
              </button>
              <button
                type="button"
                onClick={() => {
                  setJdMode('NONE');
                  setCustomJdText('');
                }}
                className={`px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  jdMode === 'NONE' ? 'bg-[#FF5A5F] text-white shadow-xs' : 'text-[#6F7783] hover:text-[#FF5A5F]'
                }`}
                title="Skip JD"
              >
                Skip
              </button>
            </div>

            {/* Mode Content */}
            {jdMode === 'PASTE' && (
              <textarea
                value={customJdText}
                onChange={(e) => setCustomJdText(e.target.value)}
                placeholder="Paste the job posting requirements, responsibilities, or qualification criteria..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-[#11171D] border border-[#202934] text-xs text-[#F8FAFC] placeholder-[#6F7783] focus:outline-none focus:border-[#E8C982]"
              />
            )}

            {jdMode === 'UPLOAD' && (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-[#202934] hover:border-[#E8C982]/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#11171D] transition-colors duration-150 group">
                  <Upload className="w-5 h-5 text-[#8B949E] group-hover:text-[#E8C982] mb-1 transition-colors" />
                  <span className="text-xs font-semibold text-[#F8FAFC]">
                    {jdFileUploading ? 'Extracting text...' : jdFileName || 'Click to upload JD (.pdf, .txt)'}
                  </span>
                  <span className="text-[10px] text-[#6F7783] mt-0.5">Maximum size: 5 MB</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleJdFileUpload}
                    className="hidden"
                    disabled={jdFileUploading}
                  />
                </label>
                {customJdText && (
                  <div className="flex items-center justify-between text-[11px] text-[#C5CCD5] bg-[#11171D] px-3 py-1.5 rounded-lg border border-[#202934]">
                    <span className="truncate">✓ Extracted {customJdText.length} characters</span>
                    <button
                      type="button"
                      onClick={() => setCustomJdText('')}
                      className="text-[#FF5A5F] hover:text-red-400 ml-2 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}

            {jdMode === 'NONE' && (
              <div className="p-3 rounded-xl bg-[#11171D] text-center text-[#8B949E] text-xs border border-[#202934]">
                No JD attached. AI will generate industry-standard competencies for {roleTitle || 'this role'}.
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Custom Add-On Notes / Points */}
        <div className="pt-4 border-t border-[#202934] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#E8C982]/15 text-[#E8C982] border border-[#E8C982]/30 flex items-center justify-center text-xs font-bold">2</div>
              <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">Custom Highlights & Add-on Instructions</h2>
            </div>
            <span className="text-[11px] text-[#8B949E] font-medium">Tell the AI agent what to specifically feature</span>
          </div>

          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="e.g., 'Emphasize my recent internship at XYZ where I improved API throughput by 30%, mention that I am available to join immediately, and highlight my active open-source contributions.'"
            rows={3}
            className="w-full p-3.5 rounded-2xl bg-[#11171D] border border-[#202934] text-xs text-[#F8FAFC] placeholder-[#6F7783] focus:outline-none focus:border-[#E8C982] font-medium"
          />

          {/* Quick-insert Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-[#8B949E] mr-1">Quick Add:</span>
            {[
              'Available to join immediately',
              'Highlight recent internship experience',
              'Emphasize hackathon leadership & teamwork',
              'Passionate about scalable cloud systems',
              'Fast learner with strong algorithmic foundation',
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addQuickChip(chip)}
                className="px-2.5 py-1 rounded-lg bg-[#151B22] hover:bg-[#1E252E] hover:text-[#E8C982] hover:border-[#E8C982]/40 border border-[#202934] text-[#C5CCD5] text-[11px] font-medium transition-all duration-150 cursor-pointer active:scale-95"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Tone & Action Controls */}
        <div className="pt-4 border-t border-[#202934] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#8B949E] font-semibold mr-1">Tone Strategy:</span>
            {[
              { id: 'PROFESSIONAL', label: 'Professional', desc: 'Structured & formal' },
              { id: 'CONVERSATIONAL', label: 'Conversational', desc: 'Engaging & modern' },
              { id: 'IMPACT_DRIVEN', label: 'Metrics-Driven', desc: 'ROI & outcomes' },
              { id: 'EXECUTIVE', label: 'Executive', desc: 'Visionary & systemic' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
                  tone === t.id
                    ? 'bg-[#E8C982]/15 text-[#E8C982] border border-[#E8C982]/40 font-bold shadow-xs'
                    : 'bg-[#151B22] text-[#8B949E] border border-[#202934] hover:bg-[#1E252E] hover:text-[#F8FAFC]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-3 rounded-2xl text-xs font-bold bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] shadow-[0_2px_14px_rgba(232,201,130,0.25)] flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-[#05070A] border-t-transparent rounded-full animate-spin" />
                <span>AI Agent Synthesizing Documents...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Cover Letter with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Saved Letters History Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
              Saved Letters ({letters.length})
            </h3>
            {letters.length > 0 && (
              <span className="text-[11px] text-[#6F7783] font-medium">Click to view</span>
            )}
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {letters.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#10161C] border border-[#202934] text-center text-xs text-[#8B949E] space-y-2">
                <FileText className="w-8 h-8 text-[#6F7783] mx-auto" />
                <p>No saved cover letters yet.</p>
                <p className="text-[11px] text-[#6F7783]">Fill in the vacancy details above and click Generate.</p>
              </div>
            ) : (
              letters.map((cl) => {
                const isActive = activeLetter?.id === cl.id;
                return (
                  <div
                    key={cl.id}
                    onClick={() => selectLetter(cl)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 flex items-start justify-between group ${
                      isActive
                        ? 'bg-[#151B22] border-[#E8C982]/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                        : 'bg-[#10161C] border-[#202934] hover:border-[#E8C982]/30 hover:bg-[#151B22]'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <Building2 className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#E8C982]' : 'text-[#8B949E]'}`} />
                        <h4 className="text-xs font-bold text-[#F8FAFC] truncate group-hover:text-[#E8C982] transition-colors">{cl.companyName}</h4>
                      </div>
                      <p className="text-[11px] text-[#8B949E] font-medium truncate">{cl.roleTitle}</p>
                      <div className="flex items-center gap-2 pt-0.5 text-[10px] text-[#6F7783]">
                        <span className="px-1.5 py-0.5 rounded bg-[#11171D] border border-[#202934] text-[#C5CCD5] font-semibold uppercase">
                          {cl.tone || 'PROF'}
                        </span>
                        <span>{new Date(cl.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(cl.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-[#8B949E] hover:text-[#FF5A5F] hover:bg-[#FF5A5F]/10 rounded-lg transition-all duration-150 cursor-pointer"
                      title="Delete letter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Cover Letter Workspace */}
        <div className="lg:col-span-3 space-y-4">
          {!activeLetter ? (
            <div className="bg-[#10161C] rounded-3xl border border-[#202934] p-12 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] min-h-[460px] flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#151B22] border border-[#202934] text-[#E8C982] flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">No Cover Letter Selected</h3>
              <p className="text-xs text-[#8B949E] max-w-md">
                Configure your target employer and role in the builder above, attach optional JD or resume context, and click <strong>"Generate Cover Letter with AI"</strong>.
              </p>
            </div>
          ) : (
            <div className="bg-[#10161C] rounded-3xl border border-[#202934] shadow-[0_12px_40px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col">
              {/* Document Header & Toolbar */}
              <div className="p-4 sm:p-5 bg-[#151B22] border-b border-[#202934] flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8C982]/15 text-[#E8C982] border border-[#E8C982]/30 text-[10px] font-bold">
                      {activeLetter.tone || 'PROFESSIONAL'}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate">
                      {activeLetter.roleTitle} — {activeLetter.companyName}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#8B949E]">
                    Generated on {new Date(activeLetter.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </p>
                </div>

                {/* View Mode Toggle & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-[#11171D] rounded-xl border border-[#202934] p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setViewMode('PREVIEW')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                        viewMode === 'PREVIEW' ? 'bg-[#E8C982] text-[#05070A] font-bold shadow-xs' : 'text-[#8B949E] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Document View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('EDIT')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                        viewMode === 'EDIT' ? 'bg-[#E8C982] text-[#05070A] font-bold shadow-xs' : 'text-[#8B949E] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>
                  </div>

                  {viewMode === 'EDIT' && (
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                      className="px-3.5 py-1.5 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingEdit ? 'Saving...' : 'Save Edits'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-[#11171D] hover:bg-[#1E252E] text-[#C5CCD5] hover:text-[#E8C982] border border-[#202934] hover:border-[#E8C982]/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
                    title="Copy text"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#35D07F]" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="p-2 rounded-xl bg-[#11171D] hover:bg-[#1E252E] text-[#C5CCD5] hover:text-[#FF5A5F] border border-[#202934] hover:border-[#FF5A5F]/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="p-2 rounded-xl bg-[#11171D] hover:bg-[#1E252E] text-[#C5CCD5] hover:text-[#E8C982] border border-[#202934] hover:border-[#E8C982]/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
                    title="Download Plain Text"
                  >
                    <FileText className="w-4 h-4 text-[#E8C982]" />
                    <span className="hidden sm:inline">TXT</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="p-2 rounded-xl bg-[#11171D] hover:bg-[#1E252E] text-[#C5CCD5] hover:text-white border border-[#202934] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4 text-[#8B949E]" />
                  </button>
                </div>
              </div>

              {/* Document Body */}
              <div className="p-6 sm:p-10 min-h-[500px] bg-[#0A0E13]">
                {viewMode === 'PREVIEW' ? (
                  <div
                    ref={printableRef}
                    id="cover-letter-printable-doc"
                    className="max-w-3xl mx-auto bg-white p-8 sm:p-12 border border-slate-200 rounded-2xl shadow-xl space-y-4 text-slate-800 text-sm leading-relaxed font-serif"
                  >
                    {editableContent.split('\n\n').map((paragraph, idx) => {
                      if (!paragraph.trim()) return null;
                      return (
                        <p key={idx} className="whitespace-pre-line leading-relaxed text-slate-800 text-[13px] sm:text-sm">
                          {paragraph.trim()}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#8B949E]">
                      <span>Editing cover letter content. Click "Save Edits" when done.</span>
                      <span className="font-mono">{editableContent.length} characters</span>
                    </div>
                    <textarea
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      rows={22}
                      className="w-full p-6 rounded-2xl bg-[#11171D] border border-[#202934] text-xs sm:text-sm leading-relaxed text-[#F8FAFC] font-mono focus:outline-none focus:border-[#E8C982]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPage;
