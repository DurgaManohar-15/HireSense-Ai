import React, { useState } from 'react';
import { TEMPLATES_METADATA, TEMPLATE_CATEGORIES, getRecommendedTemplatesForRole } from '../data/templatesMetadata';
import { X, Check, Search, ShieldCheck, Sparkles, Star, ArrowRight, Layout } from 'lucide-react';

/**
 * Realistic Miniature A4 Document Previews
 * Displays an authentic, visually distinctive miniature white resume page for each template.
 */
const MiniResumeSheet = ({ templateId }) => {
  // 1. Template 18: Twenty Seconds (Full-height dark left sidebar)
  if (templateId === 'template-18') {
    return (
      <div className="w-[150px] h-[210px] bg-white rounded-xs shadow-md flex overflow-hidden border border-slate-300 text-[5px] select-none transition-transform duration-200 group-hover:scale-105 group-hover:shadow-xl">
        {/* Left Dark Sidebar */}
        <div className="w-[38%] bg-slate-900 text-slate-200 p-2 flex flex-col justify-between">
          <div>
            <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 mx-auto mb-1.5 flex items-center justify-center text-[7px] font-bold text-white">DM</div>
            <div className="w-12 h-1.5 bg-white rounded-xs mx-auto mb-0.5 font-bold"></div>
            <div className="w-10 h-1 bg-blue-400 rounded-xs mx-auto mb-2"></div>
            
            <div className="w-8 h-1 bg-slate-400 rounded-xs mb-1 uppercase font-semibold">SKILLS</div>
            <div className="space-y-0.5">
              <div className="w-full h-0.5 bg-slate-600 rounded-xs"></div>
              <div className="w-4/5 h-0.5 bg-slate-600 rounded-xs"></div>
              <div className="w-5/6 h-0.5 bg-slate-600 rounded-xs"></div>
            </div>
          </div>
          <div className="space-y-0.5 text-slate-400">
            <div className="w-full h-0.5 bg-slate-700 rounded-xs"></div>
            <div className="w-3/4 h-0.5 bg-slate-700 rounded-xs"></div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 p-2.5 flex flex-col justify-between bg-white text-slate-800">
          <div>
            <div className="w-14 h-1 bg-blue-900 rounded-xs mb-1 font-bold">EXPERIENCE</div>
            <div className="space-y-1 mb-2">
              <div>
                <div className="w-full h-1 bg-slate-800 rounded-xs mb-0.5 font-semibold"></div>
                <div className="w-4/5 h-0.5 bg-slate-400 rounded-xs"></div>
                <div className="w-full h-0.5 bg-slate-300 rounded-xs mt-0.5"></div>
              </div>
              <div>
                <div className="w-full h-1 bg-slate-800 rounded-xs mb-0.5 font-semibold"></div>
                <div className="w-3/4 h-0.5 bg-slate-300 rounded-xs"></div>
              </div>
            </div>

            <div className="w-12 h-1 bg-blue-900 rounded-xs mb-1 font-bold">PROJECTS</div>
            <div className="space-y-0.5">
              <div className="w-full h-0.5 bg-slate-600 rounded-xs"></div>
              <div className="w-5/6 h-0.5 bg-slate-300 rounded-xs"></div>
            </div>
          </div>
          <div>
            <div className="w-12 h-1 bg-blue-900 rounded-xs mb-0.5 font-bold">EDUCATION</div>
            <div className="w-full h-0.5 bg-slate-500 rounded-xs"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Template 14: Modern Professional (Executive Navy Top Banner)
  if (templateId === 'template-14') {
    return (
      <div className="w-[150px] h-[210px] bg-white rounded-xs shadow-md flex flex-col overflow-hidden border border-slate-300 text-[5px] select-none transition-transform duration-200 group-hover:scale-105 group-hover:shadow-xl">
        <div className="bg-blue-950 text-white p-2.5 flex flex-col justify-between">
          <div className="w-16 h-2 bg-white rounded-xs mb-0.5"></div>
          <div className="w-12 h-1 bg-blue-300 rounded-xs mb-1.5"></div>
          <div className="flex gap-2 text-slate-300">
            <div className="w-10 h-0.5 bg-blue-200/60 rounded-xs"></div>
            <div className="w-8 h-0.5 bg-blue-200/60 rounded-xs"></div>
          </div>
        </div>
        <div className="p-2.5 flex-1 flex flex-col justify-between bg-white text-slate-800">
          <div>
            <div className="w-14 h-1 bg-blue-900 rounded-xs mb-1 font-bold">PROFESSIONAL SUMMARY</div>
            <div className="space-y-0.5 mb-2">
              <div className="w-full h-0.5 bg-slate-400 rounded-xs"></div>
              <div className="w-5/6 h-0.5 bg-slate-300 rounded-xs"></div>
            </div>

            <div className="w-14 h-1 bg-blue-900 rounded-xs mb-1 font-bold">WORK EXPERIENCE</div>
            <div className="space-y-1 mb-2">
              <div className="w-full h-0.5 bg-slate-700 rounded-xs"></div>
              <div className="w-full h-0.5 bg-slate-300 rounded-xs"></div>
              <div className="w-4/5 h-0.5 bg-slate-300 rounded-xs"></div>
            </div>
          </div>
          <div>
            <div className="w-12 h-1 bg-blue-900 rounded-xs mb-1 font-bold">EDUCATION &amp; SKILLS</div>
            <div className="w-full h-0.5 bg-slate-400 rounded-xs"></div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Template 13 & 20: Two-Column Modern / AltaCV
  if (templateId === 'template-13' || templateId === 'template-20') {
    return (
      <div className="w-[150px] h-[210px] bg-white rounded-xs shadow-md p-2 flex flex-col overflow-hidden border border-slate-300 text-[5px] select-none transition-transform duration-200 group-hover:scale-105 group-hover:shadow-xl">
        {/* Top Header */}
        <div className="pb-1.5 mb-1.5 border-b border-slate-200">
          <div className="w-16 h-2 bg-slate-900 rounded-xs mb-0.5"></div>
          <div className="w-12 h-1 bg-teal-600 rounded-xs"></div>
        </div>
        {/* Two Columns */}
        <div className="grid grid-cols-12 gap-1.5 flex-1">
          {/* Main Left Column (7 cols) */}
          <div className="col-span-7 flex flex-col justify-between">
            <div>
              <div className="w-12 h-1 bg-teal-800 rounded-xs mb-1 font-bold">EXPERIENCE</div>
              <div className="space-y-1 mb-2">
                <div className="w-full h-0.5 bg-slate-800 rounded-xs"></div>
                <div className="w-full h-0.5 bg-slate-300 rounded-xs"></div>
                <div className="w-4/5 h-0.5 bg-slate-300 rounded-xs"></div>
              </div>
              <div className="w-10 h-1 bg-teal-800 rounded-xs mb-1 font-bold">PROJECTS</div>
              <div className="w-full h-0.5 bg-slate-300 rounded-xs"></div>
            </div>
            <div>
              <div className="w-10 h-1 bg-teal-800 rounded-xs mb-0.5 font-bold">EDUCATION</div>
              <div className="w-full h-0.5 bg-slate-400 rounded-xs"></div>
            </div>
          </div>
          {/* Sidebar Right Column (5 cols) */}
          <div className="col-span-5 bg-slate-50 p-1 rounded border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-8 h-1 bg-teal-800 rounded-xs mb-1 font-bold">SKILLS</div>
              <div className="space-y-0.5 mb-2">
                <div className="w-full h-0.5 bg-teal-600 rounded-xs"></div>
                <div className="w-3/4 h-0.5 bg-slate-400 rounded-xs"></div>
                <div className="w-4/5 h-0.5 bg-slate-400 rounded-xs"></div>
              </div>
              <div className="w-8 h-1 bg-teal-800 rounded-xs mb-1 font-bold">LANGUAGES</div>
              <div className="w-full h-0.5 bg-slate-300 rounded-xs"></div>
            </div>
            <div className="w-full h-1 bg-teal-100 rounded-xs"></div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Template 15: Friggeri (Left date column gutter)
  if (templateId === 'template-15') {
    return (
      <div className="w-[150px] h-[210px] bg-white rounded-xs shadow-md p-2 flex flex-col overflow-hidden border border-slate-300 text-[5px] select-none transition-transform duration-200 group-hover:scale-105 group-hover:shadow-xl">
        <div className="pb-1 mb-1.5 border-b-2 border-pink-600 flex justify-between items-baseline">
          <div className="w-16 h-2 bg-slate-900 rounded-xs font-bold"></div>
          <div className="w-8 h-1 bg-pink-600 rounded-xs"></div>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="w-12 h-1 bg-pink-700 rounded-xs mb-1 font-bold">EXPERIENCE</div>
            <div className="grid grid-cols-12 gap-1 mb-1.5">
              <div className="col-span-3 text-right">
                <div className="w-full h-0.5 bg-pink-500 rounded-xs"></div>
              </div>
              <div className="col-span-9 pl-1 border-l border-slate-200 space-y-0.5">
                <div className="w-full h-0.5 bg-slate-800 rounded-xs"></div>
                <div className="w-4/5 h-0.5 bg-slate-300 rounded-xs"></div>
              </div>
            </div>
            <div className="w-12 h-1 bg-pink-700 rounded-xs mb-1 font-bold">PROJECTS</div>
            <div className="grid grid-cols-12 gap-1 mb-1.5">
              <div className="col-span-3 text-right">
                <div className="w-full h-0.5 bg-pink-500 rounded-xs"></div>
              </div>
              <div className="col-span-9 pl-1 border-l border-slate-200 space-y-0.5">
                <div className="w-full h-0.5 bg-slate-700 rounded-xs"></div>
                <div className="w-5/6 h-0.5 bg-slate-300 rounded-xs"></div>
              </div>
            </div>
          </div>
          <div>
            <div className="w-10 h-1 bg-pink-700 rounded-xs mb-0.5 font-bold">SKILLS</div>
            <div className="w-full h-0.5 bg-slate-400 rounded-xs"></div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Template 06: SimpleCV / Developer Terminal
  if (templateId === 'template-06') {
    return (
      <div className="w-[150px] h-[210px] bg-slate-950 text-emerald-400 rounded-xs shadow-md p-2 flex flex-col justify-between overflow-hidden border border-slate-800 text-[5px] font-mono select-none transition-transform duration-200 group-hover:scale-105 group-hover:shadow-xl">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
            <span className="text-white font-bold text-[6px]">~/alex_resume.sh</span>
            <span className="text-emerald-500">zsh</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div>
              <span className="text-emerald-400">$ whoami</span>
              <div className="text-white font-semibold">Alex Sharma — SWE</div>
            </div>
            <div>
              <span className="text-emerald-400">$ cat skills.json</span>
              <div className="text-slate-400">Java, Spring Boot, React, SQL</div>
            </div>
            <div>
              <span className="text-emerald-400">$ git log --oneline</span>
              <div className="text-slate-400">3a8f1e SDE Intern</div>
              <div className="text-slate-400">2b7c4d Full Stack Lead</div>
            </div>
          </div>
        </div>
        <div className="pt-1 border-t border-slate-800 text-slate-500 flex justify-between">
          <span>EXIT 0</span>
          <span>ATS 100%</span>
        </div>
      </div>
    );
  }

  // 6. Template 10 & 12: XeLaTeX / Modern LaTeX (Computer Modern look with ruled dividers)
  if (templateId === 'template-10' || templateId === 'template-12') {
    return (
      <div className="w-[150px] h-[210px] bg-white rounded-xs shadow-md p-2 flex flex-col justify-between overflow-hidden border border-slate-300 text-[5px] font-serif select-none transition-transform duration-200 group-hover:scale-105 group-hover:shadow-xl">
        <div>
          <div className="text-center pb-1 mb-1.5">
            <div className="w-18 h-2 bg-slate-900 rounded-xs mx-auto font-bold mb-0.5"></div>
            <div className="w-24 h-0.5 bg-slate-500 rounded-xs mx-auto"></div>
          </div>

          <div className="mb-2">
            <div className="flex items-center gap-1 border-b border-slate-800 pb-0.5 mb-1">
              <span className="text-blue-900 font-bold uppercase text-[5.5px]">Education</span>
            </div>
            <div className="space-y-0.5">
              <div className="w-full h-0.5 bg-slate-700 rounded-xs"></div>
              <div className="w-4/5 h-0.5 bg-slate-400 rounded-xs"></div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-center gap-1 border-b border-slate-800 pb-0.5 mb-1">
              <span className="text-blue-900 font-bold uppercase text-[5.5px]">Experience</span>
            </div>
            <div className="space-y-0.5">
              <div className="w-full h-0.5 bg-slate-800 rounded-xs"></div>
              <div className="w-full h-0.5 bg-slate-300 rounded-xs"></div>
              <div className="w-3/4 h-0.5 bg-slate-300 rounded-xs"></div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 border-b border-slate-800 pb-0.5 mb-1">
            <span className="text-blue-900 font-bold uppercase text-[5.5px]">Technical Skills</span>
          </div>
          <div className="w-full h-0.5 bg-slate-600 rounded-xs"></div>
        </div>
      </div>
    );
  }

  // 7. Template 01: SWE Resume (ATS-Gold Standard Centered Layout)
  if (templateId === 'template-01') {
    return (
      <div className="w-[150px] h-[210px] bg-white rounded-xs shadow-md p-2 flex flex-col justify-between overflow-hidden border border-slate-300 text-[5px] select-none transition-transform duration-200 group-hover:scale-105 group-hover:shadow-xl">
        <div>
          <div className="text-center pb-1.5 mb-1.5 border-b border-slate-900">
            <div className="w-20 h-2.5 bg-slate-900 rounded-xs mx-auto mb-0.5 font-bold"></div>
            <div className="w-24 h-0.5 bg-slate-500 rounded-xs mx-auto"></div>
          </div>

          <div className="mb-1.5">
            <div className="w-14 h-1 bg-slate-900 rounded-xs mb-1 font-bold">TECHNICAL SKILLS</div>
            <div className="space-y-0.5">
              <div className="w-full h-0.5 bg-slate-700 rounded-xs"></div>
              <div className="w-5/6 h-0.5 bg-slate-400 rounded-xs"></div>
            </div>
          </div>

          <div className="mb-1.5">
            <div className="w-14 h-1 bg-slate-900 rounded-xs mb-1 font-bold">WORK EXPERIENCE</div>
            <div className="space-y-1">
              <div className="w-full h-0.5 bg-slate-800 rounded-xs"></div>
              <div className="w-full h-0.5 bg-slate-300 rounded-xs"></div>
              <div className="w-4/5 h-0.5 bg-slate-300 rounded-xs"></div>
            </div>
          </div>
        </div>

        <div>
          <div className="w-12 h-1 bg-slate-900 rounded-xs mb-1 font-bold">PROJECTS &amp; EDUCATION</div>
          <div className="w-full h-0.5 bg-slate-500 rounded-xs"></div>
        </div>
      </div>
    );
  }

  // Default Standard Single Column (02, 03, 04, 05, 07, 08, 09, 11, 16, 17, 19)
  return (
    <div className="w-[150px] h-[210px] bg-white rounded-xs shadow-md p-2 flex flex-col justify-between overflow-hidden border border-slate-300 text-[5px] select-none transition-transform duration-200 group-hover:scale-105 group-hover:shadow-xl">
      <div>
        <div className="flex justify-between items-baseline pb-1 mb-1.5 border-b border-slate-300">
          <div className="w-16 h-2 bg-slate-900 rounded-xs mb-0.5 font-bold"></div>
          <div className="w-10 h-0.5 bg-slate-400 rounded-xs"></div>
        </div>

        <div className="mb-1.5">
          <div className="w-14 h-1 bg-blue-900 rounded-xs mb-1 font-bold">SUMMARY</div>
          <div className="space-y-0.5">
            <div className="w-full h-0.5 bg-slate-400 rounded-xs"></div>
            <div className="w-4/5 h-0.5 bg-slate-300 rounded-xs"></div>
          </div>
        </div>

        <div className="mb-1.5">
          <div className="w-14 h-1 bg-blue-900 rounded-xs mb-1 font-bold">EXPERIENCE</div>
          <div className="space-y-0.5">
            <div className="w-full h-0.5 bg-slate-800 rounded-xs"></div>
            <div className="w-full h-0.5 bg-slate-300 rounded-xs"></div>
            <div className="w-3/4 h-0.5 bg-slate-300 rounded-xs"></div>
          </div>
        </div>
      </div>

      <div>
        <div className="w-12 h-1 bg-blue-900 rounded-xs mb-0.5 font-bold">EDUCATION &amp; SKILLS</div>
        <div className="w-full h-0.5 bg-slate-400 rounded-xs"></div>
      </div>
    </div>
  );
};

export const TemplateGalleryModal = ({
  isOpen,
  onClose,
  currentTemplateId,
  onSelectTemplate,
  targetRole = ""
}) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const rawRecommended = getRecommendedTemplatesForRole(targetRole);
  const topRecommendedIds = rawRecommended.slice(0, 2).map(r => r.id);

  const filteredTemplates = TEMPLATES_METADATA.filter(tpl => {
    const matchesCategory = activeCategory === "All" || tpl.allCategories.includes(activeCategory);
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.recommendedFor.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (templateId) => {
    onSelectTemplate(templateId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
        {/* 1. Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-900">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Select Resume Template
              </h2>
              <span className="bg-blue-950/80 text-blue-400 border border-blue-800/80 text-xs px-2.5 py-0.5 rounded-full font-bold">
                20 Curated Designs
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose any layout below. Your resume data, bullet points, and skills are preserved automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="Close Gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Cohesive Dark Filter Tabs & Search Bar (No white stripes!) */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, keyword, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* 3. Templates Grid Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0b0f19]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(tpl => {
              const isSelected = currentTemplateId === tpl.id;
              const isRecommended = topRecommendedIds.includes(tpl.id);

              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelect(tpl.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(tpl.id);
                    }
                  }}
                  className={`group relative rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-slate-900 cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-1 ${
                    isSelected
                      ? 'ring-2 ring-blue-500 border-blue-500 shadow-blue-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Miniature Realistic Paper Preview On Studio Desk */}
                  <div className="relative bg-[#070a10] py-5 flex items-center justify-center border-b border-slate-800/80 overflow-hidden">
                    <MiniResumeSheet templateId={tpl.id} />

                    {/* Active Indicator Badge */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" /> Active
                      </div>
                    )}

                    {/* Recommended for Target Role */}
                    {isRecommended && !isSelected && (
                      <div className="absolute top-2.5 right-2.5 bg-amber-500/90 text-white px-2.5 py-0.5 rounded-full text-[10.5px] font-bold flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-white" /> Top Choice
                      </div>
                    )}
                  </div>

                  {/* Card Details & Action */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-slate-900">
                    <div>
                      {/* Title & Category Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 border border-slate-700/60">
                            {tpl.num}
                          </span>
                          <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                            {tpl.name}
                          </h3>
                        </div>
                      </div>

                      {/* Layout & ATS Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        {tpl.atsFriendly ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                            <ShieldCheck className="w-3 h-3" /> ATS Friendly
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                            <Sparkles className="w-3 h-3" /> Creative Design
                          </span>
                        )}

                        <span className="text-[10.5px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-750">
                          {tpl.layout === 'single-column' ? '1 Column' : '2 Columns'}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                        {tpl.description}
                      </p>

                      {/* Target Roles Tags */}
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {tpl.recommendedFor.slice(0, 3).map((role, rIdx) => (
                          <span
                            key={rIdx}
                            className="text-[10px] bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-750"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        {tpl.category}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(tpl.id);
                        }}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Apply'}
                        {!isSelected && <ArrowRight className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

