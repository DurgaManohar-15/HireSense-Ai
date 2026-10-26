import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobApi } from '../../../api/jobApi';
import { applicationApi } from '../../../api/applicationApi';
import {
  Briefcase,
  MapPin,
  ExternalLink,
  Zap,
  FileText,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  const loadJobDetails = async () => {
    setLoading(true);
    try {
      const [jobRes, matchRes] = await Promise.all([
        jobApi.getJobById(id),
        jobApi.getJobMatch(id),
      ]);
      setJob(jobRes);
      setMatchData(matchRes);
    } catch (err) {
      console.error('Failed to load job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!job) return;
    try {
      await jobApi.toggleSaveJob(job.id);
      setJob((prev) => ({ ...prev, saved: !prev.saved }));
    } catch (err) {
      console.error('Failed to save job:', err);
    }
  };

  const handleAddToTracker = async () => {
    if (!job) return;
    try {
      await applicationApi.createApplication({
        jobId: job.id,
        companyName: job.company,
        roleTitle: job.title,
        jobUrl: job.applyUrl,
        location: job.location,
        status: 'APPLIED',
        notes: `Application initiated from HireSense Job Details (${matchData?.overallMatchScore || 80}% Match).`,
      });
      alert(`Added ${job.company} to your Application Tracker!`);
      navigate('/applications');
    } catch (err) {
      console.error('Failed to add application:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[460px] flex items-center justify-center text-[#8B949E]">
        <div className="w-8 h-8 border-2 border-[#202934] border-t-[#E8C982] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-[#10161C] rounded-3xl border border-[#202934] p-12 text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-bold text-white">Job Not Found</h2>
        <Link to="/jobs" className="text-[#E8C982] hover:text-[#F5DFA8] inline-block text-xs font-semibold">
          ← Back to Job Search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 text-[#F8FAFC]">
      {/* Navigation Breadcrumb */}
      <Link
        to="/jobs"
        className="text-xs font-semibold text-[#8B949E] hover:text-[#E8C982] inline-flex items-center gap-2 transition-colors duration-150"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Job Discovery</span>
      </Link>

      {/* Job Header Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#151B22] via-[#10161C] to-[#0A0E13] border border-[#202934] shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-[#E8C982] uppercase tracking-wider">{job.company}</span>
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#151B22] text-[#8B949E] border border-[#202934]">
              {job.source}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8B949E] mt-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#6F7783]" /> {job.location}
            </span>
            <span>•</span>
            <span className="text-[#C5CCD5] font-medium">{job.workType}</span>
            <span>•</span>
            <span>{job.experienceLevel}</span>
            {job.salaryRange && (
              <>
                <span>•</span>
                <span className="text-[#35D07F] font-bold font-mono">{job.salaryRange}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleSave}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95 ${
              job.saved
                ? 'bg-[#E8C982]/15 text-[#E8C982] border-[#E8C982]/40 shadow-xs'
                : 'bg-[#151B22] text-[#8B949E] border-[#202934] hover:text-white hover:bg-[#1E252E]'
            }`}
          >
            <Bookmark className="w-4 h-4" /> {job.saved ? 'Bookmarked' : 'Save Job'}
          </button>

          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#151B22] hover:bg-[#1E252E] text-white border border-[#202934] hover:border-[#E8C982]/40 shadow-sm flex items-center gap-1.5 transition-all duration-150 active:scale-95"
            >
              <span>Apply Externally</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={handleAddToTracker}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] shadow-[0_2px_14px_rgba(232,201,130,0.25)] flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#05070A]" />
            <span>Add to Kanban Tracker</span>
          </button>
        </div>
      </div>

      {/* Action Fast-Track Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to={`/resume/tailor?jobId=${job.id}`}
          className="p-5 rounded-2xl bg-[#10161C] border border-[#202934] hover:border-[#E8C982]/40 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 group shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8C982]/10 border border-[#E8C982]/20 text-[#E8C982] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-[#E8C982]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-[#E8C982] transition-colors">
                Tailor My Resume for this Role
              </h4>
              <p className="text-[11px] text-[#8B949E] mt-0.5">Run bullet-by-bullet ATS alignment with before/after score.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#E8C982] group-hover:translate-x-1 transition-transform">Launch →</span>
        </Link>

        <Link
          to={`/cover-letters?jobId=${job.id}`}
          className="p-5 rounded-2xl bg-[#10161C] border border-[#202934] hover:border-[#E8C982]/40 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 group shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#20D3C2]/10 border border-[#20D3C2]/20 text-[#20D3C2] flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-[#20D3C2]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-[#20D3C2] transition-colors">
                Generate Tailored Cover Letter
              </h4>
              <p className="text-[11px] text-[#8B949E] mt-0.5">Create a personalized, tone-calibrated letter for {job.company}.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#20D3C2] group-hover:translate-x-1 transition-transform">Generate →</span>
        </Link>
      </div>

      {/* Match Breakdown & Job Description Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description & Requisites */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-[#10161C] border border-[#202934] shadow-[0_4px_20px_rgba(0,0,0,0.2)] space-y-4">
            <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">About the Opportunity</h3>
            <p className="text-xs text-[#C5CCD5] leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {job.responsibilities && (
            <div className="p-6 rounded-3xl bg-[#10161C] border border-[#202934] shadow-[0_4px_20px_rgba(0,0,0,0.2)] space-y-4">
              <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Primary Responsibilities</h3>
              <p className="text-xs text-[#C5CCD5] leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}

          {job.requirements && (
            <div className="p-6 rounded-3xl bg-[#10161C] border border-[#202934] shadow-[0_4px_20px_rgba(0,0,0,0.2)] space-y-4">
              <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Prerequisites &amp; Requirements</h3>
              <p className="text-xs text-[#C5CCD5] leading-relaxed whitespace-pre-line">{job.requirements}</p>
            </div>
          )}
        </div>

        {/* Right Col: Transparent Matching Engine */}
        <div className="space-y-6">
          {matchData && (
            <div className="p-6 rounded-3xl bg-[#10161C] border border-[#202934] shadow-[0_4px_20px_rgba(0,0,0,0.2)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#202934]">
                <div>
                  <h3 className="text-sm font-bold text-white">Transparent Match</h3>
                  <p className="text-[10px] text-[#8B949E]">Multidimensional Candidate Calibration</p>
                </div>
                <div className="text-2xl font-bold text-[#20D3C2] font-mono">
                  {matchData.overallMatchScore}%
                </div>
              </div>

              {/* Subscore progress bars */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[#8B949E] mb-1">
                    <span>Skills Match</span>
                    <span className="font-bold text-white font-mono">{matchData.skillsMatchScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#11171D] rounded-full overflow-hidden border border-[#202934]">
                    <div className="h-full bg-[#E8C982] rounded-full transition-all duration-500" style={{ width: `${matchData.skillsMatchScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#8B949E] mb-1">
                    <span>Experience Alignment</span>
                    <span className="font-bold text-white font-mono">{matchData.experienceMatchScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#11171D] rounded-full overflow-hidden border border-[#202934]">
                    <div className="h-full bg-[#20D3C2] rounded-full transition-all duration-500" style={{ width: `${matchData.experienceMatchScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#8B949E] mb-1">
                    <span>Education Prerequisite</span>
                    <span className="font-bold text-white font-mono">{matchData.educationMatchScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#11171D] rounded-full overflow-hidden border border-[#202934]">
                    <div className="h-full bg-[#35D07F] rounded-full transition-all duration-500" style={{ width: `${matchData.educationMatchScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Why this job matches you */}
              <div className="pt-3 border-t border-[#202934]">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#35D07F]" /> Why this matches you:
                </h4>
                <ul className="space-y-1.5 text-xs text-[#C5CCD5]">
                  {matchData.matchReasons?.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#35D07F]">✓</span> {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Potential Gaps */}
              {matchData.potentialGaps?.length > 0 && (
                <div className="pt-3 border-t border-[#202934]">
                  <h4 className="text-xs font-bold text-[#F2B84B] mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F2B84B]" /> Potential Skill Opportunities:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#C5CCD5]">
                    {matchData.potentialGaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#F2B84B]">△</span> {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
