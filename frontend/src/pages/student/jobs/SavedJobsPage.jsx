import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../../../api/jobApi';
import {
  Bookmark,
  MapPin,
  Briefcase,
  Zap,
  FileText,
  ExternalLink,
  ArrowLeft,
  Trash2,
} from 'lucide-react';

export const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    setLoading(true);
    try {
      const res = await jobApi.getSavedJobs();
      setSavedJobs(res || []);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId) => {
    try {
      await jobApi.toggleSaveJob(jobId);
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Failed to remove saved job:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 text-[#F8FAFC]">
      <Link
        to="/jobs"
        className="text-xs font-semibold text-[#8B949E] hover:text-[#E8C982] inline-flex items-center gap-2 transition-colors duration-150"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Job Discovery</span>
      </Link>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#202934] bg-gradient-to-b from-[#151B22] via-[#10161C] to-[#0A0E13] p-8 sm:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B22] border border-[#202934] text-[11px] font-semibold tracking-wider uppercase text-[#E8C982]">
            <Bookmark className="w-3.5 h-3.5 text-[#E8C982]" />
            <span>Shortlisted Vacancies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Bookmarked Opportunities</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8B949E] max-w-xl">
            Your shortlisted vacancies. Tailor resumes or prepare custom cover letters for each.
          </p>
        </div>
        <span className="text-xs font-bold text-[#E8C982] bg-[#151B22] px-4 py-2.5 rounded-xl border border-[#202934] font-mono shadow-inner">
          {savedJobs.length} Saved
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#8B949E] text-xs gap-3">
          <div className="w-8 h-8 border-2 border-[#202934] border-t-[#E8C982] rounded-full animate-spin"></div>
          <span>Loading shortlisted opportunities...</span>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-20 bg-[#10161C] rounded-3xl border border-[#202934] space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#151B22] border border-[#202934] flex items-center justify-center mx-auto text-[#8B949E]">
            <Bookmark className="w-7 h-7 text-[#8B949E]" />
          </div>
          <h3 className="text-base font-bold text-white">No Saved Jobs Yet</h3>
          <p className="text-xs text-[#8B949E] max-w-md mx-auto">
            Explore vacancies and click "Save" to organize your target applications.
          </p>
          <div className="pt-2">
            <Link
              to="/jobs"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] inline-block shadow-[0_2px_14px_rgba(232,201,130,0.25)] transition-all duration-150 active:scale-95 cursor-pointer"
            >
              Explore Opportunities
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl bg-[#10161C] border border-[#202934] hover:border-[#E8C982]/40 transition-all duration-200 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">{job.company}</span>
                    <h3 className="text-base font-bold text-white mt-0.5 group-hover:text-[#E8C982] transition-colors duration-150">{job.title}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#20D3C2]/10 text-[#20D3C2] border border-[#20D3C2]/20 font-mono shrink-0">
                    {job.matchScore}% Match
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#8B949E] mb-3">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#6F7783]" /> {job.location}
                  </span>
                  <span>•</span>
                  <span className="text-[#C5CCD5] font-medium">{job.workType}</span>
                </div>

                <p className="text-xs text-[#8B949E] line-clamp-2 leading-relaxed mb-4">
                  {job.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#202934] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/resume/tailor?jobId=${job.id}`}
                    className="px-3.5 py-2 rounded-xl bg-[#151B22] hover:bg-[#1E252E] text-[#F8FAFC] border border-[#202934] hover:border-[#E8C982]/30 font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#E8C982]" />
                    <span>Tailor Resume</span>
                  </Link>
                  <Link
                    to={`/cover-letters?jobId=${job.id}`}
                    className="px-3.5 py-2 rounded-xl bg-[#151B22] hover:bg-[#1E252E] text-[#F8FAFC] border border-[#202934] hover:border-[#E8C982]/30 font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#8B949E]" />
                    <span>Cover Letter</span>
                  </Link>
                </div>

                <button
                  onClick={() => handleRemove(job.id)}
                  className="p-2 rounded-xl text-[#8B949E] hover:text-[#FF5A5F] hover:bg-[#FF5A5F]/10 border border-transparent hover:border-[#FF5A5F]/20 transition-all duration-150 cursor-pointer active:scale-90"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
