import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template04_KeywordFocused = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#0f172a', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Inter', sans-serif" }}
    >
      {/* 1. Header */}
      <header className="border-b-2 pb-3 mb-3" style={{ borderColor: color }}>
        <div className="flex justify-between items-baseline">
          <h1 className={`${fontSize?.nameSize || 'text-2xl'} font-extrabold uppercase tracking-tight text-slate-900`}>
            {personal.name || "Candidate Name"}
          </h1>
          <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            ATS Keyword-Optimized
          </span>
        </div>
        <div className="mt-1">
          <ContactRow personal={personal} className="text-xs" separator="•" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-3.5'}>
        {/* 2. Summary */}
        {summary && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider pb-0.5 border-b mb-1`}
              style={{ color, borderColor: `${color}30` }}
            >
              Summary
            </h2>
            <p className="text-slate-700 leading-relaxed text-justify">{summary}</p>
          </section>
        )}

        {/* 3. Skills Matrix (Right under summary for immediate keyword indexing) */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider pb-0.5 border-b mb-1.5`}
              style={{ color, borderColor: `${color}30` }}
            >
              Skills
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat === 'core' ? 'CS Fundamentals' : cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="text-xs flex items-baseline">
                    <span className="font-bold text-slate-800 w-32 flex-shrink-0">{formattedCat}:</span>
                    <span className="text-slate-700 font-medium">{items.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider pb-0.5 border-b mb-1.5`}
              style={{ color, borderColor: `${color}30` }}
            >
              Experience
            </h2>
            <div className={spacing?.itemGap || 'space-y-2.5'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{exp.role} <span className="font-medium text-slate-600">| {exp.company}</span></span>
                    <span className="text-slate-600 text-xs font-medium">
                      {exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}
                    </span>
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

        {/* 5. Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider pb-0.5 border-b mb-1.5`}
              style={{ color, borderColor: `${color}30` }}
            >
              Projects
            </h2>
            <div className={spacing?.itemGap || 'space-y-2.5'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-slate-900">{p.title}</span>
                      {p.technologies && <span className="text-xs text-slate-600 font-semibold">[{p.technologies}]</span>}
                    </div>
                    {(p.link || p.github) && (
                      <span className="text-xs text-blue-700 font-medium">
                        {p.link || p.github}
                      </span>
                    )}
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

        {/* 6. Education */}
        {education && education.length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider pb-0.5 border-b mb-1`}
              style={{ color, borderColor: `${color}30` }}
            >
              Education
            </h2>
            <div className="space-y-1.5">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-600 text-xs"> — {edu.institution}</span>
                    {edu.gpa && <span className="text-xs font-semibold text-slate-800 ml-2">({edu.gpa})</span>}
                  </div>
                  <span className="text-slate-600 text-xs font-medium">{edu.startDate} – {edu.endDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Certifications */}
        {certifications && certifications.length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider pb-0.5 border-b mb-1`}
              style={{ color, borderColor: `${color}30` }}
            >
              Certifications
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700">
              {certifications.map((c, idx) => (
                <li key={c.id || idx} className="pl-0.5">
                  <span className="font-semibold text-slate-900">{c.name}</span> — {c.issuer} ({c.date})
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 8. Achievements */}
        {achievements && achievements.length > 0 && (
          <section>
            <h2
              className={`${fontSize?.headingSize || 'text-xs'} font-bold uppercase tracking-wider pb-0.5 border-b mb-1`}
              style={{ color, borderColor: `${color}30` }}
            >
              Achievements
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700">
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
