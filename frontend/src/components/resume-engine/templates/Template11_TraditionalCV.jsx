import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template11_TraditionalCV = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#111827', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Georgia', serif" }}
    >
      {/* Traditional Centered Header */}
      <header className="text-center pb-3 mb-4 border-b border-gray-400">
        <h1 className={`${fontSize?.nameSize || 'text-2xl'} font-bold tracking-normal uppercase text-black`}>
          {personal.name || "Candidate Name"}
        </h1>
        <p className="text-xs italic text-gray-600 mt-0.5">Curriculum Vitae</p>
        <div className="mt-1 flex justify-center text-xs text-gray-700">
          <ContactRow personal={personal} className="justify-center" separator="—" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-4'}>
        {/* Summary */}
        {summary && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5`}>
              Profile
            </h2>
            <p className="text-slate-800 leading-relaxed text-justify">{summary}</p>
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5`}>
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <div className="flex justify-between font-bold">
                    <span>{edu.institution}</span>
                    <span className="font-normal text-xs">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="flex justify-between text-xs italic">
                    <span>{edu.degree}</span>
                    {edu.gpa && <span className="not-italic">Standing: {edu.gpa}</span>}
                  </div>
                  {edu.coursework && (
                    <div className="text-[11px] text-gray-600 mt-0.5">Curriculum: {edu.coursework}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5`}>
              Professional Experience
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between font-bold">
                    <span>{exp.role}, {exp.company}</span>
                    <span className="font-normal text-xs">{exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}</span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 mt-1">
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
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5`}>
              Selected Projects
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between font-bold">
                    <span>{p.title}</span>
                    <span className="font-normal text-xs text-gray-500">{p.technologies}</span>
                  </div>
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

        {/* Skills */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1`}>
              Technical Skills
            </h2>
            <div className="space-y-0.5 text-xs">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex">
                    <span className="font-bold w-32 flex-shrink-0">{formattedCat}:</span>
                    <span>{items.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Honors & Certifications */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1`}>
              Honors &amp; Credentials
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 text-xs">
              {certifications.map((c, idx) => (
                <li key={c.id || idx}>
                  <span className="font-bold">{c.name}</span> — {c.issuer} ({c.date})
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
