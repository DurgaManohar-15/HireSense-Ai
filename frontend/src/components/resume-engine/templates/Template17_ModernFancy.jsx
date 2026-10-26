import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template17_ModernFancy = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#581c87', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Inter', sans-serif" }}
    >
      {/* Fancy Geometric Header Card */}
      <header className="relative overflow-hidden bg-slate-900 text-white rounded-xl p-5 mb-5 shadow-sm">
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-25 blur-xl pointer-events-none"
          style={{ backgroundColor: color }}
        />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className={`${fontSize?.nameSize || 'text-3xl'} font-bold tracking-tight text-white`}>
              {personal.name || "Candidate Name"}
            </h1>
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-300 mt-0.5">
              {data.targetRole || "Software Engineer & Creative Technologist"}
            </p>
          </div>
          <div className="mt-3 md:mt-0 text-left md:text-right">
            <ContactRow personal={personal} className="md:justify-end text-xs text-slate-300" iconClassName="w-3 h-3 text-slate-400" separator="•" />
          </div>
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-4'}>
        {/* Summary */}
        {summary && (
          <section className="bg-slate-50 border-l-4 rounded-r p-3" style={{ borderColor: color }}>
            <p className="text-slate-700 leading-relaxed text-xs">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2 border-b-2`} style={{ borderColor: `${color}40` }}>
              Experience
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{exp.role} <span className="font-medium text-slate-600">at {exp.company}</span></span>
                    <span className="text-xs font-normal text-slate-500">{exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}</span>
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

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2 border-b-2`} style={{ borderColor: `${color}40` }}>
              Featured Projects
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{p.title}</span>
                    {(p.link || p.github) && <span className="text-xs font-medium" style={{ color }}>{p.link || p.github}</span>}
                  </div>
                  {p.technologies && <div className="text-[11px] text-slate-500 font-medium mb-1">Stack: {p.technologies}</div>}
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
                      {p.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="pl-0.5">{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2 border-b-2`} style={{ borderColor: `${color}40` }}>
              Skills &amp; Capabilities
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat === 'core' ? 'CS Concepts' : cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex">
                    <span className="font-bold text-slate-900 w-28 flex-shrink-0">{formattedCat}:</span>
                    <span className="text-slate-700">{items.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2 border-b-2`} style={{ borderColor: `${color}40` }}>
              Education
            </h2>
            <div className="space-y-1.5 text-xs">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-600"> — {edu.institution}</span>
                    {edu.gpa && <span className="font-semibold text-slate-800 ml-1">({edu.gpa})</span>}
                  </div>
                  <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Honors & Certifications */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2 border-b-2`} style={{ borderColor: `${color}40` }}>
              Honors &amp; Certifications
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
              {certifications.map((c, idx) => (
                <li key={c.id || idx}>
                  <span className="font-semibold text-slate-900">{c.name}</span> — {c.issuer} ({c.date})
                </li>
              ))}
              {achievements.map((a, idx) => (
                <li key={a.id || idx}>
                  <span className="font-semibold text-slate-900">{a.title}</span> — {a.description}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
