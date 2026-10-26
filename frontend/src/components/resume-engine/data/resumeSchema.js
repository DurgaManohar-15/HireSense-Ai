/**
 * HireSense AI — Professional Resume Data Schema & Defaults
 * Strict separation of Content from Presentation.
 */

export const DEFAULT_RESUME_DATA = {
  personal: {
    name: "Durga Manohar Mallelli",
    email: "durga.manohar@example.com",
    phone: "+91 98765 43210",
    location: "Hyderabad, India",
    linkedin: "linkedin.com/in/durgamanohar",
    github: "github.com/durgamanohar",
    portfolio: "durgamanohar.dev"
  },

  summary: "Results-driven Software Engineer with strong foundations in object-oriented programming, data structures, and distributed systems. Experienced in designing scalable REST APIs with Spring Boot and reactive client architectures in React. Passionate about engineering high-performance placement intelligence and developer tools.",

  education: [
    {
      id: "edu-1",
      institution: "JNTU College of Engineering",
      degree: "B.Tech in Computer Science and Engineering",
      field: "Computer Science",
      startDate: "2022",
      endDate: "2026",
      gpa: "8.9 / 10.0",
      location: "Hyderabad, India",
      coursework: "Data Structures & Algorithms, Database Management Systems, Operating Systems, Computer Networks, Software Engineering"
    },
    {
      id: "edu-2",
      institution: "State Junior College",
      degree: "Intermediate (MPC)",
      field: "Mathematics, Physics, Chemistry",
      startDate: "2020",
      endDate: "2022",
      gpa: "97.4%",
      location: "Hyderabad, India",
      coursework: ""
    }
  ],

  experience: [
    {
      id: "exp-1",
      company: "Innovatech Solutions",
      role: "Software Engineering Intern",
      location: "Hyderabad, India",
      startDate: "Jun 2025",
      endDate: "Aug 2025",
      current: false,
      bullets: [
        "Architected and deployed 4 production REST microservices utilizing Spring Boot 3.3, MySQL, and Docker, reducing API response latency by 28%.",
        "Developed automated regression test suites with JUnit 5 and Mockito, expanding automated code coverage from 62% to 88%.",
        "Collaborated with senior engineers in bi-weekly Agile sprints, reviewing pull requests and standardizing API contract specifications."
      ]
    },
    {
      id: "exp-2",
      company: "Campus Tech Initiative",
      role: "Full Stack Developer",
      location: "Hyderabad, India",
      startDate: "Jan 2025",
      endDate: "May 2025",
      current: false,
      bullets: [
        "Constructed a centralized student placement portal using React 18 and Tailwind CSS serving 1,200+ registered engineering candidates.",
        "Implemented stateless JWT authentication with refresh token rotation and granular role-based access control (RBAC)."
      ]
    }
  ],

  projects: [
    {
      id: "proj-1",
      title: "HireSense AI — Placement Readiness Intelligence Platform",
      role: "Lead Architect",
      technologies: "Java 21, Spring Boot, React 18, MySQL, Tailwind CSS, Docker",
      link: "https://hiresense.ai",
      github: "github.com/durgamanohar/hiresense-ai",
      bullets: [
        "Engineered an enterprise placement readiness assessment platform featuring deterministic weighted scoring across 6 evaluation vectors.",
        "Built turn-by-turn AI mock interview simulator with rubric-based response evaluation and quantitative confidence scoring.",
        "Constructed ATS diagnostic engine analyzing keyword density, section hierarchy, and PDF parsability with sub-second response times."
      ]
    },
    {
      id: "proj-2",
      title: "Distributed In-Memory Key-Value Store",
      role: "Systems Programmer",
      technologies: "C++, Multi-threading, Socket Programming, POSIX",
      link: "",
      github: "github.com/durgamanohar/kv-store",
      bullets: [
        "Implemented high-concurrency key-value caching daemon supporting LRU eviction and reader-writer lock synchronization.",
        "Benchmarked throughput reaching 12,000+ queries per second with sub-millisecond p99 latency across socket connections."
      ]
    },
    {
      id: "proj-3",
      title: "Algorithmic Code Visualizer & Judge Sandbox",
      role: "Frontend Developer",
      technologies: "React, WebAssembly, Monaco Editor, Canvas API",
      link: "",
      github: "github.com/durgamanohar/code-sandbox",
      bullets: [
        "Created an interactive visualization workbench demonstrating graph traversal, dynamic programming, and sorting algorithms in real time.",
        "Integrated Monaco Editor with syntax linting and isolated Web Worker code execution for safe client-side code evaluation."
      ]
    }
  ],

  skills: {
    languages: ["Java", "Python", "JavaScript", "TypeScript", "C++", "SQL"],
    frontend: ["React 18", "HTML5", "CSS3", "Tailwind CSS", "Redux Toolkit", "Vite"],
    backend: ["Spring Boot 3", "REST APIs", "Hibernate / JPA", "Node.js", "Express"],
    databases: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "H2 Database"],
    tools: ["Git", "GitHub", "Docker", "Postman", "Linux", "Maven", "Vite"],
    core: ["Data Structures & Algorithms", "Object-Oriented Design (OOP)", "Database Management (DBMS)", "Operating Systems", "Computer Networks"]
  },

  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "2025",
      credentialId: "AWS-CCP-98214",
      link: ""
    },
    {
      id: "cert-2",
      name: "Oracle Certified Professional: Java SE 17 Developer",
      issuer: "Oracle Corporation",
      date: "2024",
      credentialId: "OCP-JAVA-54129",
      link: ""
    }
  ],

  achievements: [
    {
      id: "ach-1",
      title: "National Finalist — Smart India Hackathon 2025",
      description: "Selected among top 30 teams nationally out of 2,200+ submissions for automated student readiness evaluation system.",
      date: "2025"
    },
    {
      id: "ach-2",
      title: "Competitive Programming Milestone",
      description: "Solved 500+ algorithmic challenges across LeetCode & CodeChef (Top 5% rating in Global Contest).",
      date: "2024"
    }
  ],

  languages: [
    { id: "lang-1", language: "English", proficiency: "Professional Working" },
    { id: "lang-2", language: "Telugu", proficiency: "Native / Bilingual" },
    { id: "lang-3", language: "Hindi", proficiency: "Working Proficiency" }
  ],

  additional: [
    {
      id: "add-1",
      category: "Leadership & Extra-Curricular",
      items: "President of Campus Coding Club; mentored 150+ junior students in Data Structures and Web Development; coordinated annual hackathon."
    }
  ]
};

export const TARGET_ROLE_OPTIONS = [
  "Software Engineer",
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Developer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Data Scientist",
  "AI / ML Engineer",
  "Academic / Research Assistant",
  "Systems Engineer"
];

export const COLOR_PALETTES = [
  { id: "charcoal", name: "Executive Charcoal", hex: "#1e293b", textClass: "text-slate-800", bgClass: "bg-slate-800", borderClass: "border-slate-800" },
  { id: "navy", name: "Midnight Navy", hex: "#1e3a8a", textClass: "text-blue-900", bgClass: "bg-blue-900", borderClass: "border-blue-900" },
  { id: "slate", name: "Cool Slate", hex: "#334155", textClass: "text-slate-700", bgClass: "bg-slate-700", borderClass: "border-slate-700" },
  { id: "burgundy", name: "Burgundy Wine", hex: "#701a75", textClass: "text-fuchsia-900", bgClass: "bg-fuchsia-900", borderClass: "border-fuchsia-900" },
  { id: "forest", name: "Forest Pine", hex: "#065f46", textClass: "text-emerald-900", bgClass: "bg-emerald-900", borderClass: "border-emerald-900" },
  { id: "bronze", name: "Warm Bronze", hex: "#78350f", textClass: "text-amber-900", bgClass: "bg-amber-900", borderClass: "border-amber-900" },
  { id: "indigo", name: "Royal Indigo", hex: "#3730a3", textClass: "text-indigo-900", bgClass: "bg-indigo-900", borderClass: "border-indigo-900" }
];

export const FONT_OPTIONS = [
  { id: "inter", name: "Inter (Modern Sans)", fontFamily: "'Inter', sans-serif", category: "sans" },
  { id: "arial", name: "Arial (Standard ATS)", fontFamily: "Arial, sans-serif", category: "sans" },
  { id: "helvetica", name: "Helvetica (Clean Sans)", fontFamily: "'Helvetica Neue', Helvetica, sans-serif", category: "sans" },
  { id: "roboto", name: "Roboto (Tech Sans)", fontFamily: "'Roboto', sans-serif", category: "sans" },
  { id: "source_sans", name: "Source Sans (Editorial)", fontFamily: "'Source Sans Pro', sans-serif", category: "sans" },
  { id: "georgia", name: "Georgia (Academic Serif)", fontFamily: "Georgia, serif", category: "serif" }
];

export const SPACING_OPTIONS = [
  { id: "compact", name: "Compact (1-Page High Density)", paddingClass: "p-6", gapClass: "space-y-3", lineHeight: "leading-tight", itemGap: "space-y-1.5" },
  { id: "normal", name: "Normal (Standard Balance)", paddingClass: "p-8", gapClass: "space-y-4", lineHeight: "leading-normal", itemGap: "space-y-2.5" },
  { id: "spacious", name: "Spacious (Relaxed Reading)", paddingClass: "p-10", gapClass: "space-y-5", lineHeight: "leading-relaxed", itemGap: "space-y-3.5" }
];

export const FONT_SIZE_OPTIONS = [
  { id: "small", name: "Small (10pt / 12px)", baseSize: "text-[11.5px]", nameSize: "text-xl", headingSize: "text-[13px]", metaSize: "text-[11px]" },
  { id: "normal", name: "Normal (11pt / 13px)", baseSize: "text-[12.5px]", nameSize: "text-2xl", headingSize: "text-[14px]", metaSize: "text-[11.5px]" },
  { id: "large", name: "Large (12pt / 14px)", baseSize: "text-[13.5px]", nameSize: "text-3xl", headingSize: "text-[15px]", metaSize: "text-[12px]" }
];
