import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template06_SimpleCV = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#0f172a', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-6'} ${fontSize?.baseSize || 'text-[11.5px]'} leading-snug`}
      style={{ fontFamily: font?.fontFamily || "'Courier New', Courier, monospace" }}
    >
      {/* Header */}
      <header className="border-b border-slate-300 pb-2 mb-3">
        <h1 className={`${fontSize?.nameSize || 'text-xl'} font-bold tracking-tight text-slate-950`}>
          {personal.name || "Candidate Name"}
        </h1>
        <div className="mt-1">
          <ContactRow personal={personal} className="text-[11px] text-slate-600 font-mono" separator="|" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-3'}>
        {/* Summary */}
        {summary && (
          <section>
            <p className="text-slate-800 font-mono text-[11px]">{summary}</p>
          </section>
        )}

        {/* Skills */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1">
              $ cat skills.txt
            </h2>
            <div className="space-y-0.5 font-mono text-[11px]">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                return (
                  <div key={cat} className="flex">
                    <span className="w-28 font-bold text-slate-700 flex-shrink-0">{cat}:</span>
                    <span className="text-slate-900">{items.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
              $ cat experience.log
            </h2>
            <div className="space-y-2">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="font-bold text-slate-950">{exp.role} @ {exp.company}</span>
                    <span className="text-[10.5px] text-slate-500">{exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}</span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 mt-0.5 font-sans text-xs">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
              $ git log --projects
            </h2>
            <div className="space-y-2">
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="font-bold text-slate-950">{p.title}</span>
                    <span className="text-[10px] text-blue-700">{p.github || p.link}</span>
                  </div>
                  {p.technologies && <div className="text-[10.5px] text-slate-600 font-mono">[{p.technologies}]</div>}
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 mt-0.5 font-sans text-xs">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1">
              $ cat education.txt
            </h2>
            <div className="space-y-1 font-mono text-[11px]">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between">
                  <div>
                    <span className="font-bold">{edu.degree}</span>, {edu.institution} {edu.gpa ? `(${edu.gpa})` : ''}
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1">
              $ cat achievements.txt
            </h2>
            <div className="space-y-0.5 font-mono text-[11px] text-slate-800">
              {certifications.map((c, idx) => (
                <div key={c.id || idx}>* {c.name} ({c.issuer})</div>
              ))}
              {achievements.map((a, idx) => (
                <div key={a.id || idx}>* {a.title}: {a.description}</div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
