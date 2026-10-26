import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

export const Template18_TwentySeconds = ({ data = {}, customization = {} }) => {
  const { personal = {}, summary, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data;
  const { color = '#0f172a', font, spacing, fontSize } = customization;

  return (
    <div
      className="w-full bg-white text-slate-900 flex flex-col md:flex-row min-h-[850px]"
      style={{ fontFamily: font?.fontFamily || "'Inter', sans-serif" }}
    >
      {/* Twenty Seconds Accent Sidebar (32% width) */}
      <aside className="w-full md:w-[32%] text-white p-6 space-y-5" style={{ backgroundColor: color }}>
        {/* Name in Sidebar */}
        <div>
          <h1 className={`${fontSize?.nameSize || 'text-2xl'} font-bold tracking-tight text-white leading-tight`}>
            {personal.name || "Candidate Name"}
          </h1>
          <p className="text-xs font-medium text-slate-300 uppercase tracking-wider mt-1">
            {data.targetRole || "Software Engineer"}
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-[11.5px] text-slate-200 border-t border-white/20 pt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-white">Contact</div>
          {personal.email && (
            <div className="flex items-center gap-2 break-all">
              <Mail className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              <span>{personal.email}</span>
            </div>
          )}
          {personal.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              <span>{personal.phone}</span>
            </div>
          )}
          {personal.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              <span>{personal.location}</span>
            </div>
          )}
          {personal.linkedin && (
            <div className="flex items-center gap-2 break-all">
              <Linkedin className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              <span>{personal.linkedin.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
          {personal.github && (
            <div className="flex items-center gap-2 break-all">
              <Github className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              <span>{personal.github.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
        </div>

        {/* Skills in Sidebar */}
        {skills && Object.keys(skills).length > 0 && (
          <div className="space-y-3 border-t border-white/20 pt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-white">Skills Matrix</div>
            {Object.entries(skills).map(([cat, items]) => {
              if (!Array.isArray(items) || items.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="text-[11px] font-semibold text-slate-300 uppercase mb-1">{cat}</div>
                  <div className="flex flex-wrap gap-1">
                    {items.map((it, idx) => (
                      <span key={idx} className="bg-white/10 text-white text-[10.5px] px-1.5 py-0.5 rounded font-medium">
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Education in Sidebar */}
        {education && education.length > 0 && (
          <div className="space-y-2 border-t border-white/20 pt-4 text-xs">
            <div className="font-bold uppercase tracking-wider text-white">Education</div>
            {education.map((edu, idx) => (
              <div key={edu.id || idx}>
                <div className="font-bold text-white">{edu.degree}</div>
                <div className="text-slate-300 text-[11px]">{edu.institution}</div>
                <div className="text-slate-400 text-[10.5px]">{edu.startDate} – {edu.endDate} {edu.gpa ? `(${edu.gpa})` : ''}</div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Right Content (68% width) */}
      <main className="w-full md:w-[68%] p-7 space-y-4">
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
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{exp.role} <span className="font-normal text-slate-600">at {exp.company}</span></span>
                    <span className="text-xs font-normal text-slate-500">{exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}</span>
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
                  {p.technologies && <div className="text-[11px] text-slate-500 font-mono mb-0.5">Tools: {p.technologies}</div>}
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

        {/* Certifications & Achievements */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-1.5" style={{ borderColor: `${color}40` }}>
              Honors &amp; Certifications
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
              {certifications.map((c, idx) => (
                <li key={c.id || idx}>
                  <span className="font-semibold text-slate-900">{c.name}</span> — {c.issuer} ({c.date})
                </li>
              ))}
              {achievements.map((a, idx) => (
                <li key={a.id || idx}>
                  <span className="font-semibold text-slate-900">{a.title}</span> — {a.description}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};
