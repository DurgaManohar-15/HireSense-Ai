import React, { useState, useEffect, useRef } from 'react';
import { resumeApi } from '../../../api/resumeApi';
import { Link } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  Trash2,
  Eye,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  Briefcase,
  Target,
  FileCheck,
  Check,
  XCircle,
  Copy,
  Sparkles,
} from 'lucide-react';

export const ResumeUploadPage = () => {
  const fileInputRef = useRef(null);

  // Analysis Mode: 'JOB_DESCRIPTION' (Resume + JD) or 'STANDALONE' (Single Resume)
  const [analysisMode, setAnalysisMode] = useState('JOB_DESCRIPTION');

  // Job Description form state
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  const [resumes, setResumes] = useState([]);
  const [savedJds, setSavedJds] = useState([]);
  const [selectedJdId, setSelectedJdId] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Live ATS Analysis Result state with LocalStorage persistence for refresh stability
  const [activeAnalysis, setActiveAnalysis] = useState(() => {
    try {
      const saved = localStorage.getItem('hiresense_latest_analysis');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Helper to persist active analysis
  const updateActiveAnalysis = (data) => {
    setActiveAnalysis(data);
    try {
      if (data) {
        localStorage.setItem('hiresense_latest_analysis', JSON.stringify(data));
      } else {
        localStorage.removeItem('hiresense_latest_analysis');
      }
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  const loadResumes = async () => {
    try {
      const [res, jdRes] = await Promise.allSettled([
        resumeApi.getMyResumes(),
        resumeApi.getMyJobDescriptions(),
      ]);

      if (res.status === 'fulfilled' && res.value?.success) {
        const list = res.value.data || [];
        setResumes(list);

        const active = list.find((r) => r.active) || list[0];
        if (active && active.analyzed) {
          fetchAnalysisForResume(active.id);
        }
      }

      if (jdRes.status === 'fulfilled' && jdRes.value?.success) {
        setSavedJds(jdRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisForResume = async (resumeId) => {
    try {
      setLoadingAnalysis(true);
      const res = await resumeApi.getResumeAnalysis(resumeId);
      if (res?.success && res?.data) {
        updateActiveAnalysis(res.data);
      }
    } catch (err) {
      console.warn('Could not pre-fetch analysis:', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF documents (.pdf) are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5 MB maximum limit.');
      return;
    }

    setSelectedFile(file);
  };

  // Upload + Run ATS Analysis based on the selected mode
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile && !activeResume) {
      setErrorMessage('Please select a PDF resume to upload.');
      return;
    }

    if (analysisMode === 'JOB_DESCRIPTION' && !jobDescription.trim()) {
      setErrorMessage('Please paste or enter the Job Description (JD) text to perform JD Matching.');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let currentResumeId = null;

      // 1. Upload new resume if a new file is chosen
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await resumeApi.uploadResume(formData);

        if (uploadRes?.success && uploadRes?.data) {
          currentResumeId = uploadRes.data.id;
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          throw new Error('Resume upload failed.');
        }
      } else if (activeResume) {
        currentResumeId = activeResume.id;
      }

      setSuccessMessage('Extracting text and running AI ATS Diagnostic...');

      // 2. Trigger AI Analysis with optional JD payload
      const payload = {
        mode: analysisMode,
        jobDescription: analysisMode === 'JOB_DESCRIPTION' ? jobDescription : null,
        targetRole: targetRole.trim() || 'Software Engineer',
        targetCompany: targetCompany.trim() || 'Tech Industry',
      };

      const analysisRes = await resumeApi.analyzeResume(currentResumeId, payload);
      if (analysisRes?.success && analysisRes?.data) {
        updateActiveAnalysis(analysisRes.data);
        const ats = analysisRes.data.atsOrientedScore || analysisRes.data.overallScore;
        setSuccessMessage(
          analysisMode === 'JOB_DESCRIPTION'
            ? `ATS & Job Description Match Complete! Score: ${ats}%`
            : `Standalone Resume Diagnostic Complete! ATS Score: ${ats}%`
        );
      }

      // Refresh list
      const listRes = await resumeApi.getMyResumes();
      if (listRes?.success) setResumes(listRes.data || []);
    } catch (err) {
      console.error('Analysis failed:', err);
      setErrorMessage(err.message || 'Failed to analyze resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleReAnalyze = async (resumeId) => {
    setAnalyzingId(resumeId);
    setErrorMessage('');
    try {
      const payload = {
        mode: analysisMode,
        jobDescription: analysisMode === 'JOB_DESCRIPTION' ? jobDescription : null,
        targetRole: targetRole.trim() || 'Software Engineer',
        targetCompany: targetCompany.trim() || 'Tech Industry',
      };

      const res = await resumeApi.analyzeResume(resumeId, payload);
      if (res?.success && res?.data) {
        updateActiveAnalysis(res.data);
        setSuccessMessage(`AI Diagnostic updated! ATS Score: ${res.data.atsOrientedScore || res.data.overallScore}%`);
        const listRes = await resumeApi.getMyResumes();
        if (listRes?.success) setResumes(listRes.data || []);
      }
    } catch (err) {
      setErrorMessage(err.message || 'AI resume analysis failed.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Delete this resume version and its associated analysis history?')) return;
    try {
      await resumeApi.deleteResume(resumeId);
      updateActiveAnalysis(null);
      loadResumes();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete resume.');
    }
  };

  const handleSampleJd = (roleKey) => {
    if (roleKey === 'software_engineer') {
      setTargetRole('Software Engineer');
      setTargetCompany('Google / Microsoft / Amazon');
      setJobDescription(
        'We are seeking a Software Engineer proficient in Java, Spring Boot, React, and SQL. Responsibilities include building scalable REST APIs, microservices, containerization with Docker, and cloud deployments on AWS. Knowledge of Data Structures, Algorithms, Git, and automated testing is required.'
      );
    } else if (roleKey === 'full_stack') {
      setTargetRole('Full Stack Developer');
      setTargetCompany('Fintech / SaaS Startup');
      setJobDescription(
        'Looking for a Full Stack Developer experienced with TypeScript, React, Node.js, Express, PostgreSQL, MongoDB, and Redis. Experience with Docker, Kubernetes, CI/CD pipelines, and microservices architecture is strongly preferred.'
      );
    } else if (roleKey === 'data_ai') {
      setTargetRole('Data Scientist / AI Engineer');
      setTargetCompany('AI Enterprise Solutions');
      setJobDescription(
        'We are hiring an AI/ML Engineer skilled in Python, TensorFlow, PyTorch, SQL, Pandas, NumPy, and REST APIs. Experience in Large Language Models (LLMs), machine learning algorithms, and cloud deployment on AWS/Azure is required.'
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const activeResume = resumes.find((r) => r.active) || (resumes.length > 0 ? resumes[0] : null);

  // Parse structured data safely
  const result = activeAnalysis?.analysis || {};
  const strengths = Array.isArray(result.strengths) ? result.strengths : [];
  const weaknesses = Array.isArray(result.weaknesses) ? result.weaknesses : [];
  const extractedSkills = Array.isArray(result.extractedSkills) ? result.extractedSkills : [];
  const recommendations = Array.isArray(result.recommendations) ? result.recommendations : [];

  // JD specific parsed fields
  const isJdMode = result.mode === 'JOB_DESCRIPTION' || result.jdMatchScore != null;
  const jdMatchingSkills = Array.isArray(result.jdMatchingSkills) ? result.jdMatchingSkills : [];
  const jdMissingSkills = Array.isArray(result.jdMissingSkills) ? result.jdMissingSkills : [];
  const jdMatchScore = result.jdMatchScore ?? null;

  const overallScore = activeAnalysis?.overallScore ?? result.overallScore ?? null;
  const atsScore = activeAnalysis?.atsOrientedScore ?? result.atsOrientedScore ?? null;

  if (loading) {
    return (
      <div className="min-h-[460px] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-500">Loading Resume Analyzer &amp; ATS Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#202934] bg-gradient-to-b from-[#151D26] via-[#10161C] to-[#0A0E13] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151D26] border border-[#202934] text-[11px] font-semibold tracking-wider uppercase text-[#E8C982]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E8C982]" />
            <span>Resume ATS Review &amp; Job Match</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            ATS &amp; Job Description Analyzer
          </h1>
          <p className="text-sm text-[#8E9CAE] font-normal max-w-xl leading-relaxed">
            Evaluate your resume against specific job descriptions or run standalone ATS compliance checks to identify formatting and keyword gaps.
          </p>
        </div>
      </div>

      {/* MODE SELECTION TABS */}
      <div className="bg-[#10161C] p-1.5 rounded-2xl border border-[#202934] flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => setAnalysisMode('JOB_DESCRIPTION')}
          className={`flex-1 py-3 px-5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            analysisMode === 'JOB_DESCRIPTION'
              ? 'bg-[#E8C982] text-[#0B0E14] font-bold shadow-md shadow-[#E8C982]/15'
              : 'text-[#8E9CAE] hover:text-white hover:bg-[#151D26]'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Resume + Job Description Match</span>
        </button>

        <button
          type="button"
          onClick={() => setAnalysisMode('STANDALONE')}
          className={`flex-1 py-3 px-5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            analysisMode === 'STANDALONE'
              ? 'bg-[#E8C982] text-[#0B0E14] font-bold shadow-md shadow-[#E8C982]/15'
              : 'text-[#8E9CAE] hover:text-white hover:bg-[#151D26]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Standalone Resume ATS Check</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center gap-3 text-rose-300 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MAIN UPLOAD & CONFIGURATION CARD */}
      <div className="bg-[#10161C] rounded-2xl md:rounded-3xl border border-[#202934] p-6 sm:p-8 shadow-xl space-y-6 hover:border-[#E8C982]/30 transition-all">
        <div>
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#E8C982]" />
            <span>
              {analysisMode === 'JOB_DESCRIPTION'
                ? 'Step 1: Upload Resume & Provide Job Description'
                : 'Upload Resume for Standalone ATS Evaluation'}
            </span>
          </h2>
          <p className="text-xs text-[#8E9CAE]">
            {analysisMode === 'JOB_DESCRIPTION'
              ? 'Matches your resume text directly against the Job Description to compute required skill alignment, missing keywords, and custom recommendations.'
              : 'Evaluates formatting, technical keywords, section completeness, and placement readiness benchmarks.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Drag/Drop Zone */}
          <div className={`${analysisMode === 'JOB_DESCRIPTION' ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
            <label className="block text-xs font-bold text-[#A9B0BA] uppercase tracking-wider mb-2">
              Resume Document (PDF)
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all h-full min-h-[160px] flex flex-col items-center justify-center hover:border-[#E8C982]/50 ${
                dragActive
                  ? 'border-[#E8C982] bg-[#151D26]'
                  : selectedFile
                  ? 'border-emerald-500 bg-[#0E1F18]'
                  : activeResume
                  ? 'border-[#2A3543] bg-[#11171D]'
                  : 'border-[#202934] hover:border-[#2E3B4B] bg-[#0E1318]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-10 h-10 rounded-xl bg-[#151D26] border border-[#202934] text-[#E8C982] flex items-center justify-center mb-2 shadow-sm">
                <FileText className="w-5 h-5 text-[#E8C982]" />
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-xs font-bold text-white line-clamp-1">{selectedFile.name}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    {formatFileSize(selectedFile.size)} • Ready for analysis
                  </p>
                </div>
              ) : activeResume ? (
                <div>
                  <p className="text-xs font-bold text-white line-clamp-1">{activeResume.originalFilename}</p>
                  <p className="text-[11px] text-[#8E9CAE] mt-0.5">
                    Current Version (v{activeResume.versionNumber}) • Click to replace PDF
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-[#CBD5E1]">
                    <span className="text-[#E8C982] underline underline-offset-2">Click to browse</span> or drag PDF
                  </p>
                  <p className="text-[10px] text-[#6E7C8E] mt-0.5">Max 5 MB • PDF format</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Description Inputs (Visible in JOB_DESCRIPTION Mode) */}
          {analysisMode === 'JOB_DESCRIPTION' && (
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="block text-xs font-bold text-[#A9B0BA] uppercase tracking-wider">
                  Target Job Description (JD)
                </label>
                <div className="flex items-center gap-1.5 text-xs text-[#8E9CAE] flex-wrap">
                  <span className="text-[11px] uppercase font-bold tracking-wider">Samples:</span>
                  <button
                    type="button"
                    onClick={() => handleSampleJd('software_engineer')}
                    className="px-2.5 py-1 rounded-lg bg-[#11171D] hover:bg-[#1C2530] text-[#CBD5E1] hover:text-[#E8C982] border border-[#202934] text-[11px] transition-colors cursor-pointer"
                  >
                    SWE (Java)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleJd('full_stack')}
                    className="px-2.5 py-1 rounded-lg bg-[#11171D] hover:bg-[#1C2530] text-[#CBD5E1] hover:text-[#E8C982] border border-[#202934] text-[11px] transition-colors cursor-pointer"
                  >
                    Full Stack
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleJd('data_ai')}
                    className="px-2.5 py-1 rounded-lg bg-[#11171D] hover:bg-[#1C2530] text-[#CBD5E1] hover:text-[#E8C982] border border-[#202934] text-[11px] transition-colors cursor-pointer"
                  >
                    AI/ML
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description or requirements here (languages, frameworks, databases)..."
                className="w-full text-xs p-3.5 rounded-xl bg-[#11171D] border border-[#202934] focus:border-[#E8C982]/60 text-white placeholder-[#5A6878] resize-none font-mono focus:outline-none transition-colors"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Target Role (e.g. Software Engineer)"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#11171D] border border-[#202934] text-white placeholder-[#5A6878] focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Target Company (e.g. Google / Microsoft)"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#11171D] border border-[#202934] text-white placeholder-[#5A6878] focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#202934]">
          <div className="text-xs text-[#8E9CAE]">
            {analysisMode === 'JOB_DESCRIPTION'
              ? 'Calculates exact skill overlap & tailored ATS score against this JD.'
              : 'Evaluates standard ATS compliance, formatting, and overall placement readiness.'}
          </div>

          <button
            type="button"
            onClick={handleUploadAndAnalyze}
            disabled={uploading || (!selectedFile && !activeResume)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#0B0E14] font-bold text-xs shadow-lg shadow-[#E8C982]/15 transition-all disabled:opacity-40 cursor-pointer active:scale-95"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0B0E14] border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Resume &amp; Computing ATS Score...</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4 text-[#0B0E14]" />
                <span>
                  {analysisMode === 'JOB_DESCRIPTION'
                    ? 'Analyze Resume vs Job Description'
                    : 'Upload & Extract Text (Run ATS Analysis)'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* LIVE PERSISTENT ATS DIAGNOSTIC RESULTS CARD */}
      {activeAnalysis && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Score Card */}
          <div className="bg-[#10161C] rounded-2xl md:rounded-3xl p-6 md:p-8 text-[#CBD5E1] border border-[#202934] shadow-xl hover:border-[#E8C982]/30 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#202934]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {isJdMode
                      ? 'Job Description Matching Active'
                      : 'Standalone Placement Benchmark Active'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">ATS Evaluation &amp; Diagnostic Result</h2>
                <p className="text-xs text-[#8E9CAE] mt-1">
                  Evaluated for <strong className="text-white">{activeAnalysis.targetRole || 'Software Engineer'}</strong> ({activeAnalysis.targetCompany || 'Tech Industry'})
                </p>
              </div>

              {/* Score Badges Pod */}
              <div className="flex items-center gap-4 bg-[#11171D] p-4 rounded-2xl border border-[#202934]">
                <div className="text-center px-3">
                  <span className="text-3xl font-black text-white">{overallScore}%</span>
                  <span className="text-[10px] text-[#8E9CAE] block uppercase font-bold mt-0.5">Overall Fit</span>
                </div>
                <div className="w-[1px] h-10 bg-[#202934]"></div>
                <div className="text-center px-3">
                  <span className="text-3xl font-black text-emerald-400">{atsScore}%</span>
                  <span className="text-[10px] text-emerald-400 block uppercase font-bold mt-0.5">ATS Score</span>
                </div>
                {isJdMode && jdMatchScore != null && (
                  <>
                    <div className="w-[1px] h-10 bg-[#202934]"></div>
                    <div className="text-center px-3">
                      <span className="text-3xl font-black text-[#E8C982]">{jdMatchScore}%</span>
                      <span className="text-[10px] text-[#E8C982] block uppercase font-bold mt-0.5">JD Match</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Target Role Match Summary */}
            {result.targetRoleMatchSummary && (
              <div className="mt-6 p-4 bg-[#11171D] rounded-xl border border-[#202934]">
                <h4 className="text-xs font-bold text-[#E8C982] uppercase tracking-wider mb-1">Target Role Match Summary</h4>
                <p className="text-xs text-[#8E9CAE] leading-relaxed font-medium">{result.targetRoleMatchSummary}</p>
              </div>
            )}
          </div>

          {/* JOB DESCRIPTION SPECIFIC SKILL MATRIX (If JD Mode) */}
          {isJdMode && (
            <div className="bg-[#10161C] rounded-2xl md:rounded-3xl border border-[#202934] p-6 shadow-xl hover:border-[#E8C982]/30 transition-all">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#E8C982]" />
                <span>Job Description Keyword &amp; Skill Alignment</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matching Skills */}
                <div className="p-5 bg-[#11171D] rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Matching Skills in Resume ({jdMatchingSkills.length})</span>
                  </span>
                  {jdMatchingSkills.length === 0 ? (
                    <p className="text-xs text-[#6E7C8E] italic">No direct overlap detected with JD keywords.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {jdMatchingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs font-medium bg-[#0E1F18] text-emerald-300 rounded-lg border border-emerald-500/30"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing Skills from JD */}
                <div className="p-5 bg-[#11171D] rounded-2xl border border-rose-500/20 hover:border-rose-500/40 transition-colors">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Missing Skills from Job Description ({jdMissingSkills.length})</span>
                  </span>
                  {jdMissingSkills.length === 0 ? (
                    <p className="text-xs text-emerald-400 font-semibold">Your resume covers all required JD skills!</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {jdMissingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs font-medium bg-[#1F1214] text-rose-300 rounded-lg border border-rose-500/30"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths */}
            <div className="bg-[#10161C] rounded-2xl border border-[#202934] p-6 shadow-sm hover:border-emerald-500/30 transition-all">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Key Strengths &amp; Evidence ({strengths.length})</span>
              </h3>
              {strengths.length === 0 ? (
                <p className="text-xs text-[#6E7C8E] italic">No specific strengths listed.</p>
              ) : (
                <ul className="space-y-2">
                  {strengths.map((s, idx) => (
                    <li key={idx} className="text-xs text-[#CBD5E1] flex items-start gap-2.5 bg-[#11171D] p-3 rounded-xl border border-[#202934]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Weaknesses / Gaps */}
            <div className="bg-[#10161C] rounded-2xl border border-[#202934] p-6 shadow-sm hover:border-rose-500/30 transition-all">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <span>Identified Weaknesses &amp; Gaps ({weaknesses.length})</span>
              </h3>
              {weaknesses.length === 0 ? (
                <p className="text-xs text-[#6E7C8E] italic">No major weaknesses detected.</p>
              ) : (
                <ul className="space-y-2">
                  {weaknesses.map((w, idx) => (
                    <li key={idx} className="text-xs text-[#CBD5E1] flex items-start gap-2.5 bg-[#11171D] p-3 rounded-xl border border-[#202934]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Extracted Skills */}
          <div className="bg-[#10161C] rounded-2xl border border-[#202934] p-6 shadow-sm hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#E8C982]" />
                <h3 className="font-bold text-white text-sm">Verified Skills in Resume ({extractedSkills.length})</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero-Fabrication
              </span>
            </div>

            {extractedSkills.length === 0 ? (
              <p className="text-xs text-[#6E7C8E] italic">No specific technical keywords detected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-semibold bg-[#11171D] text-[#CBD5E1] hover:text-[#E8C982] rounded-xl border border-[#202934] shadow-sm transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-[#10161C] rounded-2xl border border-[#202934] p-6 shadow-sm hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#E8C982]" />
                <span>Actionable Recommendations for Higher ATS Score ({recommendations.length})</span>
              </h3>
              {activeResume && (
                <Link
                  to={`/resume/analysis/${activeResume.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#E8C982] hover:text-[#F5DFA8] transition-colors"
                >
                  <span>Full Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {recommendations.length === 0 ? (
              <p className="text-xs text-[#6E7C8E] italic">No recommendations.</p>
            ) : (
              <div className="space-y-2.5">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3.5 bg-[#11171D] rounded-xl border border-[#202934] shadow-sm flex items-start gap-3 hover:border-[#E8C982]/20 transition-all">
                    <span className="w-6 h-6 rounded-lg bg-[#151D26] text-[#E8C982] border border-[#202934] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed font-medium">{rec}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resume Version History Table */}
      <div className="bg-[#10161C] rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl overflow-hidden hover:border-[#E8C982]/30 transition-all">
        <div className="p-6 border-b border-[#202934]">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E8C982]" />
            <span>Resume Version History ({resumes.length})</span>
          </h3>
          <p className="text-xs text-[#8E9CAE] mt-1">
            Historical versions and analyses are retained to monitor improvements across your job search.
          </p>
        </div>

        {resumes.length === 0 ? (
          <div className="p-12 text-center text-[#6E7C8E] text-xs">No resume uploaded yet. Upload a PDF above to begin.</div>
        ) : (
          <div className="divide-y divide-[#202934]">
            {resumes.map((r) => (
              <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#151D26]/50 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#151D26] border border-[#202934] text-[#E8C982] flex items-center justify-center font-bold text-xs">
                    v{r.versionNumber}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{r.originalFilename}</span>
                      {r.active && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-[#8E9CAE] mt-1">
                      <span>{formatFileSize(r.fileSizeBytes)}</span>
                      <span>•</span>
                      <span>{new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      {r.latestScore && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-emerald-400">Score: {r.latestScore}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleReAnalyze(r.id)}
                    disabled={analyzingId === r.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11171D] hover:bg-[#1C2530] text-[#CBD5E1] hover:text-[#E8C982] border border-[#202934] text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${analyzingId === r.id ? 'animate-spin text-[#E8C982]' : ''}`} />
                    <span>{r.analyzed ? 'Re-Analyze' : 'Analyze'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-[#6E7C8E] hover:text-rose-400 hover:bg-[#151D26] rounded-lg transition-colors cursor-pointer active:scale-95"
                    title="Delete Version"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ResumeUploadPage;
