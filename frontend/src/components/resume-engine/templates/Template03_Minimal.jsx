import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template03_Minimal = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-black ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Header */}
      <header className="mb-6">
        <h1 className={`${fontSize?.nameSize || 'text-3xl'} font-light tracking-wide uppercase`}>
          {personal.name || "Candidate Name"}
        </h1>
        <div className="mt-2 text-xs text-gray-600">
          <ContactRow personal={personal} className="text-xs" separator="/" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-5'}>
        {/* Summary */}
        {summary && (
          <section>
            <p className="text-gray-800 leading-relaxed max-w-4xl">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-semibold tracking-widest uppercase text-gray-500 mb-3`}>
              Experience
            </h2>
            <div className={spacing?.itemGap || 'space-y-4'}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-semibold text-black">{exp.role}, {exp.company}</span>
                    <span className="text-gray-500 text-xs">
                      {exp.startDate} — {exp.endDate || (exp.current ? 'Present' : '')}
                    </span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700">
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
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-semibold tracking-widest uppercase text-gray-500 mb-3`}>
              Projects
            </h2>
            <div className={spacing?.itemGap || 'space-y-4'}>
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-semibold text-black">{p.title}</span>
                    <span className="text-gray-500 text-xs">{p.technologies}</span>
                  </div>
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700">
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
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-semibold tracking-widest uppercase text-gray-500 mb-3`}>
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-semibold">{edu.degree}</span>, {edu.institution}
                    {edu.gpa && <span className="text-gray-500 text-xs ml-2">({edu.gpa})</span>}
                  </div>
                  <span className="text-gray-500 text-xs">{edu.startDate} — {edu.endDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-semibold tracking-widest uppercase text-gray-500 mb-2`}>
              Skills
            </h2>
            <p className="text-gray-800 leading-relaxed">
              {Object.values(skills).flat().join("  •  ")}
            </p>
          </section>
        )}

        {/* Certifications & Achievements */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section>
            <h2 className={`${fontSize?.headingSize || 'text-xs'} font-semibold tracking-widest uppercase text-gray-500 mb-2`}>
              Honors
            </h2>
            <div className="space-y-1 text-gray-700 text-xs">
              {certifications.map((c, idx) => (
                <div key={c.id || idx}>{c.name} — {c.issuer}</div>
              ))}
              {achievements.map((a, idx) => (
                <div key={a.id || idx}>{a.title} — {a.description}</div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
