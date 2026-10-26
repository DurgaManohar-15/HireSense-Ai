import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template01_SWE = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#111827', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Inter', sans-serif" }}
    >
      {/* 1. SWE Centered Header */}
      <header className="border-b pb-3 mb-4 text-center" style={{ borderColor: color }}>
        <h1 className={`${fontSize?.nameSize || 'text-2xl'} font-bold tracking-tight uppercase text-slate-900`}>
          {personal.name || "Candidate Name"}
        </h1>
        <div className="mt-1 flex justify-center">
          <ContactRow personal={personal} className="justify-center text-xs" separator="•" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-4'}>
        {/* 2. Technical Skills Matrix (Prominent for SWE) */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-sm'} font-bold tracking-wider uppercase pb-0.5 border-b mb-2`}
              style={{ color, borderColor: `${color}40` }}
            >
              Technical Skills
            </h2>
            <div className="space-y-1">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat === 'core' ? 'CS Fundamentals' : cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex flex-wrap items-baseline gap-1">
                    <span className="font-semibold text-slate-800 min-w-[130px]">{formattedCat}:</span>
                    <span className="text-slate-700">{items.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Professional Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-sm'} font-bold tracking-wider uppercase pb-0.5 border-b mb-2`}
              style={{ color, borderColor: `${color}40` }}
            >
              Work Experience
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-slate-900">{exp.role}</span>
                      <span className="text-slate-600 font-medium"> — {exp.company}</span>
                    </div>
                    <span className="text-slate-600 font-medium whitespace-nowrap text-right">
                      {exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}
                    </span>
                  </div>
                  {exp.location && <div className="text-[11px] text-slate-500 italic mb-1">{exp.location}</div>}
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

        {/* 4. Technical Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-sm'} font-bold tracking-wider uppercase pb-0.5 border-b mb-2`}
              style={{ color, borderColor: `${color}40` }}
            >
              Technical Projects
            </h2>
            <div className={spacing?.itemGap || 'space-y-3'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between items-baseline">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="font-bold text-slate-900">{p.title}</span>
                      {p.technologies && (
                        <span className="text-slate-600 text-[11px] font-mono">
                          | <span className="font-medium text-slate-700">{p.technologies}</span>
                        </span>
                      )}
                    </div>
                    {(p.link || p.github) && (
                      <span className="text-slate-500 text-[11px] font-mono whitespace-nowrap">
                        {p.link ? p.link.replace(/^https?:\/\//, '') : p.github.replace(/^https?:\/\//, '')}
                      </span>
                    )}
                  </div>
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 mt-1">
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

        {/* 5. Education */}
        {education && education.length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-sm'} font-bold tracking-wider uppercase pb-0.5 border-b mb-2`}
              style={{ color, borderColor: `${color}40` }}
            >
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{edu.institution}</span>
                    <span className="text-slate-600 font-medium whitespace-nowrap">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700 text-xs">
                    <span>{edu.degree}</span>
                    {edu.gpa && <span className="font-semibold text-slate-800">GPA: {edu.gpa}</span>}
                  </div>
                  {edu.coursework && (
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      <span className="font-medium">Relevant Coursework:</span> {edu.coursework}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Certifications & Achievements */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-sm'} font-bold tracking-wider uppercase pb-0.5 border-b mb-2`}
              style={{ color, borderColor: `${color}40` }}
            >
              Certifications &amp; Achievements
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700">
              {certifications.map((c, idx) => (
                <li key={c.id || idx} className="pl-0.5">
                  <span className="font-semibold text-slate-900">{c.name}</span> — {c.issuer} ({c.date})
                </li>
              ))}
              {achievements.map((a, idx) => (
                <li key={a.id || idx} className="pl-0.5">
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
