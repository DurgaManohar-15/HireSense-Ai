/**
 * HireSense AI — 20 Professional Resume Templates Metadata
 * Comprehensive classification, ATS compatibility heuristics, layout indicators, and target role suggestions.
 */

export const TEMPLATES_METADATA = [
  {
    id: "template-01",
    num: "01",
    name: "SWE Resume",
    category: "Developer",
    allCategories: ["ATS Friendly", "Developer"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Software Engineer", "SDE", "Full Stack Developer", "Backend Developer", "Frontend Developer"],
    description: "Single column, software-engineering focused, minimal, strong section hierarchy, ATS-first. Prioritizes technical skills, systems architecture, and quantified project impact.",
    badge: "Default SWE"
  },
  {
    id: "template-02",
    num: "02",
    name: "Professional Resume/CV",
    category: "ATS Friendly",
    allCategories: ["ATS Friendly", "Developer"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Freshers", "Software Engineers", "Corporate applications", "Engineering Graduates"],
    description: "Single column, very clean, minimal spacing, traditional professional appearance. Tested across enterprise ATS scanners for pristine parsability.",
    badge: "ATS Gold Standard"
  },
  {
    id: "template-03",
    num: "03",
    name: "Minimal CV",
    category: "ATS Friendly",
    allCategories: ["ATS Friendly"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: false,
    recommendedFor: ["Software Engineer", "Data Scientist", "General Engineering", "Product Manager"],
    description: "Minimalist, black/white or subtle accent, strong typography, zero unnecessary graphics. Crisp whitespace allows dense technical content to breathe.",
    badge: "Pure Minimalist"
  },
  {
    id: "template-04",
    num: "04",
    name: "Keyword-Focused Single Page",
    category: "ATS Friendly",
    allCategories: ["ATS Friendly", "Developer"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Software Engineer", "Full Stack Developer", "Cloud Engineer", "DevOps"],
    description: "Single page, optimized section structure with strong keyword visibility. Explicitly sequenced: Summary, Skills, Experience, Projects, Education, Certifications, Achievements.",
    badge: "Keyword Optimized"
  },
  {
    id: "template-05",
    num: "05",
    name: "Simple Professional CV",
    category: "ATS Friendly",
    allCategories: ["ATS Friendly", "Developer"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Entry-level SDE", "Full Stack Developer", "Campus Placement", "IT Specialist"],
    description: "Simple, clean, easy to scan, standard headings with solid border underlines. Uncomplicated layout maximizes reader parsing speed.",
    badge: "Campus Favorite"
  },
  {
    id: "template-06",
    num: "06",
    name: "SimpleCV",
    category: "Developer",
    allCategories: ["ATS Friendly", "Developer"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Backend Developer", "Systems Programmer", "DevOps", "Open Source Contributor"],
    description: "Minimal, single-column, compact, developer-friendly with subtle monospace touches for technology badges and repository links.",
    badge: "Compact Developer"
  },
  {
    id: "template-07",
    num: "07",
    name: "Professional Academic/Engineering CV",
    category: "Academic",
    allCategories: ["ATS Friendly", "Academic"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: false,
    supportsColor: true,
    recommendedFor: ["Graduate School", "Research Intern", "Academic Fellow", "Core Engineering"],
    description: "Single column, structured education with coursework and research emphasis, highlighting publications, technical achievements, and laboratory projects.",
    badge: "Academic & Research"
  },
  {
    id: "template-08",
    num: "08",
    name: "Modern CV",
    category: "Modern",
    allCategories: ["ATS Friendly", "Modern", "Developer"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Full Stack Developer", "AI/ML Engineer", "Product Engineer", "Tech Consultant"],
    description: "Modern, clean typography with subtle visual hierarchy and refined date alignments. Zero excessive graphics for high ATS compatibility.",
    badge: "Modern Balanced"
  },
  {
    id: "template-09",
    num: "09",
    name: "Minimal Academic CV",
    category: "Academic",
    allCategories: ["Academic"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: false,
    supportsColor: false,
    recommendedFor: ["Research Assistant", "MS/PhD Applications", "University Faculty", "Data Scientist"],
    description: "Academic/minimal, excellent classical typography, suitable for students and research-oriented applications. Clean tabular aligns for academic achievements.",
    badge: "Scholarly Formal"
  },
  {
    id: "template-10",
    num: "10",
    name: "XeLaTeX-style Professional Resume",
    category: "ATS Friendly",
    allCategories: ["ATS Friendly"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Systems Engineer", "Quant Developer", "Computer Science Researcher", "SDE"],
    description: "Clean, highly customizable, Unicode-friendly, professional typography modeled after classical TeX moderncv macros with small-caps section titles.",
    badge: "XeLaTeX Typography"
  },
  {
    id: "template-11",
    num: "11",
    name: "Traditional Curriculum Vitae",
    category: "Academic",
    allCategories: ["ATS Friendly", "Academic"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: false,
    supportsColor: true,
    recommendedFor: ["Corporate Legal/Finance", "Higher Education", "Senior Consultant", "Government"],
    description: "Conservative, formal, professional, suitable for academic and traditional corporate applications. Centered classical header with serif typography.",
    badge: "Traditional Formal"
  },
  {
    id: "template-12",
    num: "12",
    name: "Modern LaTeX CV",
    category: "Modern",
    allCategories: ["ATS Friendly", "Modern", "Developer"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Software Engineer", "Systems Architect", "Frontend/Full Stack", "DevOps"],
    description: "Modern, simple, professional, compact one-page design inspired by modern Deedy-CV and Awesome-CV with clean colored divider rules.",
    badge: "Modern LaTeX"
  },
  {
    id: "template-13",
    num: "13",
    name: "Libre CV",
    category: "Modern",
    allCategories: ["Modern"],
    layout: "two-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Full Stack Developer", "Tech Lead", "Data Analyst", "Product Designer"],
    description: "Modern two-column option with clearly separated sections. Clean column split: contact, skills, and education on left; experience and projects on right.",
    badge: "Libre Two-Column"
  },
  {
    id: "template-14",
    num: "14",
    name: "Modern Professional CV",
    category: "Modern",
    allCategories: ["Modern"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Software Engineer", "Engineering Manager", "Technical Consultant"],
    description: "Modern typography, clean section structure, subtle accent color banners, and polished corporate appearance for high-impact applications.",
    badge: "Executive Modern"
  },
  {
    id: "template-15",
    num: "15",
    name: "Modified Friggeri-style CV",
    category: "Modern",
    allCategories: ["Modern"],
    layout: "two-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Frontend Engineer", "Creative Technologist", "Full Stack Developer", "UI/UX Engineer"],
    description: "Modern, slightly more visual, professional, controlled use of accent colors. Employs left-side date gutter with machine-readable text and NO graphical skill bars.",
    badge: "Friggeri Inspired"
  },
  {
    id: "template-16",
    num: "16",
    name: "ReCeiVe-style CV",
    category: "Modern",
    allCategories: ["Modern", "Academic"],
    layout: "single-column",
    atsFriendly: true,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Software Engineer", "Research Scholar", "Open Source Maintainer"],
    description: "Highly customizable, multiple layout density controls, professional aesthetics modeled after the modern ReCeiVe LaTeX resume framework.",
    badge: "ReCeiVe Framework"
  },
  {
    id: "template-17",
    num: "17",
    name: "Modern Fancy CV",
    category: "Creative",
    allCategories: ["Modern", "Creative"],
    layout: "single-column",
    atsFriendly: false,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Product Designer", "Creative Technologist", "Frontend Specialist", "Startup Roles"],
    description: "Modern, attractive, slightly creative, still readable. Subtle geometric framing and distinct section tags without excessive graphics.",
    badge: "Modern Fancy"
  },
  {
    id: "template-18",
    num: "18",
    name: "Twenty Seconds-style CV",
    category: "Creative",
    allCategories: ["Creative"],
    layout: "two-column",
    atsFriendly: false,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["UI/UX Developer", "Growth Engineer", "Design Systems Engineer", "Tech Marketing"],
    description: "Sidebar option, modern, visually attractive with a deep accent sidebar. Keeps all resume content machine-readable in standard DOM text.",
    badge: "Twenty Seconds"
  },
  {
    id: "template-19",
    num: "19",
    name: "Infographic CV",
    category: "Creative",
    allCategories: ["Creative"],
    layout: "two-column",
    atsFriendly: false,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Creative Tech", "Portfolio Showcases", "Design Lead", "Agency Roles"],
    description: "Visual, creative, modern. Classified as Creative Resume with timeline markers and milestone badges. Not recommended as default for automated ATS.",
    badge: "Creative Infographic"
  },
  {
    id: "template-20",
    num: "20",
    name: "AltaCV-style Resume",
    category: "Modern",
    allCategories: ["Modern", "Creative"],
    layout: "two-column",
    atsFriendly: false,
    onePageOptimized: true,
    supportsColor: true,
    recommendedFor: ["Data Scientist", "Machine Learning Engineer", "Full Stack Developer", "Consultant"],
    description: "Modern, two-column layout inspired by the popular AltaCV LaTeX template. Attractive colored header rules, rounded skill pills, and crisp reading flow.",
    badge: "AltaCV Modern"
  }
];

export const TEMPLATE_CATEGORIES = [
  "All",
  "ATS Friendly",
  "Modern",
  "Creative",
  "Academic",
  "Developer"
];

/**
 * Intelligent recommendation: returns matching templates for a given target role
 */
export function getRecommendedTemplatesForRole(targetRole = "") {
  const roleLower = targetRole.toLowerCase();
  if (roleLower.includes("research") || roleLower.includes("academic") || roleLower.includes("phd") || roleLower.includes("professor")) {
    return TEMPLATES_METADATA.filter(t => t.allCategories.includes("Academic"));
  }
  if (roleLower.includes("creative") || roleLower.includes("design") || roleLower.includes("ui") || roleLower.includes("art")) {
    return TEMPLATES_METADATA.filter(t => t.allCategories.includes("Creative"));
  }
  // Default to developer / ATS
  return TEMPLATES_METADATA.filter(t => t.allCategories.includes("Developer") || t.id === "template-01");
}
