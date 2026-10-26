import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template08_Modern = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#0f172a', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Inter', sans-serif" }}
    >
      {/* Modern Banner Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-4 mb-4" style={{ borderColor: `${color}30` }}>
        <div>
          <h1 className={`${fontSize?.nameSize || 'text-3xl'} font-bold tracking-tight text-slate-900`}>
            {personal.name || "Candidate Name"}
          </h1>
          <p className="text-xs font-semibold tracking-wider uppercase mt-0.5" style={{ color }}>
            {data.targetRole || "Software Engineer & Technology Specialist"}
          </p>
        </div>
        <div className="mt-2 md:mt-0 text-right">
          <ContactRow personal={personal} className="md:justify-end text-xs" separator="•" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-4'}>
        {/* Summary */}
        {summary && (
          <section className="bg-slate-50 border-l-4 p-3 rounded-r" style={{ borderColor: color }}>
            <p className="text-slate-700 leading-relaxed text-xs">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
              <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider text-slate-900`}>
                Experience
              </h2>
            </div>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="border-l-2 border-slate-200 pl-3 ml-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{exp.role}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">{exp.company} {exp.location ? `• ${exp.location}` : ''}</div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700">
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
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
              <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider text-slate-900`}>
                Featured Projects
              </h2>
            </div>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx} className="border-l-2 border-slate-200 pl-3 ml-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{p.title}</span>
                    {(p.link || p.github) && (
                      <span className="text-xs font-medium" style={{ color }}>{p.link || p.github}</span>
                    )}
                  </div>
                  {p.technologies && (
                    <div className="text-[11px] text-slate-500 font-medium mb-1">Stack: {p.technologies}</div>
                  )}
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700">
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
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
              <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider text-slate-900`}>
                Skills &amp; Technologies
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat === 'core' ? 'Foundations' : cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex">
                    <span className="font-semibold text-slate-900 w-28 flex-shrink-0">{formattedCat}:</span>
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
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
              <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider text-slate-900`}>
                Education
              </h2>
            </div>
            <div className="space-y-1.5">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline text-xs">
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

        {/* Certifications & Achievements */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
              <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider text-slate-900`}>
                Honors &amp; Certifications
              </h2>
            </div>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
              {certifications.map((c, idx) => (
                <li key={c.id || idx}>
                  <span className="font-bold text-slate-900">{c.name}</span> — {c.issuer} ({c.date})
                </li>
              ))}
              {achievements.map((a, idx) => (
                <li key={a.id || idx}>
                  <span className="font-bold text-slate-900">{a.title}</span> — {a.description}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
