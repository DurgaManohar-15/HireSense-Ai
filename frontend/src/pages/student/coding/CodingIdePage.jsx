import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { codingApi } from '../../../api/codingApi';
import {
  Code2,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  FileCode,
  Terminal,
} from 'lucide-react';

export const CodingIdePage = () => {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description'); // description, hints, solution

  useEffect(() => {
    loadProblem();
  }, [id]);

  const loadProblem = async () => {
    setLoading(true);
    try {
      const p = await codingApi.getProblemById(id);
      setProblem(p);
      // Load starter code for selected language
      try {
        const starterMap = JSON.parse(p.starterCodeJson);
        setCode(starterMap[language] || starterMap['java'] || '');
      } catch {
        setCode('// Write your solution here\n');
      }
    } catch (err) {
      console.error('Failed to load problem:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem?.starterCodeJson) {
      try {
        const starterMap = JSON.parse(problem.starterCodeJson);
        setCode(starterMap[newLang] || '');
      } catch {
        // preserve current
      }
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await codingApi.runCode(id, {
        language,
        code,
      });
      setRunResult(res);
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setRunResult(null);
    try {
      const res = await codingApi.submitCode(id, {
        language,
        code,
      });
      setRunResult(res);
      if (res.passed) {
        setProblem((prev) => ({ ...prev, solved: true }));
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 text-center">
        <h2 className="text-xl font-bold">Problem Not Found</h2>
        <Link to="/coding" className="text-brand-400 mt-4 inline-block text-xs font-semibold">
          ← Back to Coding Problems
        </Link>
      </div>
    );
  }

  let examples = [];
  try {
    examples = problem.examplesJson ? JSON.parse(problem.examplesJson) : [];
  } catch {}

  let hints = [];
  try {
    hints = problem.hintsJson ? JSON.parse(problem.hintsJson) : [];
  } catch {}

  let solutionObj = null;
  try {
    solutionObj = problem.solutionJson ? JSON.parse(problem.solutionJson) : null;
  } catch {}

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/coding"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white">{problem.title}</h1>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                problem.difficulty === 'EASY'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : problem.difficulty === 'MEDIUM'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {problem.difficulty}
            </span>
            {problem.solved && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Solved
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-xs px-3 py-1.5 text-slate-200"
          >
            <option value="java">Java 17/21</option>
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="cpp">C++ 20</option>
          </select>

          {/* Run Code */}
          <button
            onClick={handleRun}
            disabled={running || submitting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />{' '}
            {running ? 'Executing...' : 'Run Code'}
          </button>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={running || submitting}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Send className="w-3 h-3" /> {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Description, Hints, Solution */}
        <div className="w-full lg:w-1/2 border-r border-slate-800 overflow-y-auto max-h-[calc(100vh-56px)] p-6 space-y-6">
          {/* Left Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeLeftTab === 'description'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveLeftTab('hints')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeLeftTab === 'hints'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Hints ({hints.length})
            </button>
            <button
              onClick={() => setActiveLeftTab('solution')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeLeftTab === 'solution'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Solution
            </button>
          </div>

          {activeLeftTab === 'description' && (
            <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
              <div className="whitespace-pre-line text-slate-200">{problem.description}</div>

              {/* Examples */}
              {examples.map((ex, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono">
                  <div className="font-bold text-slate-400 uppercase text-[10px]">Example {idx + 1}:</div>
                  <div><strong className="text-white">Input:</strong> {ex.input}</div>
                  <div><strong className="text-white">Output:</strong> {ex.output}</div>
                  {ex.explanation && (
                    <div className="text-slate-400 font-sans mt-1"><strong>Explanation:</strong> {ex.explanation}</div>
                  )}
                </div>
              ))}

              {/* Constraints */}
              {problem.constraints && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-slate-400 uppercase text-[10px] mb-1.5">Constraints:</div>
                  <div className="font-mono text-slate-300 whitespace-pre-line">{problem.constraints}</div>
                </div>
              )}
            </div>
          )}

          {activeLeftTab === 'hints' && (
            <div className="space-y-3">
              {hints.map((hint, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-amber-400 block mb-1">Hint {idx + 1}:</span>
                  <p>{hint}</p>
                </div>
              ))}
            </div>
          )}

          {activeLeftTab === 'solution' && solutionObj && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-brand-400 font-bold block">Approach: {solutionObj.approach}</span>
                <div className="flex items-center gap-4 text-slate-400 font-mono">
                  <span>Time: <strong className="text-white">{solutionObj.timeComplexity}</strong></span>
                  <span>Space: <strong className="text-white">{solutionObj.spaceComplexity}</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-bold block mb-2">Reference Code:</span>
                <pre className="font-mono text-slate-200 text-xs overflow-x-auto whitespace-pre">
                  {solutionObj.code}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Code Editor + Test Case Output Terminal */}
        <div className="w-full lg:w-1/2 flex flex-col max-h-[calc(100vh-56px)]">
          {/* Code Editor */}
          <div className="flex-1 p-4 bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs text-slate-500 font-mono">
              <span>Solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : 'java'}</span>
              <span>UTF-8</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full bg-slate-950 font-mono text-xs text-emerald-300 leading-relaxed border-none focus:outline-none resize-none p-2"
              spellCheck={false}
            />
          </div>

          {/* Test Case Output Terminal */}
          <div className="h-64 border-t border-slate-800 bg-slate-900 p-4 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-brand-400" /> Execution Results
              </span>
              {runResult && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    runResult.passed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {runResult.status}
                </span>
              )}
            </div>

            {runResult ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-4 text-slate-400">
                  <span>Passed: <strong className="text-white">{runResult.passedCount} / {runResult.totalCount}</strong></span>
                  <span>Runtime: <strong className="text-white">{runResult.runtimeMs} ms</strong></span>
                  <span>Memory: <strong className="text-white">{runResult.memoryMb} MB</strong></span>
                </div>

                {runResult.errorMessage && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 font-mono text-[11px]">
                    {runResult.errorMessage}
                  </div>
                )}

                {/* Individual Case details */}
                {runResult.testCaseResults?.map((tc, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border font-mono text-[11px] ${
                      tc.passed ? 'bg-slate-950 border-slate-800' : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>{tc.input}</span>
                      <span className={tc.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {tc.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <div>Expected: <span className="text-emerald-300">{tc.expectedOutput}</span></div>
                    <div>Actual: <span className={tc.passed ? 'text-emerald-300' : 'text-rose-300'}>{tc.actualOutput}</span></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-xs py-8 text-center font-mono">
                Click "Run Code" to test against sample cases or "Submit" to verify complete test suites.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
