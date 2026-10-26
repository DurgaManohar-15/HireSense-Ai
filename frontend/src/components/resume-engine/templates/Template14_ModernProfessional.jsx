import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template14_ModernProfessional = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#1e3a8a', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Inter', sans-serif" }}
    >
      {/* Executive Banner Header */}
      <header className="rounded-lg p-5 mb-4 text-white" style={{ backgroundColor: color }}>
        <h1 className={`${fontSize?.nameSize || 'text-3xl'} font-bold tracking-tight text-white`}>
          {personal.name || "Candidate Name"}
        </h1>
        <p className="text-xs font-medium tracking-wider uppercase opacity-90 mt-0.5">
          {data.targetRole || "Senior Technology Professional"}
        </p>
        <div className="mt-3 pt-2.5 border-t border-white/20 text-xs text-white/90">
          <ContactRow personal={personal} className="text-white/90" iconClassName="w-3 h-3 text-white/80" separator="•" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-4'}>
        {/* Summary */}
        {summary && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-1.5`} style={{ borderColor: `${color}40` }}>
              Executive Summary
            </h2>
            <p className="text-slate-700 leading-relaxed text-xs">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2`} style={{ borderColor: `${color}40` }}>
              Professional Experience
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{exp.role} <span className="font-semibold text-slate-600">| {exp.company}</span></span>
                    <span className="font-normal text-xs text-slate-500">
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

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2`} style={{ borderColor: `${color}40` }}>
              Engineering Projects
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{p.title}</span>
                    {(p.link || p.github) && <span className="font-normal text-xs" style={{ color }}>{p.link || p.github}</span>}
                  </div>
                  {p.technologies && <div className="text-[11px] text-slate-500 font-medium mb-1">Architecture: {p.technologies}</div>}
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
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-1.5`} style={{ borderColor: `${color}40` }}>
              Core Competencies
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat === 'core' ? 'CS Concepts' : cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex">
                    <span className="font-bold text-slate-900 w-32 flex-shrink-0">{formattedCat}:</span>
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
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-1.5`} style={{ borderColor: `${color}40` }}>
              Education
            </h2>
            <div className="space-y-1.5 text-xs">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-600"> — {edu.institution}</span>
                    {edu.gpa && <span className="font-medium text-slate-700 ml-1">({edu.gpa})</span>}
                  </div>
                  <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Achievements */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-1`} style={{ borderColor: `${color}40` }}>
              Certifications &amp; Recognition
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
