import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template09_MinimalAcademic = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Times New Roman', Georgia, serif" }}
    >
      {/* Classical Academic Header */}
      <header className="border-b border-black pb-3 mb-4">
        <h1 className={`${fontSize?.nameSize || 'text-2xl'} font-bold tracking-normal uppercase text-black`}>
          {personal.name || "Candidate Name"}
        </h1>
        <div className="mt-1 text-xs text-slate-700">
          <ContactRow personal={personal} className="text-xs font-serif" separator="•" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-4'}>
        {/* Academic Appointments / Education */}
        {education && education.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 mb-2`}>
              Education &amp; Academic Credentials
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <div className="flex justify-between font-bold">
                    <span>{edu.degree}</span>
                    <span className="font-normal text-xs">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="text-xs italic text-slate-800">
                    {edu.institution}{edu.gpa ? `, Grade/GPA: ${edu.gpa}` : ''}
                  </div>
                  {edu.coursework && (
                    <div className="text-[11px] text-slate-700 mt-0.5">
                      Selected Coursework: {edu.coursework}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Research & Technical Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 mb-2`}>
              Research &amp; Professional Appointments
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between font-bold">
                    <span>{exp.role}</span>
                    <span className="font-normal text-xs">{exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}</span>
                  </div>
                  <div className="text-xs italic text-slate-800 mb-1">{exp.company} {exp.location ? `(${exp.location})` : ''}</div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800">
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

        {/* Selected Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 mb-2`}>
              Selected Projects &amp; Software Artifacts
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between font-bold">
                    <span>{p.title}</span>
                    {(p.link || p.github) && <span className="font-normal text-xs text-blue-800 font-mono">{p.link || p.github}</span>}
                  </div>
                  {p.technologies && <div className="text-[11px] text-slate-700 italic">Methodology/Stack: {p.technologies}</div>}
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 mt-0.5">
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

        {/* Competencies */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 mb-1.5`}>
              Areas of Expertise &amp; Technical Tools
            </h2>
            <div className="space-y-1 text-xs">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat === 'core' ? 'Foundational Theory' : cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex">
                    <span className="font-bold w-36 flex-shrink-0">{formattedCat}:</span>
                    <span>{items.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Honors & Awards */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 mb-1.5`}>
              Honors, Awards &amp; Certifications
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 text-xs">
              {achievements.map((a, idx) => (
                <li key={a.id || idx}>
                  <span className="font-bold">{a.title}</span> — {a.description}
                </li>
              ))}
              {certifications.map((c, idx) => (
                <li key={c.id || idx}>
                  <span className="font-bold">{c.name}</span>, {c.issuer} ({c.date})
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
