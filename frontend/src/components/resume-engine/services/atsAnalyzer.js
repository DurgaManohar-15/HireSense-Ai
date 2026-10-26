/**
 * HireSense AI — ATS Optimization & Compatibility Analyzer Service
 * Evaluates contact info, section structure, formatting risks, bullet lengths, and calculates an internal Compatibility Score.
 * Explicitly disclaims guaranteed ATS scores in favor of transparent heuristics.
 */

export function analyzeResumeATS(resumeData, activeTemplate = null, customization = {}) {
  const issues = [];
  const warnings = [];
  const strengths = [];

  const { personal, summary, education, experience, projects, skills, certifications, achievements } = resumeData || {};

  // 1. Contact Info Verification
  if (!personal?.name || personal.name.trim().length < 2) {
    issues.push({ id: 'c-1', category: 'Contact', text: 'Full Name is missing or incomplete.', severity: 'high' });
  } else {
    strengths.push('Candidate name is clearly declared.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!personal?.email || !emailRegex.test(personal.email.trim())) {
    issues.push({ id: 'c-2', category: 'Contact', text: 'Valid professional email address is missing.', severity: 'high' });
  } else {
    strengths.push('Valid contact email is present.');
  }

  if (!personal?.phone || personal.phone.replace(/[^0-9]/g, '').length < 8) {
    issues.push({ id: 'c-3', category: 'Contact', text: 'Contact phone number is missing or too short.', severity: 'high' });
  } else {
    strengths.push('Phone number is provided.');
  }

  if (!personal?.location || personal.location.trim().length < 2) {
    warnings.push({ id: 'c-4', category: 'Contact', text: 'Geographic location (City, Country) is missing.', severity: 'medium' });
  }

  const hasOnlinePresence = Boolean(personal?.linkedin || personal?.github || personal?.portfolio);
  if (!hasOnlinePresence) {
    warnings.push({ id: 'c-5', category: 'Contact', text: 'No professional links (LinkedIn, GitHub, Portfolio) provided.', severity: 'medium' });
  } else {
    strengths.push('Professional links (LinkedIn/GitHub/Portfolio) available.');
  }

  // 2. Section Heading & Content Hierarchy
  if (!summary || summary.trim().length < 50) {
    warnings.push({ id: 's-1', category: 'Summary', text: 'Professional summary is short or missing (recommend 2-3 targeted sentences).', severity: 'medium' });
  } else {
    strengths.push('Targeted professional summary present.');
  }

  if (!skills || Object.values(skills).flat().length < 5) {
    issues.push({ id: 'sk-1', category: 'Skills', text: 'Technical skills list has fewer than 5 items; ATS parsers index heavily on skills.', severity: 'high' });
  } else {
    const totalSkills = Object.values(skills).flat().length;
    strengths.push(`Skills matrix contains ${totalSkills} categorized skills.`);
  }

  if (!experience || experience.length === 0) {
    warnings.push({ id: 'e-1', category: 'Experience', text: 'No work experience or internships listed.', severity: 'medium' });
  } else {
    strengths.push(`${experience.length} work experience entry/entries present.`);
    // Check experience bullets
    experience.forEach((exp, idx) => {
      if (!exp.bullets || exp.bullets.length === 0) {
        issues.push({ id: `eb-${idx}`, category: 'Experience', text: `Experience at "${exp.company || 'Company'}" has no bullet points.`, severity: 'high' });
      } else {
        exp.bullets.forEach((b, bIdx) => {
          if (b.length > 200) {
            warnings.push({ id: `ebl-${idx}-${bIdx}`, category: 'Experience', text: `Bullet point at ${exp.company} is long (${b.length} chars). Consider condensing for faster human/ATS scanning.`, severity: 'low' });
          }
        });
      }
    });
  }

  if (!projects || projects.length === 0) {
    warnings.push({ id: 'p-1', category: 'Projects', text: 'Technical projects section is empty (critical for engineering roles).', severity: 'medium' });
  } else {
    strengths.push(`${projects.length} technical project(s) showcased.`);
  }

  if (!education || education.length === 0) {
    issues.push({ id: 'ed-1', category: 'Education', text: 'Education details are missing.', severity: 'high' });
  } else {
    strengths.push('Academic qualifications clearly documented.');
  }

  // 3. Template & Layout Checks
  if (activeTemplate && !activeTemplate.atsFriendly) {
    warnings.push({
      id: 't-1',
      category: 'Layout',
      text: `Selected template "${activeTemplate.name}" uses a creative/multi-column layout. For conservative corporate ATS portals, a single-column ATS Friendly template is recommended.`,
      severity: 'medium'
    });
  }

  if (customization?.fontSize === 'small') {
    warnings.push({
      id: 'f-1',
      category: 'Typography',
      text: 'Compact font size selected. While helpful for 1-page fit, ensure text remains comfortably legible.',
      severity: 'low'
    });
  }

  // 4. Calculate Heuristic Compatibility Scores
  let formattingScore = 96;
  if (activeTemplate && !activeTemplate.atsFriendly) formattingScore -= 14;
  if (activeTemplate?.layout === 'two-column') formattingScore -= 6;

  let sectionScore = 95;
  if (!summary) sectionScore -= 10;
  if (!skills || Object.values(skills).flat().length === 0) sectionScore -= 20;
  if (!experience || experience.length === 0) sectionScore -= 10;
  if (!education || education.length === 0) sectionScore -= 15;
  if (!projects || projects.length === 0) sectionScore -= 10;
  sectionScore = Math.max(30, sectionScore);

  let readabilityScore = 94;
  if (warnings.some(w => w.category === 'Experience')) readabilityScore -= 6;
  if (issues.length > 0) readabilityScore -= issues.length * 5;
  readabilityScore = Math.max(40, readabilityScore);

  let keywordScore = 88;
  const totalSkillsCount = Object.values(skills || {}).flat().length;
  if (totalSkillsCount >= 15) keywordScore = 95;
  else if (totalSkillsCount >= 10) keywordScore = 90;
  else if (totalSkillsCount >= 5) keywordScore = 80;
  else keywordScore = 50;

  let contentQualityScore = 90;
  if (issues.length > 0) contentQualityScore -= issues.length * 6;
  if (warnings.length > 0) contentQualityScore -= warnings.length * 3;
  contentQualityScore = Math.max(45, Math.min(98, contentQualityScore));

  const totalScore = Math.round(
    (formattingScore * 0.25) +
    (sectionScore * 0.25) +
    (readabilityScore * 0.20) +
    (keywordScore * 0.15) +
    (contentQualityScore * 0.15)
  );

  return {
    score: Math.min(98, Math.max(30, totalScore)),
    disclaimer: "Internal heuristic indicator based on established parsing rules, not an absolute guarantee of any proprietary ATS algorithm score.",
    subscores: {
      keywordMatch: Math.min(100, keywordScore),
      formatting: Math.min(100, formattingScore),
      readability: Math.min(100, readabilityScore),
      sectionStructure: Math.min(100, sectionScore),
      contentQuality: Math.min(100, contentQualityScore)
    },
    issues,
    warnings,
    strengths
  };
}
