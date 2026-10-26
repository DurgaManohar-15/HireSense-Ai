import React from 'react';
import { ContactRow } from '../components/common/ContactRow';

export const Template15_Friggeri = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#831843', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Friggeri Header */}
      <header className="mb-5 pb-3 border-b-2" style={{ borderColor: color }}>
        <h1 className={`${fontSize?.nameSize || 'text-3xl'} font-light tracking-wide text-slate-900 uppercase`}>
          <span className="font-bold" style={{ color }}>{personal.name?.split(' ')[0] || "Durga"}</span>{' '}
          {personal.name?.split(' ').slice(1).join(' ') || "Manohar"}
        </h1>
        <p className="text-xs font-medium tracking-widest uppercase text-slate-500 mt-0.5">
          {data.targetRole || "Software Development Engineer"}
        </p>
        <div className="mt-2 text-xs">
          <ContactRow personal={personal} className="text-xs" separator="|" />
        </div>
      </header>

      <div className={spacing?.gapClass || 'space-y-4'}>
        {/* Summary */}
        {summary && (
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-right font-bold uppercase text-[11px] tracking-wider pt-0.5" style={{ color }}>
              Profile
            </div>
            <div className="col-span-9 text-slate-700 leading-relaxed text-xs">
              {summary}
            </div>
          </section>
        )}

        {/* Experience with Left Date Gutter */}
        {experience && experience.length > 0 && (
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-right font-bold uppercase text-[11px] tracking-wider pt-0.5" style={{ color }}>
              Experience
            </div>
            <div className="col-span-9 space-y-3">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {exp.role} <span className="font-normal text-slate-600">at {exp.company}</span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs mt-1">
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

        {/* Projects with Left Date Gutter */}
        {projects && projects.length > 0 && (
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-right font-bold uppercase text-[11px] tracking-wider pt-0.5" style={{ color }}>
              Projects
            </div>
            <div className="col-span-9 space-y-3">
              {projects.map((p, idx) => (
                <div key={p.id || idx}>
                  <div className="font-bold text-slate-900 text-sm flex justify-between items-baseline">
                    <span>{p.title}</span>
                    {(p.link || p.github) && <span className="text-xs font-normal text-slate-500">{p.link || p.github}</span>}
                  </div>
                  {p.technologies && <div className="text-[11px] text-slate-500 font-mono">Stack: {p.technologies}</div>}
                  {p.bullets && p.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs mt-1">
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

        {/* Skills (No graphical bars — clean readable pills) */}
        {skills && Object.keys(skills).length > 0 && (
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-right font-bold uppercase text-[11px] tracking-wider pt-0.5" style={{ color }}>
              Skills
            </div>
            <div className="col-span-9 space-y-2 text-xs">
              {Object.entries(skills).map(([cat, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const formattedCat = cat === 'core' ? 'Foundations' : cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <div key={cat} className="flex flex-wrap items-baseline gap-1.5">
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
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-right font-bold uppercase text-[11px] tracking-wider pt-0.5" style={{ color }}>
              Education
            </div>
            <div className="col-span-9 space-y-2 text-xs">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">{edu.startDate} – {edu.endDate}</div>
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-600">{edu.institution}{edu.gpa ? ` (GPA: ${edu.gpa})` : ''}</div>
                  {edu.coursework && <div className="text-[11px] text-slate-500 mt-0.5">Focus: {edu.coursework}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Achievements */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-right font-bold uppercase text-[11px] tracking-wider pt-0.5" style={{ color }}>
              Honors
            </div>
            <div className="col-span-9 space-y-1 text-xs text-slate-700">
              {certifications.map((c, idx) => (
                <div key={c.id || idx}>
                  <span className="font-semibold text-slate-900">{c.name}</span> — {c.issuer} ({c.date})
                </div>
              ))}
              {achievements.map((a, idx) => (
                <div key={a.id || idx}>
                  <span className="font-semibold text-slate-900">{a.title}</span>: {a.description}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
