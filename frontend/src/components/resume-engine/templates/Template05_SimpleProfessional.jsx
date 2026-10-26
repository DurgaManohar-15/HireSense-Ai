import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template05_SimpleProfessional = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#374151', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "Arial, sans-serif" }}
    >
      {/* Header */}
      <header className="mb-4 pb-2 border-b-2" style={{ borderColor: color }}>
        <h1 className={`${fontSize?.nameSize || 'text-2xl'} font-bold uppercase tracking-wide text-slate-900`}>
          {personal.name || "Candidate Name"}
        </h1>
        <div className="mt-1">
          <ContactRow personal={personal} className="text-xs text-slate-600" separator="•" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-4'}>
        {/* Summary */}
        {summary && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider mb-1 text-slate-800`}>
              Professional Summary
            </h2>
            <p className="text-slate-700 leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider mb-1.5 text-slate-800`}>
              Education
            </h2>
            <div className="space-y-1.5">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{edu.institution}</span>
                    <span className="font-normal text-xs text-slate-600">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-700">
                    <span>{edu.degree}</span>
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                  {edu.coursework && (
                    <div className="text-[11px] text-slate-600 mt-0.5">Relevant: {edu.coursework}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider mb-1.5 text-slate-800`}>
              Technical Skills
            </h2>
            <div className="space-y-1 text-xs">
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

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider mb-1.5 text-slate-800`}>
              Experience
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{exp.role} — <span className="font-semibold text-slate-700">{exp.company}</span></span>
                    <span className="font-normal text-xs text-slate-600">{exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}</span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 mt-1">
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
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider mb-1.5 text-slate-800`}>
              Projects
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{p.title} {p.technologies && <span className="font-normal text-xs text-slate-600">({p.technologies})</span>}</span>
                    {(p.link || p.github) && <span className="font-normal text-xs text-slate-500">{p.link || p.github}</span>}
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

        {/* Certifications & Achievements */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider mb-1 text-slate-800`}>
              Certifications &amp; Achievements
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
              {certifications.map((c, idx) => (
                <li key={c.id || idx}>
                  <span className="font-bold text-slate-900">{c.name}</span> — {c.issuer} ({c.date})
                </li>
              ))}
              {achievements.map((a, idx) => (
                <li key={a.id || idx}>
                  <span className="font-bold text-slate-900">{a.title}</span>: {a.description}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
