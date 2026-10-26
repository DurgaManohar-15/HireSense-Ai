import React, { useState } from 'react';
import { downloadResumeAsPdf, exportResumeAsPdf, exportResumeAsDocx, exportResumeAsJson, exportResumeAsLatex, generateLatexCode } from '../services/exportService';
import { X, FileText, Download, Code, FileCode, Printer, Check, Copy, Upload, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const ExportModal = ({
  isOpen,
  onClose,
  resumeData,
  onImportJson
}) => {
  const [activeTab, setActiveTab] = useState('pdf');
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  if (!isOpen) return null;

  const candidateName = resumeData?.personal?.name ? resumeData.personal.name.replace(/\s+/g, '_') : 'Resume';

  const handleDirectPdfDownload = async () => {
    setExportingPdf(true);
    try {
      await downloadResumeAsPdf(`${candidateName}_Resume.pdf`);
      toast.success("Resume PDF downloaded successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Direct download encountered an issue. Using Vector Print fallback...");
      exportResumeAsPdf(`${candidateName}_Resume`);
    } finally {
      setExportingPdf(false);
    }
  };

  const handlePrintPdf = () => {
    onClose();
    setTimeout(() => {
      exportResumeAsPdf(`${candidateName}_Resume`);
    }, 150);
  };

  const handleDocx = async () => {
    setExportingDocx(true);
    try {
      await exportResumeAsDocx(resumeData, `${candidateName}_Resume.docx`);
      toast.success("Microsoft Word (.docx) resume downloaded!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate DOCX");
    } finally {
      setExportingDocx(false);
    }
  };

  const handleJsonExport = () => {
    exportResumeAsJson(resumeData, `${candidateName}_Data.json`);
    toast.success("Structured JSON resume exported!");
    onClose();
  };

  const handleJsonImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.personal || parsed.skills || parsed.experience) {
          onImportJson(parsed);
          toast.success("Resume data successfully imported!");
          onClose();
        } else {
          toast.error("Invalid resume JSON structure");
        }
      } catch (err) {
        toast.error("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
  };

  const latexCode = generateLatexCode(resumeData);

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(latexCode);
    setCopiedLatex(true);
    toast.success("LaTeX source code copied!");
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  const handleDownloadLatex = () => {
    exportResumeAsLatex(resumeData, `${candidateName}_Resume.tex`);
    toast.success("LaTeX (.tex) file downloaded!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div>
            <h2 className="text-base font-bold text-white">Export &amp; Share Resume</h2>
            <p className="text-xs text-slate-400">Download your resume in multiple professional industry formats</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6 pt-2 gap-2">
          {[
            { id: 'pdf', label: 'PDF Document', icon: FileText },
            { id: 'docx', label: 'Word (.docx)', icon: FileText },
            { id: 'json', label: 'JSON Data', icon: Code },
            { id: 'latex', label: 'LaTeX (.tex)', icon: FileCode }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Professional PDF Export</span>
                  <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-semibold px-2 py-0.5 rounded-full">
                    A4 Clean Document
                  </span>
                </div>
                <p className="text-slate-300">
                  Exports your active resume template with candidate details, typography, and formatting intact.
                </p>
              </div>

              {/* Primary Direct Download Button */}
              <button
                onClick={handleDirectPdfDownload}
                disabled={exportingPdf}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {exportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Clean PDF Document...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF Document (.pdf)</span>
                  </>
                )}
              </button>

              {/* Secondary Clean Print Option */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Prefer browser print dialog?</span>
                <button
                  onClick={handlePrintPdf}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print to PDF (Isolated Sheet)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'docx' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 space-y-1.5">
                <div className="font-bold text-sm text-white">Microsoft Word (.docx) Format</div>
                <p className="text-slate-300">
                  Generates an editable Microsoft Word document matching your candidate data with standardized headings and ATS bullet hierarchies.
                </p>
              </div>

              <button
                onClick={handleDocx}
                disabled={exportingDocx}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exportingDocx ? 'Generating Word Document...' : 'Download .DOCX File'}
              </button>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 space-y-1.5">
                <div className="font-bold text-sm text-white">Structured Resume Data Backup</div>
                <p className="text-slate-300">
                  Export or import your complete structured resume profile in standard JSON format. Allows migrating profiles across devices without losing your work.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={handleJsonExport}
                  className="py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Export JSON File
                </button>

                <label className="py-3 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                  <Upload className="w-4 h-4" />
                  Import JSON File
                  <input type="file" accept=".json" onChange={handleJsonImport} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'latex' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-500">Compilable on Overleaf, pdflatex, or XeLaTeX</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLatex}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-md text-xs font-semibold flex items-center gap-1 transition"
                  >
                    {copiedLatex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLatex ? 'Copied' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={handleDownloadLatex}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .tex</span>
                  </button>
                </div>
              </div>

              <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[300px] leading-relaxed border border-slate-800">
                {latexCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
