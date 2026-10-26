import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template10_XeLaTeX = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#0f172a', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'CMU Serif', 'Latin Modern Roman', 'Times New Roman', serif" }}
    >
      {/* XeLaTeX Centered Masthead */}
      <header className="text-center mb-4">
        <h1 className={`${fontSize?.nameSize || 'text-3xl'} font-bold tracking-widest uppercase text-slate-950`}>
          {personal.name || "Candidate Name"}
        </h1>
        <div className="mt-1 flex justify-center text-xs text-slate-700 font-sans">
          <ContactRow personal={personal} className="justify-center" separator="·" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-3.5'}>
        {/* Education */}
        {education && education.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-widest text-slate-900 whitespace-nowrap`}>
                Education
              </h2>
              <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <div className="space-y-1.5">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-950">{edu.institution}</span>
                    <span className="text-xs text-slate-600">{edu.startDate} -- {edu.endDate}</span>
                  </div>
                  <div className="flex justify-between text-xs italic text-slate-800">
                    <span>{edu.degree}</span>
                    {edu.gpa && <span className="not-italic text-slate-700 font-medium">GPA: {edu.gpa}</span>}
                  </div>
                  {edu.coursework && (
                    <div className="text-[11px] text-slate-600 font-sans mt-0.5">
                      Coursework: {edu.coursework}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-widest text-slate-900 whitespace-nowrap`}>
                Experience
              </h2>
              <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <div className={spacing?.itemGap || 'space-y-2.5'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-950">{exp.role}</span>
                    <span className="text-xs text-slate-600">{exp.startDate} -- {exp.endDate || (exp.current ? 'Present' : '')}</span>
                  </div>
                  <div className="text-xs italic text-slate-700 mb-0.5">{exp.company} {exp.location ? `(${exp.location})` : ''}</div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 font-sans">
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
              <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-widest text-slate-900 whitespace-nowrap`}>
                Projects
              </h2>
              <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <div className={spacing?.itemGap || 'space-y-2.5'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-950">{p.title}</span>
                    {(p.link || p.github) && (
                      <span className="text-xs text-slate-600 font-sans font-mono">{p.link || p.github}</span>
                    )}
                  </div>
                  {p.technologies && (
                    <div className="text-[11px] text-slate-600 italic mb-0.5 font-sans">Tools: {p.technologies}</div>
                  )}
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 font-sans">
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
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-widest text-slate-900 whitespace-nowrap`}>
                Technical Skills
              </h2>
              <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <div className="space-y-0.5 text-xs font-sans">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex">
                    <span className="font-bold text-slate-950 w-32 flex-shrink-0">{formattedCat}:</span>
                    <span className="text-slate-800">{items.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Honors & Certifications */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-widest text-slate-900 whitespace-nowrap`}>
                Honors &amp; Certifications
              </h2>
              <div className="h-px bg-slate-300 w-full"></div>
            </div>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 font-sans text-xs">
              {certifications.map((c, idx) => (
                <li key={c.id || idx}>
                  <span className="font-bold">{c.name}</span> -- {c.issuer} ({c.date})
                </li>
              ))}
              {achievements.map((a, idx) => (
                <li key={a.id || idx}>
                  <span className="font-bold">{a.title}</span>: {a.description}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
