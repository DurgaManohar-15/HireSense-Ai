/**
 * HireSense AI — Multi-Format Export Service
 * Supports PDF (crisp vector print with selectable text), Word (.docx via docx library),
 * Structured JSON (export & import), and LaTeX (.tex generation).
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import html2pdf from 'html2pdf.js';

/**
 * 1. Direct PDF Download (Saves clean A4 PDF file directly to disk)
 */
export async function downloadResumeAsPdf(fileName = "Resume.pdf") {
  const element = document.getElementById('resume-preview-sheet');
  if (!element) {
    throw new Error("Resume element not found");
  }

  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  const opt = {
    margin: [0, 0, 0, 0],
    filename: cleanFileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      scrollY: 0,
      scrollX: 0
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  return html2pdf().set(opt).from(element).save();
}

/**
 * 2. Export as PDF via Browser Print (Selectable vector text)
 */
export function exportResumeAsPdf(resumeName = "Resume") {
  document.body.classList.add('is-printing-resume');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('is-printing-resume');
  }, 1000);
}

/**
 * 2. Export as DOCX (Native Microsoft Word format using docx library)
 */
export async function exportResumeAsDocx(resumeData, fileName = "Resume.docx") {
  const { personal, summary, skills, experience, projects, education, certifications, achievements } = resumeData || {};

  const docChildren = [];

  // Candidate Name
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: personal?.name || "Candidate Name",
          bold: true,
          size: 32, // 16pt
          font: "Arial"
        })
      ],
      spacing: { after: 120 }
    })
  );

  // Contact line
  const contactParts = [
    personal?.phone,
    personal?.email,
    personal?.location,
    personal?.linkedin,
    personal?.github
  ].filter(Boolean);

  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: contactParts.join("  |  "),
          size: 20, // 10pt
          font: "Arial",
          color: "4B5563"
        })
      ],
      spacing: { after: 200 }
    })
  );

  // Helper for Section Headings
  const addSectionHeader = (title) => {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 24, // 12pt
            font: "Arial",
            color: "111827"
          })
        ],
        spacing: { before: 240, after: 100 },
        border: {
          bottom: { color: "9CA3AF", space: 1, value: "single", size: 6 }
        }
      })
    );
  };

  // Summary
  if (summary) {
    addSectionHeader("Professional Summary");
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: summary, size: 21, font: "Arial" })
        ],
        spacing: { after: 150 }
      })
    );
  }

  // Technical Skills
  if (skills && Object.keys(skills).length > 0) {
    addSectionHeader("Technical Skills");
    Object.entries(skills).forEach(([category, items]) => {
      if (Array.isArray(items) && items.length > 0) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${category.charAt(0).toUpperCase() + category.slice(1)}: `, bold: true, size: 21, font: "Arial" }),
              new TextRun({ text: items.join(", "), size: 21, font: "Arial" })
            ],
            spacing: { after: 60 }
          })
        );
      }
    });
  }

  // Work Experience
  if (experience && experience.length > 0) {
    addSectionHeader("Experience");
    experience.forEach(exp => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.role || "Role", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: ` — ${exp.company || ""}`, italic: true, size: 22, font: "Arial" }),
            new TextRun({ text: ` (${exp.startDate || ""} – ${exp.endDate || "Present"})`, size: 20, font: "Arial", color: "4B5563" })
          ],
          spacing: { before: 100, after: 60 }
        })
      );
      (exp.bullets || []).forEach(bullet => {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: bullet, size: 21, font: "Arial" })],
            spacing: { after: 40 }
          })
        );
      });
    });
  }

  // Projects
  if (projects && projects.length > 0) {
    addSectionHeader("Projects");
    projects.forEach(proj => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.title || "Project", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: proj.technologies ? ` | Technologies: ${proj.technologies}` : "", italic: true, size: 20, font: "Arial", color: "4B5563" })
          ],
          spacing: { before: 100, after: 60 }
        })
      );
      (proj.bullets || []).forEach(bullet => {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: bullet, size: 21, font: "Arial" })],
            spacing: { after: 40 }
          })
        );
      });
    });
  }

  // Education
  if (education && education.length > 0) {
    addSectionHeader("Education");
    education.forEach(edu => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree || "Degree", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: ` — ${edu.institution || ""}`, size: 21, font: "Arial" }),
            new TextRun({ text: ` (${edu.startDate || ""} – ${edu.endDate || ""})`, size: 20, font: "Arial", color: "4B5563" })
          ],
          spacing: { before: 80, after: 40 }
        })
      );
      if (edu.gpa) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `GPA/Score: ${edu.gpa}`, size: 20, font: "Arial", color: "374151" })
            ],
            spacing: { after: 40 }
          })
        );
      }
      if (edu.coursework) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Coursework: ${edu.coursework}`, size: 20, font: "Arial", color: "4B5563" })
            ],
            spacing: { after: 60 }
          })
        );
      }
    });
  }

  // Certifications
  if (certifications && certifications.length > 0) {
    addSectionHeader("Certifications");
    certifications.forEach(cert => {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: cert.name, bold: true, size: 21, font: "Arial" }),
            new TextRun({ text: ` — ${cert.issuer} (${cert.date})`, size: 20, font: "Arial", color: "4B5563" })
          ],
          spacing: { after: 40 }
        })
      );
    });
  }

  // Achievements
  if (achievements && achievements.length > 0) {
    addSectionHeader("Honors & Achievements");
    achievements.forEach(ach => {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: ach.title, bold: true, size: 21, font: "Arial" }),
            new TextRun({ text: `: ${ach.description}`, size: 20, font: "Arial" })
          ],
          spacing: { after: 40 }
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 } // 0.5 inch margins
          }
        },
        children: docChildren
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  triggerBlobDownload(blob, fileName.endsWith('.docx') ? fileName : `${fileName}.docx`);
}

/**
 * 3. Export as Structured JSON
 */
export function exportResumeAsJson(resumeData, fileName = "HireSense_Resume.json") {
  const jsonString = JSON.stringify(resumeData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  triggerBlobDownload(blob, fileName);
}

/**
 * 4. Generate LaTeX (.tex) Source Code
 */
export function generateLatexCode(resumeData) {
  const { personal, summary, skills, experience, projects, education, certifications, achievements } = resumeData || {};

  const escapeLatex = (str) => {
    if (!str) return "";
    return str
      .replace(/\\/g, '\\textbackslash ')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/~/g, '\\textasciitilde ')
      .replace(/\^/g, '\\textasciicircum ');
  };

  return `% =========================================================================
% HireSense AI — Auto-Generated LaTeX Resume
% Compatible with pdflatex / xelatex / Overleaf
% =========================================================================

\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\begin{document}

% ---------- HEADING ----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(personal?.name || "Candidate Name")}} \\\\ \\vspace{2pt}
    \\small ${escapeLatex(personal?.phone || "")} $|$ \\href{mailto:${personal?.email || ""}}{\\underline{${escapeLatex(personal?.email || "")}}} $|$ 
    \\href{https://${personal?.linkedin || ""}}{\\underline{LinkedIn}} $|$
    \\href{https://${personal?.github || ""}}{\\underline{GitHub}} $|$
    \\textmd{${escapeLatex(personal?.location || "")}}
\\end{center}

% ---------- SUMMARY ----------
${summary ? `
\\section{Summary}
\\small{${escapeLatex(summary)}}
\\vspace{4pt}
` : ""}

% ---------- TECHNICAL SKILLS ----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${skills ? Object.entries(skills).map(([k, v]) => `        \\textbf{${escapeLatex(k.charAt(0).toUpperCase() + k.slice(1))}:} {${escapeLatex(Array.isArray(v) ? v.join(", ") : "")}} \\\\`).join("\n") : ""}
    }}
\\end{itemize}
\\vspace{-10pt}

% ---------- EXPERIENCE ----------
${experience && experience.length > 0 ? `
\\section{Experience}
\\begin{itemize}[leftmargin=0.15in, label={}]
${experience.map(exp => `
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{${escapeLatex(exp.role)}} & \\small ${escapeLatex(exp.startDate)} -- ${escapeLatex(exp.endDate || "Present")} \\\\
      \\textit{\\small ${escapeLatex(exp.company)}} & \\textit{\\small ${escapeLatex(exp.location)}} \\\\
    \\end{tabular*}\\vspace{-5pt}
    \\begin{itemize}
${(exp.bullets || []).map(b => `        \\item \\small{${escapeLatex(b)}}`).join("\n")}
    \\end{itemize}
`).join("\n")}
\\end{itemize}
\\vspace{-8pt}
` : ""}

% ---------- PROJECTS ----------
${projects && projects.length > 0 ? `
\\section{Projects}
\\begin{itemize}[leftmargin=0.15in, label={}]
${projects.map(p => `
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{${escapeLatex(p.title)}} $|$ \\emph{\\small ${escapeLatex(p.technologies)}} & \\small ${escapeLatex(p.link || p.github || "")} \\\\
    \\end{tabular*}\\vspace{-5pt}
    \\begin{itemize}
${(p.bullets || []).map(b => `        \\item \\small{${escapeLatex(b)}}`).join("\n")}
    \\end{itemize}
`).join("\n")}
\\end{itemize}
\\vspace{-8pt}
` : ""}

% ---------- EDUCATION ----------
${education && education.length > 0 ? `
\\section{Education}
\\begin{itemize}[leftmargin=0.15in, label={}]
${education.map(edu => `
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{${escapeLatex(edu.institution)}} & \\small ${escapeLatex(edu.startDate)} -- ${escapeLatex(edu.endDate)} \\\\
      \\textit{\\small ${escapeLatex(edu.degree)}} & \\textit{\\small ${escapeLatex(edu.gpa ? "GPA: " + edu.gpa : "")}} \\\\
    \\end{tabular*}\\vspace{-4pt}
${edu.coursework ? `    \\small{\\textbf{Relevant Coursework:} ${escapeLatex(edu.coursework)}} \\vspace{2pt}` : ""}
`).join("\n")}
\\end{itemize}
\\vspace{-8pt}
` : ""}

% ---------- CERTIFICATIONS ----------
${certifications && certifications.length > 0 ? `
\\section{Certifications}
\\begin{itemize}[leftmargin=0.15in, label={}]
${certifications.map(c => `    \\item \\small{\\textbf{${escapeLatex(c.name)}} -- ${escapeLatex(c.issuer)} (${escapeLatex(c.date)})}`).join("\n")}
\\end{itemize}
\\vspace{-8pt}
` : ""}

% ---------- ACHIEVEMENTS ----------
${achievements && achievements.length > 0 ? `
\\section{Achievements}
\\begin{itemize}[leftmargin=0.15in, label={}]
${achievements.map(a => `    \\item \\small{\\textbf{${escapeLatex(a.title)}}: ${escapeLatex(a.description)}}`).join("\n")}
\\end{itemize}
` : ""}

\\end{document}
`;
}

/**
 * 5. Download LaTeX file
 */
export function exportResumeAsLatex(resumeData, fileName = "Resume.tex") {
  const code = generateLatexCode(resumeData);
  const blob = new Blob([code], { type: "text/x-tex" });
  triggerBlobDownload(blob, fileName);
}

function triggerBlobDownload(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
