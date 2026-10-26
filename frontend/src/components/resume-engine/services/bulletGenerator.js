/**
 * HireSense AI — Professional Bullet Point Generator Service
 * Converts rough unstructured descriptions into impact-oriented, action-verb driven bullet points.
 * CRITICAL RULE: NEVER fabricate ungrounded numerical metrics or percentages.
 */

const ACTION_VERBS = {
  engineering: ["Architected", "Engineered", "Developed", "Implemented", "Constructed", "Programmed", "Authored"],
  optimization: ["Optimized", "Streamlined", "Accelerated", "Refactored", "Enhanced", "Standardized"],
  systems: ["Integrated", "Configured", "Automated", "Orchestrated", "Containerized", "Provisioned"],
  collaboration: ["Collaborated with", "Spearheaded", "Led", "Facilitated", "Delivered", "Maintained"]
};

export function generateProfessionalBullets(roughText = "", roleContext = "Software Engineering") {
  if (!roughText || roughText.trim().length === 0) return [];

  const text = roughText.trim();
  const lower = text.toLowerCase();

  // Extract identifiable technologies if mentioned
  const detectedTech = [];
  const techKeywords = [
    "react", "react.js", "node", "node.js", "express", "express.js", "mysql", "mongodb", "postgresql",
    "spring", "spring boot", "java", "python", "c++", "docker", "kubernetes", "aws", "redis",
    "tailwind", "html", "css", "javascript", "typescript", "git", "rest", "api", "microservices"
  ];
  techKeywords.forEach(k => {
    if (lower.includes(k)) {
      // Capitalize nicely
      if (k === "react" || k === "react.js") detectedTech.push("React.js");
      else if (k === "node" || k === "node.js") detectedTech.push("Node.js");
      else if (k === "express" || k === "express.js") detectedTech.push("Express.js");
      else if (k === "mysql") detectedTech.push("MySQL");
      else if (k === "mongodb") detectedTech.push("MongoDB");
      else if (k === "postgresql") detectedTech.push("PostgreSQL");
      else if (k === "spring" || k === "spring boot") detectedTech.push("Spring Boot");
      else if (k === "tailwind") detectedTech.push("Tailwind CSS");
      else if (k === "api" || k === "rest") detectedTech.push("RESTful APIs");
      else detectedTech.push(k.charAt(0).toUpperCase() + k.slice(1));
    }
  });

  const uniqueTech = Array.from(new Set(detectedTech));
  const techString = uniqueTech.length > 0 ? ` using ${uniqueTech.join(", ")}` : "";

  // Check if user provided an explicit number or metric
  const metricMatch = text.match(/\b(\d+[%kK+]?|\d+\.\d+[%]?|\d+\s*(?:users|queries|ms|seconds|minutes|hours|days|prs|stars))\b/i);
  const userMetric = metricMatch ? ` achieving ${metricMatch[0]} benchmark` : "";

  // Generate 3 calibrated variations without hallucinated figures
  const cleanInput = text.replace(/^(i\s+made|i\s+built|made|built|worked\s+on|created)\s+/i, '').trim();

  const bullet1 = `Architected and deployed a production-grade ${cleanInput}${techString}, focusing on robust system architecture, clean modular code, and reliable error handling${userMetric}.`;
  
  const bullet2 = `Engineered an end-to-end ${cleanInput}${techString}, implementing secure user authentication, responsive UI components, and performant backend data handling.`;

  const bullet3 = `Developed and maintained ${cleanInput}${techString}, standardizing API endpoints, validating schema constraints, and ensuring strict compliance with industry design principles.`;

  return [bullet1, bullet2, bullet3];
}
