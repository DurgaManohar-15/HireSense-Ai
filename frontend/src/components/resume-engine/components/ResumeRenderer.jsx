import React from 'react';
import { Template01_SWE } from '../templates/Template01_SWE';
import { Template02_Professional } from '../templates/Template02_Professional';
import { Template03_Minimal } from '../templates/Template03_Minimal';
import { Template04_KeywordFocused } from '../templates/Template04_KeywordFocused';
import { Template05_SimpleProfessional } from '../templates/Template05_SimpleProfessional';
import { Template06_SimpleCV } from '../templates/Template06_SimpleCV';
import { Template07_AcademicEngineering } from '../templates/Template07_AcademicEngineering';
import { Template08_Modern } from '../templates/Template08_Modern';
import { Template09_MinimalAcademic } from '../templates/Template09_MinimalAcademic';
import { Template10_XeLaTeX } from '../templates/Template10_XeLaTeX';
import { Template11_TraditionalCV } from '../templates/Template11_TraditionalCV';
import { Template12_ModernLaTeX } from '../templates/Template12_ModernLaTeX';
import { Template13_LibreCV } from '../templates/Template13_LibreCV';
import { Template14_ModernProfessional } from '../templates/Template14_ModernProfessional';
import { Template15_Friggeri } from '../templates/Template15_Friggeri';
import { Template16_ReCeiVe } from '../templates/Template16_ReCeiVe';
import { Template17_ModernFancy } from '../templates/Template17_ModernFancy';
import { Template18_TwentySeconds } from '../templates/Template18_TwentySeconds';
import { Template19_Infographic } from '../templates/Template19_Infographic';
import { Template20_AltaCV } from '../templates/Template20_AltaCV';

const TEMPLATE_COMPONENTS = {
  'template-01': Template01_SWE,
  'template-02': Template02_Professional,
  'template-03': Template03_Minimal,
  'template-04': Template04_KeywordFocused,
  'template-05': Template05_SimpleProfessional,
  'template-06': Template06_SimpleCV,
  'template-07': Template07_AcademicEngineering,
  'template-08': Template08_Modern,
  'template-09': Template09_MinimalAcademic,
  'template-10': Template10_XeLaTeX,
  'template-11': Template11_TraditionalCV,
  'template-12': Template12_ModernLaTeX,
  'template-13': Template13_LibreCV,
  'template-14': Template14_ModernProfessional,
  'template-15': Template15_Friggeri,
  'template-16': Template16_ReCeiVe,
  'template-17': Template17_ModernFancy,
  'template-18': Template18_TwentySeconds,
  'template-19': Template19_Infographic,
  'template-20': Template20_AltaCV,
  
  // Legacy / alias fallbacks
  'ivy_league': Template01_SWE,
  'faang_minimal': Template01_SWE,
  'executive_modern': Template02_Professional,
  'compact_dense': Template04_KeywordFocused,
  'tech_specialist': Template06_SimpleCV,
  'classic_ats': Template02_Professional,
  'ats_minimal': Template01_SWE
};

export const ResumeRenderer = ({
  templateId = 'template-01',
  data = {},
  customization = {}
}) => {
  const Component = TEMPLATE_COMPONENTS[templateId] || Template01_SWE;

  return (
    <div
      id="resume-preview-sheet"
      className="w-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_1px_rgba(255,255,255,0.15)] print:shadow-none print:m-0 rounded-xs border border-slate-750/60 print:border-none overflow-hidden transition-all duration-200"
    >
      <Component data={data} customization={customization} />
    </div>
  );
};

