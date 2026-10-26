import React, { useState } from 'react';
import { generateProfessionalBullets } from '../services/bulletGenerator';
import { X, Sparkles, Copy, Check, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const BulletGeneratorModal = ({
  isOpen,
  onClose,
  onInsertBullet
}) => {
  const [roughText, setRoughText] = useState("");
  const [generatedBullets, setGeneratedBullets] = useState([]);
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!roughText || roughText.trim().length < 5) {
      toast.error("Please enter a rough note or summary of what you built.");
      return;
    }
    const bullets = generateProfessionalBullets(roughText);
    setGeneratedBullets(bullets);
  };

  const handleCopy = (bullet, idx) => {
    navigator.clipboard.writeText(bullet);
    setCopiedIdx(idx);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleInsert = (bullet) => {
    if (onInsertBullet) {
      onInsertBullet(bullet);
      toast.success("Bullet point inserted!");
      onClose();
    } else {
      handleCopy(bullet, 0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">AI Action-Verb Bullet Generator</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Turn rough project or work notes into structured resume bullets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Enter your rough notes or draft
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. made hostel website using react node mysql with search and booking"
                value={roughText}
                onChange={(e) => setRoughText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleGenerate}
                className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition shadow-sm whitespace-nowrap flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
            <span>Try:</span>
            {[
              "made hostel website using react node mysql",
              "built rest api in spring boot with jwt auth",
              "wrote automated test cases with junit 5"
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => setRoughText(p)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                "{p}"
              </button>
            ))}
          </div>

          {/* Ethical Guardrail */}
          <div className="flex items-start gap-2 p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 rounded-xl text-xs text-purple-900 dark:text-purple-300">
            <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Authenticity First:</strong> This engine elevates sentence structure and active voice without hallucinating fake percentages (e.g. "improved by 40%") unless you provided verified numbers.
            </p>
          </div>

          {/* Results */}
          {generatedBullets.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Calibrated Professional Variations
              </span>
              {generatedBullets.map((bullet, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {bullet}
                  </p>
                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-750">
                    <button
                      onClick={() => handleCopy(bullet, idx)}
                      className="px-2.5 py-1 text-xs font-semibold rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                    {onInsertBullet && (
                      <button
                        onClick={() => handleInsert(bullet)}
                        className="px-3 py-1 text-xs font-bold rounded bg-purple-600 hover:bg-purple-700 text-white transition shadow-xs"
                      >
                        Insert into Resume
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
