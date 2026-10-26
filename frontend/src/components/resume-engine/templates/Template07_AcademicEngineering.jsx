import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template07_AcademicEngineering = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#1e3a8a', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "Georgia, serif" }}
    >
      {/* Centered Academic Header */}
      <header className="text-center border-b-2 pb-3 mb-4" style={{ borderColor: color }}>
        <h1 className={`${fontSize?.nameSize || 'text-2xl'} font-bold tracking-tight text-slate-900`}>
          {personal.name || "Candidate Name"}
        </h1>
        <div className="mt-1 flex justify-center text-xs font-sans">
          <ContactRow personal={personal} className="justify-center" separator="•" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-4'}>
        {/* Education (Prominently first in Academic/Engineering CV) */}
        {education && education.length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider border-b pb-0.5 mb-2`}
              style={{ color, borderColor: `${color}40` }}
            >
              Academic Background
            </h2>
            <div className="space-y-2.5">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <div className="flex justify-between items-baseline font-bold">
                    <span>{edu.institution}</span>
                    <span className="font-normal text-xs text-slate-600">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="flex justify-between text-xs italic text-slate-700">
                    <span>{edu.degree}</span>
                    {edu.gpa && <span className="not-italic font-semibold text-slate-800">Cumulative GPA: {edu.gpa}</span>}
                  </div>
                  {edu.coursework && (
                    <div className="text-[11px] text-slate-600 mt-1 font-sans">
                      <span className="font-semibold text-slate-800">Advanced Coursework:</span> {edu.coursework}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Projects & Research */}
        {projects && projects.length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider border-b pb-0.5 mb-2`}
              style={{ color, borderColor: `${color}40` }}
            >
              Engineering &amp; Research Projects
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{p.title}</span>
                    {(p.link || p.github) && (
                      <span className="text-xs text-blue-700 font-sans">
                        {p.link || p.github}
                      </span>
                    )}
                  </div>
                  {p.technologies && (
                    <div className="text-[11px] text-slate-600 italic mb-1 font-sans">
                      Technical Environment: {p.technologies}
                    </div>
                  )}
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 font-sans">
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

        {/* Professional Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider border-b pb-0.5 mb-2`}
              style={{ color, borderColor: `${color}40` }}
            >
              Professional Appointments
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline font-bold">
                    <span>{exp.role}, {exp.company}</span>
                    <span className="font-normal text-xs text-slate-600">{exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}</span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 font-sans mt-1">
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

        {/* Technical Skills */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider border-b pb-0.5 mb-2`}
              style={{ color, borderColor: `${color}40` }}
            >
              Technical Proficiencies
            </h2>
            <div className="space-y-1 text-xs font-sans">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat === 'core' ? 'Theoretical Foundations' : cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex">
                    <span className="font-semibold text-slate-900 w-36 flex-shrink-0">{formattedCat}:</span>
                    <span className="text-slate-700">{items.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Honors, Awards & Certifications */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-sm'} font-bold uppercase tracking-wider border-b pb-0.5 mb-2`}
              style={{ color, borderColor: `${color}40` }}
            >
              Academic Honors &amp; Certifications
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 font-sans text-xs">
              {achievements.map((a, idx) => (
                <li key={a.id || idx}>
                  <span className="font-bold text-slate-900">{a.title}</span> — {a.description}
                </li>
              ))}
              {certifications.map((c, idx) => (
                <li key={c.id || idx}>
                  <span className="font-bold text-slate-900">{c.name}</span>, {c.issuer} ({c.date})
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
