import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template12_ModernLaTeX = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#065f46', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-7'} ${fontSize?.baseSize || 'text-[11.5px]'} ${spacing?.lineHeight || 'leading-tight'}`}
      style={{ fontFamily: font?.fontFamily || "'Inter', 'Roboto', sans-serif" }}
    >
      {/* Modern Deedy Header */}
      <header className="border-b-2 pb-2 mb-3 flex justify-between items-baseline" style={{ borderColor: color }}>
        <div>
          <h1 className={`${fontSize?.nameSize || 'text-2xl'} font-bold tracking-tight text-slate-900`}>
            {personal.name || "Candidate Name"}
          </h1>
          <p className="text-[11px] font-semibold tracking-wider uppercase" style={{ color }}>
            {data.targetRole || "Software Engineering & Computer Science"}
          </p>
        </div>
        <div className="text-right">
          <ContactRow personal={personal} className="justify-end text-[11px]" separator="•" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-3'}>
        {/* Skills */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider`} style={{ color }}>
                Skills &amp; Technologies
              </h2>
              <div className="h-0.5 bg-slate-200 flex-1"></div>
            </div>
            <div className="space-y-0.5 text-[11.5px]">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat === 'core' ? 'Fundamentals' : cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex">
                    <span className="font-semibold text-slate-800 w-28 flex-shrink-0">{formattedCat}:</span>
                    <span className="text-slate-700">{items.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider`} style={{ color }}>
                Experience
              </h2>
              <div className="h-0.5 bg-slate-200 flex-1"></div>
            </div>
            <div className={spacing?.itemGap || 'space-y-2'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{exp.role} <span className="font-normal text-slate-600">| {exp.company}</span></span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}
                    </span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 mt-0.5">
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
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider`} style={{ color }}>
                Key Projects
              </h2>
              <div className="h-0.5 bg-slate-200 flex-1"></div>
            </div>
            <div className={spacing?.itemGap || 'space-y-2'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{p.title} {p.technologies && <span className="font-mono text-[10.5px] text-slate-600">[{p.technologies}]</span>}</span>
                    {(p.link || p.github) && <span className="text-[10.5px] text-emerald-800 font-mono">{p.link || p.github}</span>}
                  </div>
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 mt-0.5">
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

        {/* Education */}
        {education && education.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider`} style={{ color }}>
                Education
              </h2>
              <div className="h-0.5 bg-slate-200 flex-1"></div>
            </div>
            <div className="space-y-1">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline text-[11.5px]">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-600"> — {edu.institution}</span>
                    {edu.gpa && <span className="text-slate-700 ml-1">({edu.gpa})</span>}
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
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider`} style={{ color }}>
                Certifications &amp; Honors
              </h2>
              <div className="h-0.5 bg-slate-200 flex-1"></div>
            </div>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-[11px]">
              {certifications.map((c, idx) => (
                <li key={c.id || idx}>
                  <span className="font-semibold text-slate-900">{c.name}</span> — {c.issuer} ({c.date})
                </li>
              ))}
              {achievements.map((a, idx) => (
                <li key={a.id || idx}>
                  <span className="font-semibold text-slate-900">{a.title}</span>: {a.description}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
