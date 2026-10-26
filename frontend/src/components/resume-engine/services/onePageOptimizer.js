/**
 * HireSense AI — One-Page Optimization Engine
 * Analyzes resume content density and calculates safe, non-destructive adjustments to ensure 1-page compliance.
 */

export function calculatePageOverflowRisk(resumeData) {
  let estimatedLines = 0;

  // Header & personal info ~ 4 lines
  estimatedLines += 4;

  // Summary ~ 3-4 lines
  if (resumeData?.summary) {
    estimatedLines += Math.ceil(resumeData.summary.length / 85) + 1;
  }

  // Skills ~ 4-6 lines
  if (resumeData?.skills) {
    const totalSkills = Object.values(resumeData.skills).flat().length;
    estimatedLines += Math.ceil(totalSkills / 6) + 2;
  }

  // Experience
  if (resumeData?.experience) {
    resumeData.experience.forEach(exp => {
      estimatedLines += 2; // title, company, dates
      (exp.bullets || []).forEach(b => {
        estimatedLines += Math.ceil(b.length / 85);
      });
    });
  }

  // Projects
  if (resumeData?.projects) {
    resumeData.projects.forEach(p => {
      estimatedLines += 2;
      (p.bullets || []).forEach(b => {
        estimatedLines += Math.ceil(b.length / 85);
      });
    });
  }

  // Education
  if (resumeData?.education) {
    resumeData.education.forEach(e => {
      estimatedLines += 2;
      if (e.coursework) estimatedLines += 1;
    });
  }

  // Certifications & Achievements
  if (resumeData?.certifications?.length) estimatedLines += resumeData.certifications.length + 1;
  if (resumeData?.achievements?.length) estimatedLines += resumeData.achievements.length + 1;

  // Standard A4 one-page limit is approx 48-52 formatted lines in normal mode, or 58-64 lines in compact mode.
  const isOverflowing = estimatedLines > 52;
  const overflowPercentage = Math.min(100, Math.round(((estimatedLines - 52) / 52) * 100));

  return {
    estimatedLines,
    standardPageLimit: 52,
    isOverflowing,
    overflowPercentage: isOverflowing ? overflowPercentage : 0
  };
}

export function generateOnePageOptimizationPlan(resumeData, currentCustomization = {}) {
  const suggestions = [];

  if (currentCustomization.spacing !== 'compact') {
    suggestions.push({
      id: 'opt-spacing',
      type: 'spacing',
      title: 'Set Section Margins to Compact',
      description: 'Compresses vertical margins and section padding from standard (0.5in) to compact (0.35in).',
      action: 'Change Spacing setting to "Compact"'
    });
  }

  if (currentCustomization.fontSize !== 'small') {
    suggestions.push({
      id: 'opt-font',
      type: 'font',
      title: 'Switch to Optimized 10.5pt Typography',
      description: 'Slightly scales body font from 11pt/12pt to high-density 10.5pt, retaining perfect legibility.',
      action: 'Set Font Size to "Small (10.5pt)"'
    });
  }

  // Scan for overly wordy bullets (>150 characters)
  const longBullets = [];
  (resumeData?.experience || []).forEach((exp, eIdx) => {
    (exp.bullets || []).forEach((b, bIdx) => {
      if (b.length > 150) {
        longBullets.push({
          location: `${exp.company} (Bullet #${bIdx + 1})`,
          original: b,
          suggested: condenseBullet(b)
        });
      }
    });
  });

  (resumeData?.projects || []).forEach((p, pIdx) => {
    (p.bullets || []).forEach((b, bIdx) => {
      if (b.length > 150) {
        longBullets.push({
          location: `${p.title} (Bullet #${bIdx + 1})`,
          original: b,
          suggested: condenseBullet(b)
        });
      }
    });
  });

  if (longBullets.length > 0) {
    suggestions.push({
      id: 'opt-bullets',
      type: 'bullets',
      title: `Condense ${longBullets.length} Multi-Line Bullet Point(s)`,
      description: 'Trimming filler adverbs and repetitive phrasing saves up to 4-8 vertical lines.',
      details: longBullets
    });
  }

  return suggestions;
}

function condenseBullet(text = "") {
  return text
    .replace(/\bin order to\b/gi, 'to')
    .replace(/\bresponsible for developing\b/gi, 'Developed')
    .replace(/\bworked closely with\b/gi, 'Collaborated with')
    .replace(/\bassisted in the creation of\b/gi, 'Created')
    .replace(/\bsuccessfully implemented\b/gi, 'Implemented')
    .replace(/\beffectively optimized\b/gi, 'Optimized')
    .trim();
}
