import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template16_ReCeiVe = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#1e3a8a', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Inter', sans-serif" }}
    >
      {/* ReCeiVe Top Masthead */}
      <header className="flex justify-between items-center border-b pb-3 mb-4" style={{ borderColor: `${color}40` }}>
        <div>
          <h1 className={`${fontSize?.nameSize || 'text-3xl'} font-bold tracking-tight text-slate-900`}>
            {personal.name || "Candidate Name"}
          </h1>
          <p className="text-xs font-semibold tracking-wider uppercase mt-0.5" style={{ color }}>
            {data.targetRole || "Software Engineering & Computer Science"}
          </p>
        </div>
        <div className="text-right">
          <ContactRow personal={personal} className="justify-end text-xs" separator="•" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-4'}>
        {/* Summary */}
        {summary && (
          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded" style={{ backgroundColor: color }}>
                Profile
              </span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">{summary}</p>
          </section>
        )}

        {/* Skills with Boxed Pills */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded" style={{ backgroundColor: color }}>
                Skills
              </span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <div className="space-y-1.5">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat === 'core' ? 'Foundations' : cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-xs w-28 flex-shrink-0">{formattedCat}:</span>
                    <div className="flex flex-wrap gap-1">
                      {items.map((it, idx) => (
                        <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-800 text-[11px] px-2 py-0.5 rounded font-medium">
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

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded" style={{ backgroundColor: color }}>
                Experience
              </span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{exp.role} <span className="font-normal text-slate-600">@ {exp.company}</span></span>
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
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded" style={{ backgroundColor: color }}>
                Projects
              </span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{p.title}</span>
                    {(p.link || p.github) && <span className="text-xs font-normal text-blue-700">{p.link || p.github}</span>}
                  </div>
                  {p.technologies && <div className="text-[11px] text-slate-500 font-mono mb-1">Tech: {p.technologies}</div>}
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

        {/* Education */}
        {education && education.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded" style={{ backgroundColor: color }}>
                Education
              </span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
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
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded" style={{ backgroundColor: color }}>
                Honors
              </span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
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
