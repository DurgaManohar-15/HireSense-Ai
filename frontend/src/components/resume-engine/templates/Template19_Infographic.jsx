import React from 'react';
import { ContactRow } from '../components/common/ContactRow';
import { Briefcase, Code, Award, GraduationCap, CheckCircle } from 'lucide-react';

export const Template19_Infographic = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#065f46', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Inter', sans-serif" }}
    >
      {/* Visual Creative Header */}
      <header className="border-b-2 pb-4 mb-4" style={{ borderColor: color }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-white mb-1.5" style={{ backgroundColor: color }}>
              Creative Portfolio Resume
            </div>
            <h1 className={`${fontSize?.nameSize || 'text-3xl'} font-extrabold tracking-tight text-slate-900`}>
              {personal.name || "Candidate Name"}
            </h1>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-0.5">
              {data.targetRole || "Full Stack Software Engineer & Designer"}
            </p>
          </div>
          <div className="mt-3 md:mt-0 text-left md:text-right">
            <ContactRow personal={personal} className="md:justify-end text-xs" separator="•" />
          </div>
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-4'}>
        {/* Summary Card */}
        {summary && (
          <section className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <p className="text-slate-700 leading-relaxed text-xs">{summary}</p>
          </section>
        )}

        {/* Infographic Visual Timeline for Experience */}
        {experience && experience.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2.5">
              <Briefcase className="w-4 h-4" style={{ color }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Experience Timeline
              </h2>
            </div>
            <div className="border-l-2 ml-2 pl-4 space-y-3" style={{ borderColor: `${color}40` }}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="relative">
                  <div
                    className="absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 bg-white"
                    style={{ borderColor: color }}
                  />
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{exp.role} <span className="font-normal text-slate-600">at {exp.company}</span></span>
                    <span className="text-[11px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}
                    </span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs mt-1">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="pl-0.5">{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Cards */}
        {projects && projects.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4" style={{ color }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Project Architecture
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {projects.map((p, idx) => (
                <div key={p.id || idx} className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-xs">{p.title}</span>
                    {(p.link || p.github) && (
                      <span className="text-[10px] text-blue-600 font-mono truncate max-w-[120px]">{p.link || p.github}</span>
                    )}
                  </div>
                  {p.technologies && (
                    <div className="text-[10.5px] font-mono text-emerald-800">Stack: {p.technologies}</div>
                  )}
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-slate-700 text-[11px]">
                      {p.bullets.slice(0, 2).map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Tags */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4" style={{ color }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Technical Capabilities
              </h2>
            </div>
            <div className="space-y-1.5 text-xs">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat === 'core' ? 'CS Concepts' : cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-slate-800 w-28 flex-shrink-0">{formattedCat}:</span>
                    <div className="flex flex-wrap gap-1">
                      {items.map((it, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10.5px] px-2 py-0.5 rounded font-medium">
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education & Honors Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          {education && education.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-bold uppercase text-xs mb-1.5 text-slate-900">
                <GraduationCap className="w-4 h-4" style={{ color }} />
                <span>Education</span>
              </div>
              <div className="space-y-1 text-xs">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution} ({edu.startDate} – {edu.endDate})</div>
                    {edu.gpa && <div className="text-[11px] text-slate-700 font-medium">GPA: {edu.gpa}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(certifications?.length > 0 || achievements?.length > 0) && (
            <div>
              <div className="flex items-center gap-1.5 font-bold uppercase text-xs mb-1.5 text-slate-900">
                <Award className="w-4 h-4" style={{ color }} />
                <span>Honors &amp; Awards</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-700">
                {achievements.map((a, idx) => (
                  <li key={a.id || idx}>
                    <span className="font-semibold text-slate-900">{a.title}</span>
                  </li>
                ))}
                {certifications.map((c, idx) => (
                  <li key={c.id || idx}>
                    <span className="font-semibold text-slate-900">{c.name}</span> ({c.issuer})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
