import React from 'react';
import { ContactRow } from '../components/common/ContactRow';
import { Briefcase, Code, Award, GraduationCap, CheckCircle2, Bookmark } from 'lucide-react';

export const Template20_AltaCV = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#0f172a', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Inter', sans-serif" }}
    >
      {/* AltaCV Header */}
      <header className="border-b-2 pb-3 mb-4" style={{ borderColor: color }}>
        <div className="flex flex-col md:flex-row justify-between items-baseline">
          <div>
            <h1 className={`${fontSize?.nameSize || 'text-3xl'} font-bold tracking-tight text-slate-900`}>
              {personal.name || "Candidate Name"}
            </h1>
            <p className="text-xs font-semibold tracking-wider uppercase mt-0.5" style={{ color }}>
              {data.targetRole || "Software Engineer & Computer Scientist"}
            </p>
          </div>
          <div className="mt-2 md:mt-0 text-left md:text-right">
            <ContactRow personal={personal} className="md:justify-end text-xs" separator="•" />
          </div>
        </div>
      </header>

      {/* Two-Column Grid (60% Main / 40% Secondary) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Column (60% / col-span-7) */}
        <main className="md:col-span-7 space-y-4">
          {/* Summary */}
          {summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-1.5" style={{ borderColor: `${color}40` }}>
                Profile
              </h2>
              <p className="text-slate-700 leading-relaxed text-xs">{summary}</p>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2" style={{ borderColor: `${color}40` }}>
                Experience
              </h2>
              <div className={spacing?.itemGap || 'space-y-3'}>
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx}>
                    <div className="font-bold text-slate-900 text-sm">{exp.role}</div>
                    <div className="flex justify-between items-baseline text-xs text-slate-600 mb-1">
                      <span className="font-medium" style={{ color }}>{exp.company}</span>
                      <span>{exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}</span>
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2" style={{ borderColor: `${color}40` }}>
                Projects
              </h2>
              <div className={spacing?.itemGap || 'space-y-3'}>
                {projects.map((p, idx) => (
                  <div key={p.id || idx}>
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>{p.title}</span>
                      {(p.link || p.github) && <span className="text-xs font-normal text-blue-700">{p.link || p.github}</span>}
                    </div>
                    {p.technologies && <div className="text-[11px] text-slate-500 font-mono mb-0.5">Stack: {p.technologies}</div>}
                    {p.bullets && p.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
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
        </main>

        {/* Secondary Column (40% / col-span-5) */}
        <aside className="md:col-span-5 space-y-4">
          {/* Skills with AltaCV style rounded badges */}
          {skills && Object.keys(skills).length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2" style={{ borderColor: `${color}40` }}>
                Skills Matrix
              </h2>
              <div className="space-y-2">
                {Object.entries(skills).map(([cat, items]) => {
                  if (!Array.isArray(items) || items.length === 0) return null;
                  const formattedCat = cat === 'core' ? 'Foundations' : cat.charAt(0).toUpperCase() + cat.slice(1);
                  return (
                    <div key={cat}>
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">{formattedCat}</div>
                      <div className="flex flex-wrap gap-1">
                        {items.map((it, idx) => (
                          <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-800 text-[10.5px] px-2 py-0.5 rounded-full font-medium">
                            {it}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2" style={{ borderColor: `${color}40` }}>
                Education
              </h2>
              <div className="space-y-2 text-xs">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-700 font-medium" style={{ color }}>{edu.institution}</div>
                    <div className="text-[11px] text-slate-500">{edu.startDate} – {edu.endDate} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</div>
                    {edu.coursework && <div className="text-[10.5px] text-slate-600 mt-0.5">Coursework: {edu.coursework}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications & Achievements */}
          {(certifications?.length > 0 || achievements?.length > 0) && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2" style={{ borderColor: `${color}40` }}>
                Honors &amp; Awards
              </h2>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {achievements.map((a, idx) => (
                  <li key={a.id || idx}>
                    <div className="font-bold text-slate-900">{a.title}</div>
                    <div className="text-[11px] text-slate-600">{a.description}</div>
                  </li>
                ))}
                {certifications.map((c, idx) => (
                  <li key={c.id || idx}>
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.issuer} ({c.date})</div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};
