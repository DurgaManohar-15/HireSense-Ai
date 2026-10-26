/**
 * HireSense AI — Job Description Keyword Analyzer Service
 * Extracts technical and domain skills from pasted job descriptions, compares against candidate resume,
 * and surfaces matching vs missing skills without hallucinating experiences.
 */

// Common tech keywords & standard aliases dictionary
const TECH_KEYWORDS_DICTIONARY = [
  "Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Kotlin", "Swift", "Scala",
  "Spring Boot", "Spring Cloud", "Node.js", "Express", "Django", "FastAPI", "Flask", "ASP.NET", "Ruby on Rails",
  "React", "React.js", "Next.js", "Vue", "Vue.js", "Angular", "Svelte", "Redux", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra", "Elasticsearch", "DynamoDB", "Oracle", "SQLite",
  "Docker", "Kubernetes", "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud", "CI/CD", "Jenkins", "GitHub Actions",
  "Git", "GitHub", "GitLab", "Linux", "Unix", "Bash", "Shell Scripting", "REST API", "GraphQL", "gRPC", "Microservices",
  "Data Structures", "Algorithms", "System Design", "OOP", "Object-Oriented Programming", "DBMS", "Operating Systems",
  "Computer Networks", "JUnit", "Mockito", "Selenium", "Postman", "Kafka", "RabbitMQ", "Maven", "Gradle", "Webpack", "Vite",
  "Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-Learn", "Agile", "Scrum"
];

export function extractKeywordsFromJobDescription(jobDescriptionText = "", resumeData = {}) {
  if (!jobDescriptionText || jobDescriptionText.trim().length === 0) {
    return {
      requiredSkills: [],
      matchingSkills: [],
      missingSkills: [],
      matchPercentage: 0,
      suggestedKeywords: []
    };
  }

  const jdLower = jobDescriptionText.toLowerCase();

  // Find all technical terms present in the JD
  const foundInJd = new Set();
  TECH_KEYWORDS_DICTIONARY.forEach(term => {
    // Escaped boundary match
    const regex = new RegExp(`(^|[^a-zA-Z0-9_+#])${escapeRegex(term.toLowerCase())}([^a-zA-Z0-9_+#]|$)`, 'i');
    if (regex.test(jdLower)) {
      foundInJd.add(term);
    }
  });

  // Extract all existing skills from the resumeData
  const resumeText = buildSearchableResumeText(resumeData);
  const resumeLower = resumeText.toLowerCase();

  const matchingSkills = [];
  const missingSkills = [];

  foundInJd.forEach(skill => {
    const regex = new RegExp(`(^|[^a-zA-Z0-9_+#])${escapeRegex(skill.toLowerCase())}([^a-zA-Z0-9_+#]|$)`, 'i');
    if (regex.test(resumeLower)) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const totalRequired = foundInJd.size;
  const matchPercentage = totalRequired > 0 ? Math.round((matchingSkills.length / totalRequired) * 100) : 0;

  // Suggest legitimate keywords: related technologies that align with candidate's actual languages/frameworks
  const userLanguages = (resumeData?.skills?.languages || []).map(l => l.toLowerCase());
  const suggestedKeywords = missingSkills.filter(skill => {
    const skLower = skill.toLowerCase();
    // If user knows Java, Spring Cloud / Hibernate / Maven / JUnit are safe honest suggestions
    if (userLanguages.some(l => l.includes("java")) && ["Maven", "JUnit", "REST API", "Microservices", "Hibernate"].includes(skill)) {
      return true;
    }
    // If user knows React, Redux / Vite / TypeScript are safe suggestions
    if (resumeLower.includes("react") && ["Vite", "TypeScript", "Tailwind CSS", "Redux"].includes(skill)) {
      return true;
    }
    // If user knows SQL, PostgreSQL / MySQL / DBMS are safe suggestions
    if (resumeLower.includes("sql") && ["DBMS", "PostgreSQL", "MySQL"].includes(skill)) {
      return true;
    }
    return false;
  });

  return {
    requiredSkills: Array.from(foundInJd),
    matchingSkills,
    missingSkills,
    matchPercentage,
    suggestedKeywords: Array.from(new Set(suggestedKeywords))
  };
}

function buildSearchableResumeText(resumeData) {
  if (!resumeData) return "";
  const parts = [];
  if (resumeData.summary) parts.push(resumeData.summary);
  if (resumeData.skills) {
    Object.values(resumeData.skills).forEach(arr => {
      if (Array.isArray(arr)) parts.push(arr.join(" "));
    });
  }
  if (resumeData.experience) {
    resumeData.experience.forEach(exp => {
      parts.push(`${exp.company} ${exp.role} ${(exp.bullets || []).join(" ")}`);
    });
  }
  if (resumeData.projects) {
    resumeData.projects.forEach(p => {
      parts.push(`${p.title} ${p.technologies} ${(p.bullets || []).join(" ")}`);
    });
  }
  if (resumeData.education) {
    resumeData.education.forEach(e => {
      parts.push(`${e.degree} ${e.institution} ${e.coursework || ""}`);
    });
  }
  if (resumeData.certifications) {
    resumeData.certifications.forEach(c => {
      parts.push(`${c.name} ${c.issuer}`);
    });
  }
  return parts.join(" ");
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
