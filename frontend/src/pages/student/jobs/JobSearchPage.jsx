import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobApi } from '../../../api/jobApi';
import { applicationApi } from '../../../api/applicationApi';
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Bookmark,
  ExternalLink,
  Zap,
  FileText,
  CheckCircle2,
  Filter,
  Layers,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

export const JobSearchPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState('ALL');
  const [experienceLevel, setExperienceLevel] = useState('ALL');

  useEffect(() => {
    fetchJobs();
  }, [workType, experienceLevel]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobApi.searchJobs({
        query: query || undefined,
        location: location || undefined,
        workType: workType !== 'ALL' ? workType : undefined,
        experienceLevel: experienceLevel !== 'ALL' ? experienceLevel : undefined,
      });
      setJobs(res || []);
    } catch (err) {
      console.error('Failed to search jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId) => {
    try {
      await jobApi.toggleSaveJob(jobId);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, saved: !j.saved } : j))
      );
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    }
  };

  const handleQuickApply = async (job) => {
    try {
      await applicationApi.createApplication({
        jobId: job.id,
        companyName: job.company,
        roleTitle: job.title,
        jobUrl: job.applyUrl,
        location: job.location,
        status: 'APPLIED',
        notes: `Applied via HireSense AI matching engine (${job.matchScore}% Match).`,
      });
      alert(`Application to ${job.company} registered on your Application Tracker!`);
      navigate('/applications');
    } catch (err) {
      console.error('Failed to track application:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-[#F8FAFC]">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#202934] bg-gradient-to-b from-[#151B22] via-[#10161C] to-[#0A0E13] p-8 sm:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B22] border border-[#202934] text-[11px] font-semibold tracking-wider uppercase text-[#E8C982]">
            <Sparkles className="w-3.5 h-3.5 text-[#E8C982]" />
            <span>AI Matching &amp; Discovery Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            AI Job Opportunities
          </h1>
          <p className="text-sm text-[#8B949E] font-normal max-w-2xl leading-relaxed">
            Discover curated campus and entry-level positions matched objectively against your verified skill matrix.
          </p>
        </div>

        <Link
          to="/saved-jobs"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#151B22] hover:bg-[#1E252E] text-[#F8FAFC] border border-[#202934] hover:border-[#E8C982]/30 text-xs font-semibold transition-all duration-150 self-start sm:self-auto shrink-0 shadow-sm active:scale-95"
        >
          <Bookmark className="w-4 h-4 text-[#E8C982]" />
          <span>Saved Opportunities</span>
        </Link>
      </div>

      {/* Search & Filter Workspace */}
      <div className="p-6 rounded-3xl bg-[#10161C] border border-[#202934] space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#6F7783] absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
              placeholder="Search role, company, or target skills..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#11171D] border border-[#202934] text-xs text-[#F8FAFC] placeholder-[#6F7783] focus:outline-none focus:border-[#E8C982] transition-colors"
            />
          </div>

          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-[#6F7783] absolute left-4 top-3.5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
              placeholder="Location (e.g. Hyderabad, Bengaluru, Remote)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#11171D] border border-[#202934] text-xs text-[#F8FAFC] placeholder-[#6F7783] focus:outline-none focus:border-[#E8C982] transition-colors"
            />
          </div>

          <div className="md:col-span-3">
            <button
              onClick={fetchJobs}
              className="w-full py-3 px-5 rounded-xl text-xs font-bold bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] shadow-[0_2px_14px_rgba(232,201,130,0.25)] flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#05070A]" />
              <span>Search Opportunities</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#202934] text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#8B949E] text-xs font-semibold flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#8B949E]" /> Mode:
            </span>
            {['ALL', 'REMOTE', 'HYBRID', 'ONSITE'].map((type) => (
              <button
                key={type}
                onClick={() => setWorkType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  workType === type
                    ? 'bg-[#E8C982]/15 text-[#E8C982] border border-[#E8C982]/40 shadow-xs font-bold'
                    : 'bg-[#151B22] text-[#8B949E] border border-[#202934] hover:text-[#F8FAFC] hover:bg-[#1E252E]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8B949E] text-xs font-semibold">Experience:</span>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="bg-[#151B22] border border-[#202934] text-xs px-3 py-1.5 rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#E8C982]"
            >
              <option value="ALL">All Levels</option>
              <option value="Fresher">Fresher (Campus)</option>
              <option value="0-1 Years">0-1 Years</option>
              <option value="0-2 Years">0-2 Years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#8B949E] text-xs gap-3">
          <div className="w-8 h-8 border-2 border-[#202934] border-t-[#E8C982] rounded-full animate-spin"></div>
          <span>Matching calibrated opportunities...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-[#10161C] rounded-3xl border border-[#202934] space-y-3">
          <Briefcase className="w-12 h-12 text-[#6F7783] mx-auto" />
          <h3 className="text-base font-bold text-[#F8FAFC]">No Matching Vacancies Found</h3>
          <p className="text-xs text-[#8B949E]">Try broadening your search query or location filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl bg-[#10161C] border border-[#202934] hover:border-[#E8C982]/40 transition-all duration-200 flex flex-col justify-between group shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#8B949E] block uppercase tracking-wider">{job.company}</span>
                    <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#E8C982] transition-colors duration-150 mt-0.5">
                      {job.title}
                    </h3>
                  </div>

                  {/* Match Score Badge */}
                  <div className="shrink-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#20D3C2]/10 text-[#20D3C2] border border-[#20D3C2]/20 inline-block font-mono">
                      {job.matchScore}% Match
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#8B949E] mb-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#6F7783]" /> {job.location}
                  </span>
                  <span>•</span>
                  <span className="text-[#C5CCD5] font-medium">{job.workType}</span>
                  <span>•</span>
                  <span>{job.experienceLevel}</span>
                </div>

                {job.salaryRange && (
                  <div className="text-xs font-semibold text-[#35D07F] mb-3 font-mono">
                    {job.salaryRange}
                  </div>
                )}

                <p className="text-xs text-[#8B949E] line-clamp-2 leading-relaxed mb-4">
                  {job.description}
                </p>

                {/* Skills tags */}
                {job.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.skills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-[#151B22] border border-[#202934] text-[#C5CCD5]"
                      >
                        {s}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#151B22] text-[#6F7783]">
                        +{job.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-[#202934] space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="py-2 px-3 rounded-xl bg-[#151B22] hover:bg-[#1E252E] text-[#F8FAFC] font-semibold text-center border border-[#202934] hover:border-[#E8C982]/30 transition-all duration-150 active:scale-95"
                  >
                    Match Details
                  </Link>
                  <button
                    onClick={() => handleToggleSave(job.id)}
                    className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95 ${
                      job.saved
                        ? 'bg-[#E8C982]/15 text-[#E8C982] border-[#E8C982]/40 shadow-xs'
                        : 'bg-[#151B22] text-[#8B949E] border-[#202934] hover:text-[#F8FAFC] hover:bg-[#1E252E]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{job.saved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    to={`/resume/tailor?jobId=${job.id}`}
                    className="py-2 px-3 rounded-xl bg-[#151B22] hover:bg-[#1E252E] text-[#F8FAFC] border border-[#202934] hover:border-[#E8C982]/30 text-center font-medium flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#E8C982]" />
                    <span>Tailor Resume</span>
                  </Link>
                  <button
                    onClick={() => handleQuickApply(job)}
                    className="py-2 px-3 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#05070A] font-bold flex items-center justify-center gap-1.5 shadow-[0_2px_14px_rgba(232,201,130,0.2)] transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#05070A]" />
                    <span>Track Apply</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
