import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

export const Template13_LibreCV = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#1e3a8a', font, spacing, fontSize } = customization;

  return (
    <div
      className={`w-full bg-white text-slate-900 ${spacing?.paddingClass || 'p-8'} ${fontSize?.baseSize || 'text-[12px]'} ${spacing?.lineHeight || 'leading-normal'}`}
      style={{ fontFamily: font?.fontFamily || "'Inter', sans-serif" }}
    >
      {/* Libre Header */}
      <header className="border-b-2 pb-3 mb-4" style={{ borderColor: color }}>
        <h1 className={`${fontSize?.nameSize || 'text-3xl'} font-bold tracking-tight text-slate-900`}>
          {personal.name || "Candidate Name"}
        </h1>
        <p className="text-xs font-semibold tracking-wider uppercase mt-0.5" style={{ color }}>
          {data.targetRole || "Software Engineer"}
        </p>
      </header>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column (35%) - Meta, Contact, Skills, Education */}
        <aside className="md:col-span-4 space-y-4 pr-2 border-r border-slate-200">
          {/* Contact Details */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
              Contact
            </h2>
            <div className="space-y-1.5 text-xs text-slate-700">
              {personal.email && (
                <div className="flex items-center gap-1.5 break-all">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <a href={`mailto:${personal.email}`} className="hover:underline">{personal.email}</a>
                </div>
              )}
              {personal.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{personal.phone}</span>
                </div>
              )}
              {personal.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{personal.location}</span>
                </div>
              )}
              {personal.linkedin && (
                <div className="flex items-center gap-1.5 break-all">
                  <Linkedin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{personal.linkedin.replace(/^https?:\/\//, '')}</span>
                </div>
              )}
              {personal.github && (
                <div className="flex items-center gap-1.5 break-all">
                  <Github className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{personal.github.replace(/^https?:\/\//, '')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
                Education
              </h2>
              <div className="space-y-2 text-xs">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    <div className="text-[11px] text-slate-500">{edu.startDate} – {edu.endDate}</div>
                    {edu.gpa && <div className="text-[11px] font-semibold text-slate-700">GPA: {edu.gpa}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Matrix */}
          {skills && Object.keys(skills).length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
                Skills
              </h2>
              <div className="space-y-2 text-xs">
                {Object.entries(skills).map(([cat, items]) => {
                  if (!Array.isArray(items) || items.length === 0) return null;
                  return (
                    <div key={cat}>
                      <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-0.5">{cat}</div>
                      <div className="flex flex-wrap gap-1">
                        {items.map((skill, sIdx) => (
                          <span key={sIdx} className="bg-slate-100 text-slate-800 text-[10.5px] px-1.5 py-0.5 rounded font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
                Certifications
              </h2>
              <ul className="space-y-1 text-xs text-slate-700">
                {certifications.map((c, idx) => (
                  <li key={c.id || idx}>
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.issuer} ({c.date})</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Right Column (65%) - Summary, Experience, Projects */}
        <main className="md:col-span-8 space-y-4">
          {/* Summary */}
          {summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color }}>
                Professional Summary
              </h2>
              <p className="text-slate-700 leading-relaxed text-xs">{summary}</p>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
                Work Experience
              </h2>
              <div className={spacing?.itemGap || 'space-y-3'}>
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">{exp.role}</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-semibold mb-1">{exp.company}</div>
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
              <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
                Technical Projects
              </h2>
              <div className={spacing?.itemGap || 'space-y-3'}>
                {projects.map((p, idx) => (
                  <div key={p.id || idx}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">{p.title}</span>
                      {(p.link || p.github) && <span className="text-xs font-medium" style={{ color }}>{p.link || p.github}</span>}
                    </div>
                    {p.technologies && <div className="text-[11px] text-slate-500 font-medium mb-1">Stack: {p.technologies}</div>}
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

          {/* Achievements */}
          {achievements && achievements.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color }}>
                Honors &amp; Achievements
              </h2>
              <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
                {achievements.map((a, idx) => (
                  <li key={a.id || idx}>
                    <span className="font-semibold text-slate-900">{a.title}</span>: {a.description}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
