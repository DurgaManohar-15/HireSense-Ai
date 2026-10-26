import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

export const ContactRow = ({ personal = {}, className = "", itemClassName = "", iconClassName = "w-3 h-3 text-slate-500", showIcons = false, separator = "|" }) => {
  const items = [];

  if (personal.phone) {
    items.push({
      key: 'phone',
      text: personal.phone,
      icon: <Phone className={iconClassName} />,
      href: `tel:${personal.phone}`
    });
  }

  if (personal.email) {
    items.push({
      key: 'email',
      text: personal.email,
      icon: <Mail className={iconClassName} />,
      href: `mailto:${personal.email}`
    });
  }

  if (personal.location) {
    items.push({
      key: 'location',
      text: personal.location,
      icon: <MapPin className={iconClassName} />
    });
  }

  if (personal.linkedin) {
    items.push({
      key: 'linkedin',
      text: personal.linkedin.replace(/^https?:\/\/(www\.)?/, ''),
      icon: <Linkedin className={iconClassName} />,
      href: personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`
    });
  }

  if (personal.github) {
    items.push({
      key: 'github',
      text: personal.github.replace(/^https?:\/\/(www\.)?/, ''),
      icon: <Github className={iconClassName} />,
      href: personal.github.startsWith('http') ? personal.github : `https://${personal.github}`
    });
  }

  if (personal.portfolio) {
    items.push({
      key: 'portfolio',
      text: personal.portfolio.replace(/^https?:\/\/(www\.)?/, ''),
      icon: <Globe className={iconClassName} />,
      href: personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`
    });
  }

  return (
    <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-600 ${className}`}>
      {items.map((it, idx) => (
        <React.Fragment key={it.key}>
          <span className={`inline-flex items-center gap-1 ${itemClassName}`}>
            {showIcons && it.icon}
            {it.href ? (
              <a href={it.href} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                {it.text}
              </a>
            ) : (
              <span>{it.text}</span>
            )}
          </span>
          {idx < items.length - 1 && separator && (
            <span className="text-slate-300 select-none">{separator}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
