import React from 'react';
import { COLOR_PALETTES, FONT_OPTIONS, SPACING_OPTIONS, FONT_SIZE_OPTIONS, TARGET_ROLE_OPTIONS } from '../data/resumeSchema';
import { TEMPLATES_METADATA } from '../data/templatesMetadata';
import { Palette, Type, MoveVertical, ZoomIn, Briefcase, LayoutTemplate } from 'lucide-react';

export const CustomizationToolbar = ({
  customization = {},
  onChangeCustomization,
  targetRole = "",
  onChangeTargetRole,
  onOpenGallery,
  selectedTemplateId = "template-01",
  onSelectTemplate
}) => {
  const { color = '#1e293b', font = FONT_OPTIONS[0], spacing = SPACING_OPTIONS[1], fontSize = FONT_SIZE_OPTIONS[1] } = customization;

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
      {/* Left: Template Switcher & Role */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Browse Gallery Button */}
        <button
          onClick={onOpenGallery}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-white font-semibold border border-slate-700/80 transition shadow-2xs text-xs"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
          <span>Browse 20 Templates</span>
        </button>

        {/* Quick Dropdown for all 20 Templates */}
        <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1">
          <span className="text-[11px] font-semibold text-slate-400">Template:</span>
          <select
            value={selectedTemplateId}
            onChange={(e) => onSelectTemplate(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
          >
            {TEMPLATES_METADATA.map(t => (
              <option key={t.id} value={t.id} className="text-white bg-slate-900">
                {t.num}. {t.name} {t.atsFriendly ? '✓ ATS' : '★ Creative'}
              </option>
            ))}
          </select>
        </div>

        {/* Target Role Selector */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={targetRole}
            onChange={(e) => onChangeTargetRole(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 font-medium"
          >
            {TARGET_ROLE_OPTIONS.map(role => (
              <option key={role} value={role} className="text-white bg-slate-900">{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Refined Customization Controls (Harmonious Executive Colors, Typography, Spacing, Sizing) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Color Palette */}
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1.5">
            {COLOR_PALETTES.map(p => {
              const isSelected = color === p.hex;
              return (
                <button
                  key={p.id}
                  title={p.name}
                  onClick={() => onChangeCustomization({ ...customization, color: p.hex })}
                  className={`w-5 h-5 rounded-full transition-all border border-white/20 ${
                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110 shadow-sm' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: p.hex }}
                />
              );
            })}
          </div>
        </div>

        {/* Font Selector */}
        <div className="flex items-center gap-1.5 pl-2.5 border-l border-slate-800">
          <Type className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={font.id || font.name}
            onChange={(e) => {
              const selected = FONT_OPTIONS.find(f => f.id === e.target.value) || FONT_OPTIONS[0];
              onChangeCustomization({ ...customization, font: selected });
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 font-medium focus:outline-none focus:border-blue-500"
          >
            {FONT_OPTIONS.map(f => (
              <option key={f.id} value={f.id} className="text-white bg-slate-900">{f.name}</option>
            ))}
          </select>
        </div>

        {/* Spacing Selector */}
        <div className="flex items-center gap-1.5 pl-2.5 border-l border-slate-800">
          <MoveVertical className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={spacing.id || 'normal'}
            onChange={(e) => {
              const selected = SPACING_OPTIONS.find(s => s.id === e.target.value) || SPACING_OPTIONS[1];
              onChangeCustomization({ ...customization, spacing: selected });
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 font-medium focus:outline-none focus:border-blue-500"
          >
            {SPACING_OPTIONS.map(s => (
              <option key={s.id} value={s.id} className="text-white bg-slate-900">{s.name.split(' ')[0]}</option>
            ))}
          </select>
        </div>

        {/* Font Size Selector */}
        <div className="flex items-center gap-1.5 pl-2.5 border-l border-slate-800">
          <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={fontSize.id || 'normal'}
            onChange={(e) => {
              const selected = FONT_SIZE_OPTIONS.find(fs => fs.id === e.target.value) || FONT_SIZE_OPTIONS[1];
              onChangeCustomization({ ...customization, fontSize: selected });
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 font-medium focus:outline-none focus:border-blue-500"
          >
            {FONT_SIZE_OPTIONS.map(fs => (
              <option key={fs.id} value={fs.id} className="text-white bg-slate-900">{fs.name.split(' ')[0]}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
