import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Search, Users, Code, Award, CheckCircle2, 
  HelpCircle, ChevronRight, ChevronDown, Briefcase, FileText, Sparkles,
  ArrowUpRight, Target, ShieldCheck, DollarSign, Brain, Layers,
  ExternalLink, X, Compass, ChevronUp, TrendingUp, MapPin, Globe,
  BriefcaseBusiness, Bookmark, BookOpen, Star, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { companyPrepApi } from '../../../api/companyPrepApi';
import toast from 'react-hot-toast';

const SECTOR_FILTERS = [
  { id: 'ALL', label: 'All Fortune 500 & Leaders' },
  { id: 'FAANG', label: 'FAANG & Big Tech' },
  { id: 'FINTECH', label: 'Fintech & Investment Banking' },
  { id: 'AI', label: 'AI Compute & Hardware' },
  { id: 'CONSULTING', label: 'Big 4 & Advisory' },
  { id: 'DIGITAL', label: 'Global IT & Enterprise' }
];

export default function CompanyPrepPage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('google');
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('roles'); // 'roles', 'workflow', 'technical', 'aptitude', 'hr'
  const [selectedSector, setSelectedSector] = useState('ALL');
  
  // Search and Suggestions
  const [searchFilter, setSearchFilter] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Accordion and modal states
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await companyPrepApi.getCompanies();
      const list = res?.data || res || [];
      setCompanies(list);
      if (list.length > 0) {
        const initial = list[0];
        setSelectedCompanyId(initial.id);
        setCompanyDetails(initial);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      toast.error('Could not load company preparation guides');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyById = async (id) => {
    try {
      setDetailsLoading(true);
      setSelectedCompanyId(id);
      setShowSuggestions(false);
      setExpandedQuestion(null);
      setSelectedRoleIndex(0);

      const res = await companyPrepApi.getCompanyDetails(id);
      const data = res?.data || res;
      setCompanyDetails(data);

      // If this was a dynamically generated company not yet in the list, add it
      setCompanies(prev => {
        if (!prev.some(c => c.id === data.id)) {
          return [data, ...prev];
        }
        return prev;
      });
      toast.success(`Loaded ${data.companyName} intelligence package!`);
    } catch (err) {
      console.error('Error loading company details:', err);
      toast.error('Failed to load company curriculum');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSelectSuggestion = (company) => {
    loadCompanyById(company.id);
    setSearchFilter('');
    setShowSuggestions(false);
  };

  const handleDynamicSearch = (query) => {
    if (!query.trim()) return;
    loadCompanyById(query.trim().toLowerCase());
    setSearchFilter('');
    setShowSuggestions(false);
  };

  // Filter companies based on search query and sector tab
  const filteredCompanies = companies.filter(c => {
    const q = searchFilter.toLowerCase().trim();
    const matchesSearch = !q || 
      c.companyName?.toLowerCase().includes(q) ||
      c.sector?.toLowerCase().includes(q) ||
      c.tier?.toLowerCase().includes(q) ||
      c.focusSkills?.some(s => s.toLowerCase().includes(q)) ||
      c.roles?.some(r => r.roleTitle.toLowerCase().includes(q));

    let matchesSector = true;
    if (selectedSector === 'FAANG') {
      matchesSector = c.tier?.toLowerCase().includes('faang') || c.companyName === 'Google' || c.companyName === 'Microsoft' || c.companyName === 'Amazon' || c.companyName === 'Apple' || c.companyName === 'Meta';
    } else if (selectedSector === 'FINTECH') {
      matchesSector = c.sector?.toLowerCase().includes('fintech') || c.sector?.toLowerCase().includes('trading') || c.tier?.toLowerCase().includes('fintech') || c.tier?.toLowerCase().includes('investment');
    } else if (selectedSector === 'AI') {
      matchesSector = c.sector?.toLowerCase().includes('ai') || c.sector?.toLowerCase().includes('semiconductors');
    } else if (selectedSector === 'CONSULTING') {
      matchesSector = c.tier?.toLowerCase().includes('consulting') || c.sector?.toLowerCase().includes('advisory');
    } else if (selectedSector === 'DIGITAL') {
      matchesSector = c.tier?.toLowerCase().includes('mass') || c.sector?.toLowerCase().includes('enterprise');
    }

    return matchesSearch && matchesSector;
  });

  // Top suggestions for the search box
  const searchSuggestions = searchFilter.trim().length > 0
    ? companies.filter(c => 
        c.companyName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.sector?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.focusSkills?.some(s => s.toLowerCase().includes(searchFilter.toLowerCase())) ||
        c.roles?.some(r => r.roleTitle.toLowerCase().includes(searchFilter.toLowerCase()))
      )
    : [];

  const quickPillOptions = ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'NVIDIA', 'Deloitte', 'TCS', 'Razorpay', 'Apple', 'Meta'];

  const toggleQuestion = (idx) => {
    setExpandedQuestion(expandedQuestion === idx ? null : idx);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Fortune 500 Placement &amp; Salary Intelligence
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Live recruitment breakdowns, role-wise base &amp; stock compensation packages, verified interview rounds, and previous coding challenges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/jobs"
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 transition shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Active Job Vacancies
          </Link>
          <Link
            to="/interview"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Mock Interview Room
          </Link>
        </div>
      </div>

      {/* Interactive Search Bar with Live Suggestions Dropdown */}
      <div className="space-y-3" ref={searchContainerRef}>
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search any Fortune 500 company (e.g. Google, Microsoft, Amazon, Netflix, Goldman Sachs, Uber)..."
              value={searchFilter}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchFilter.trim()) {
                  handleDynamicSearch(searchFilter);
                }
              }}
              className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            {searchFilter && (
              <button
                onClick={() => {
                  setSearchFilter('');
                  setShowSuggestions(false);
                }}
                className="absolute right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>Verified Fortune 500 Intelligence</span>
                <span>{searchSuggestions.length} Matching Leaders</span>
              </div>

              {searchSuggestions.length > 0 ? (
                searchSuggestions.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleSelectSuggestion(company)}
                    className="w-full px-4 py-3.5 text-left hover:bg-blue-50/70 dark:hover:bg-blue-950/40 flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center flex-shrink-0 shadow-sm">
                        {company.companyName?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                            {company.companyName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">
                            {company.fortuneRank || company.tier}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {company.sector} &bull; {company.headquarters}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                          {company.packageRange}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {company.roles?.length || 2} Verified Roles
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
                    </div>
                  </button>
                ))
              ) : searchFilter.trim().length > 0 ? (
                <button
                  onClick={() => handleDynamicSearch(searchFilter)}
                  className="w-full p-4 text-left hover:bg-blue-50/70 dark:hover:bg-blue-950/40 flex items-center justify-between text-blue-600 dark:text-blue-400 transition"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-bold block">
                        Search &amp; Generate Placement Guide for "{searchFilter}"
                      </span>
                      <span className="text-xs text-gray-500">
                        Query live Fortune 500 database for roles, CTC, and syllabus
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Quick Pick Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Quick Pick:
          </span>
          {quickPillOptions.map((pill) => (
            <button
              key={pill}
              onClick={() => {
                const match = companies.find(c => c.companyName?.toLowerCase() === pill.toLowerCase());
                if (match) {
                  loadCompanyById(match.id);
                } else {
                  handleDynamicSearch(pill);
                }
              }}
              className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 text-gray-700 dark:text-gray-300 rounded-full font-semibold transition whitespace-nowrap"
            >
              {pill}
            </button>
          ))}
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-xs ml-1"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Sector Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-b border-gray-200 dark:border-gray-800">
          {SECTOR_FILTERS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedSector(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedSector === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Directory Left & Company Details Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Company Directory List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Company Catalog ({filteredCompanies.length})
            </span>
          </div>

          <div className="space-y-2.5 max-h-[850px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading Fortune 500 company directory...
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-3">
                <Building2 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  No company matching "{searchFilter}" in this sector
                </p>
                <button
                  onClick={() => handleDynamicSearch(searchFilter)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Generate Intelligence for "{searchFilter}"
                </button>
              </div>
            ) : (
              filteredCompanies.map((c) => {
                const isSelected = selectedCompanyId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => loadCompanyById(c.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shadow-sm ${
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}>
                        {c.companyName?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            {c.companyName}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                            {c.fortuneRank || c.tier}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          {c.packageRange}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Deep-Dive Curriculum, Roles, and Questions */}
        <div className="lg:col-span-8">
          {detailsLoading ? (
            <div className="p-16 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading deep-dive intelligence package...
            </div>
          ) : companyDetails ? (
            <div className="space-y-6">
              {/* Company Header Card */}
              <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/20">
                      {companyDetails.companyName?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                          {companyDetails.companyName}
                        </h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                          {companyDetails.fortuneRank || companyDetails.tier}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                          {companyDetails.sector}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                        {companyDetails.headquarters && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> {companyDetails.headquarters}
                          </span>
                        )}
                        {companyDetails.employeeCount && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-blue-500" /> {companyDetails.employeeCount} Employees
                          </span>
                        )}
                        {companyDetails.difficultyRating && (
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {companyDetails.difficultyRating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/interview"
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Practice AI Interview
                    </Link>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    Verified Compensation Range (Base + Stocks + Bonuses):
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {companyDetails.packageRange}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pt-1">
                  {companyDetails.overview}
                </p>

                {/* Focus Skills Tags */}
                {companyDetails.focusSkills && companyDetails.focusSkills.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                      High-Priority Skill Benchmarks:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {companyDetails.focusSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-900"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
                {[
                  { id: 'roles', label: `Roles & Salaries (${companyDetails.roles?.length || 0})`, icon: DollarSign },
                  { id: 'workflow', label: 'Hiring Process & Workflow', icon: Target },
                  { id: 'technical', label: `Technical & Coding (${companyDetails.technicalQuestions?.length || 0})`, icon: Code },
                  { id: 'aptitude', label: `Aptitude Focus (${companyDetails.aptitudeTopics?.length || 0})`, icon: Brain },
                  { id: 'hr', label: `HR & Leadership (${companyDetails.hrQuestions?.length || 0})`, icon: Users },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Roles & Real-Time Salaries */}
              {activeTab === 'roles' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Verified Career Tracks &amp; CTC Packages at {companyDetails.companyName}
                    </h3>
                    <span className="text-xs text-gray-500">Source: Real-time candidate offers &amp; drives</span>
                  </div>

                  <div className="space-y-4">
                    {companyDetails.roles && companyDetails.roles.length > 0 ? (
                      companyDetails.roles.map((role, idx) => (
                        <div
                          key={idx}
                          className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                  {role.roleTitle}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                                  {role.level}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {role.keyResponsibilities}
                              </p>
                            </div>

                            <div className="text-left sm:text-right flex-shrink-0 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                              <span className="text-[11px] text-gray-500 block">Total Yearly CTC</span>
                              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                {role.totalCTC}
                              </span>
                            </div>
                          </div>

                          {/* Compensation Breakdown Matrix */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                              <span className="text-gray-500 block mb-1">Base Fixed Salary:</span>
                              <span className="font-bold text-gray-900 dark:text-white text-sm">
                                {role.baseSalary}
                              </span>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                              <span className="text-gray-500 block mb-1">Stocks &amp; Joining Bonuses:</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                                {role.stocksAndBonuses}
                              </span>
                            </div>
                          </div>

                          {/* Skills & Quick Tailor Link */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-700/60">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[11px] text-gray-400 font-medium">Requisites:</span>
                              {role.primarySkills?.map((s, sidx) => (
                                <span
                                  key={sidx}
                                  className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>

                            <Link
                              to="/resume/tailor"
                              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              Tailor Resume for this Role &rarr;
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border">
                        Roles catalog is being compiled for this enterprise.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Hiring Process & Workflow */}
              {activeTab === 'workflow' && (
                <div className="space-y-4">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        Official Recruitment Rounds &amp; Timelines
                      </h3>
                      {companyDetails.interviewProcessDuration && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold">
                          Process Duration: {companyDetails.interviewProcessDuration}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {companyDetails.rounds && companyDetails.rounds.length > 0 ? (
                        companyDetails.rounds.map((round) => (
                          <div
                            key={round.roundNumber}
                            className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {round.roundNumber}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                  {round.title}
                                </h4>
                                <span className="text-xs text-gray-400">{round.duration}</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                {round.description}
                              </p>
                              {round.keyFocus && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {round.keyFocus.map((f, fidx) => (
                                    <span
                                      key={fidx}
                                      className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-medium"
                                    >
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">{companyDetails.hiringWorkflow}</p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-gray-500">
                        Ready to simulate this recruitment pipeline?
                      </span>
                      <Link
                        to="/interview"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1"
                      >
                        Start Mock Interview for {companyDetails.companyName} &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Technical & Coding Questions */}
              {activeTab === 'technical' && (
                <div className="space-y-4">
                  {companyDetails.technicalTopics && companyDetails.technicalTopics.length > 0 && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-2">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                        Core CS &amp; Technical Syllabus Focus:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {companyDetails.technicalTopics.map((topic, tidx) => (
                          <span
                            key={tidx}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-medium"
                          >
                            &bull; {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {companyDetails.technicalQuestions?.map((q, idx) => {
                      const isExpanded = expandedQuestion === `tech-${idx}`;
                      return (
                        <div
                          key={idx}
                          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                        >
                          <button
                            onClick={() => toggleQuestion(`tech-${idx}`)}
                            className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                          >
                            <div className="space-y-1">
                              <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                {q.category || 'Technical Problem'}
                              </span>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white pt-1">
                                {q.question}
                              </h4>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-700/60 pt-3">
                              {q.guidance && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                                  <strong>💡 Guidance:</strong> {q.guidance}
                                </div>
                              )}
                              {q.sampleAnswer && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                  <span className="text-gray-500 font-sans font-bold block mb-1">
                                    Sample Working &amp; Optimal Answer:
                                  </span>
                                  {q.sampleAnswer}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/coding"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <Code className="w-4 h-4" /> Practice Problems in Coding IDE
                    </Link>
                  </div>
                </div>
              )}

              {/* Tab 4: Aptitude & Assessment */}
              {activeTab === 'aptitude' && (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    Cognitive &amp; Aptitude Topics for {companyDetails.companyName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Syllabus areas prioritized in the online screening assessment.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {companyDetails.aptitudeTopics?.map((topic, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {topic}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <Link
                      to="/aptitude"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                    >
                      <Brain className="w-4 h-4" /> Take Aptitude Assessment
                    </Link>
                  </div>
                </div>
              )}

              {/* Tab 5: HR & Leadership Culture */}
              {activeTab === 'hr' && (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                    <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-1">
                      ⭐ Behavioral Excellence Strategy
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      Frame responses using the <strong>STAR Method</strong> (Situation, Task, Action, Result) with quantitative outcomes and alignment to {companyDetails.companyName}'s core values.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {companyDetails.hrQuestions?.map((q, idx) => {
                      const isExpanded = expandedQuestion === `hr-${idx}`;
                      return (
                        <div
                          key={idx}
                          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                        >
                          <button
                            onClick={() => toggleQuestion(`hr-${idx}`)}
                            className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                          >
                            <div className="space-y-1">
                              <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                                {q.category || 'Behavioral Question'}
                              </span>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white pt-1">
                                {q.question}
                              </h4>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-700/60 pt-3">
                              {q.guidance && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                                  <strong>Evaluation Criteria:</strong> {q.guidance}
                                </div>
                              )}
                              {q.sampleAnswer && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                                  <span className="text-gray-500 font-bold block mb-1">
                                    Winning Model Response:
                                  </span>
                                  {q.sampleAnswer}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
              Select any Fortune 500 company to inspect role packages, rounds, and syllabus.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
