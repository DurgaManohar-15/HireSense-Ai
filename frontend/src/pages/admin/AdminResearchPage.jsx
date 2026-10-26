import React, { useState, useEffect } from 'react';
import { readinessApi } from '../../api/readinessApi';
import axiosClient from '../../api/axiosClient';
import {
  BrainCircuit,
  TrendingUp,
  Download,
  ShieldCheck,
  Award,
  AlertCircle,
  FileSpreadsheet,
  Users,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  Bot,
} from 'lucide-react';

export const AdminResearchPage = () => {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    averagePrs: 0,
    averageConfidence: 0,
    averagePreScore: 0,
    averagePostScore: 0,
    averageAbsoluteGain: 0,
    averageRelativeGainPercentage: 0,
    averageNormalizedGain: 0,
    cohensD: 0,
    totalAssessmentsCompleted: 0,
    totalResumesAnalyzed: 0,
    totalInterviewsCompleted: 0,
  });

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [metRes, recRes] = await Promise.allSettled([
        readinessApi.getCohortResearchMetrics(),
        readinessApi.getAnonymizedResearchRecords(),
      ]);

      if (metRes.status === 'fulfilled' && metRes.value?.success && metRes.value?.data) {
        setMetrics(metRes.value.data);
      } else if (metRes.status === 'rejected') {
        console.warn('Failed to load metrics:', metRes.reason);
      }

      if (recRes.status === 'fulfilled' && recRes.value?.success && Array.isArray(recRes.value?.data)) {
        setRecords(recRes.value.data);
      } else if (recRes.status === 'rejected') {
        console.warn('Failed to load records:', recRes.reason);
      }
    } catch (err) {
      console.error('Error fetching research data:', err);
      setError(err?.message || 'Failed to load research metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      const response = await axiosClient.get('/admin/research/export-csv', {
        responseType: 'blob',
      });
      const dataBlob = response?.data || response;
      const url = window.URL.createObjectURL(new Blob([dataBlob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hiresense_research_data_anonymized.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download CSV:', err);
      setError('Failed to export research CSV. Please verify admin privileges.');
    } finally {
      setDownloading(false);
    }
  };

  const filteredRecords = (records || []).filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r?.anonymizedId?.toLowerCase().includes(q) ||
      r?.scoringVersion?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Loading academic research &amp; thesis metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/30 mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>Academic Research &amp; Evaluation Infrastructure</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Thesis &amp; Research Analytics</h1>
          <p className="mt-2 text-slate-300 text-sm max-w-xl">
            Empirical cohort metrics, Hake's normalized learning gains ($g$), Cohen's $d$ effect sizes, and PII-anonymized datasets for academic validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting...' : 'Export Anonymized CSV'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Statistical Gain Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sample Size */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Cohort Sample (N)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 mt-2 block">{metrics?.totalStudents || 0}</span>
          <p className="text-[11px] text-slate-500 mt-1">Enrolled student research subjects</p>
        </div>

        {/* Normalized Gain (g) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold uppercase tracking-wider">Normalized Gain (g)</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-3xl font-black text-slate-900 mt-2 block">
            {metrics?.averageNormalizedGain != null ? metrics.averageNormalizedGain : 0}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Hake gain formula: (Post - Pre) / (100 - Pre)</p>
        </div>

        {/* Cohen's d Effect Size */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider">Cohen's d Effect Size</span>
            <Award className="w-4 h-4" />
          </div>
          <span className="text-3xl font-black text-slate-900 mt-2 block">
            {metrics?.cohensD != null ? metrics.cohensD : 0}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Standardized mean difference</p>
        </div>

        {/* Average PRS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-600">
            <span className="text-xs font-bold uppercase tracking-wider">Mean PRS Score</span>
            <BrainCircuit className="w-4 h-4" />
          </div>
          <span className="text-3xl font-black text-slate-900 mt-2 block">{metrics?.averagePrs || 0}%</span>
          <p className="text-[11px] text-slate-500 mt-1">Avg Confidence: {metrics?.averageConfidence || 0}%</p>
        </div>
      </div>

      {/* Detailed Pre vs Post Analysis Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base">Empirical Cohort Performance Distribution</h3>
          <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
            Pre-Test vs Post-Intervention
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 block uppercase font-bold">Baseline Pre-Test Mean</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{metrics?.averagePreScore || 0}%</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 block uppercase font-bold">Post-Intervention Mean</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{metrics?.averagePostScore || 0}%</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-xs text-emerald-800 block uppercase font-bold">Absolute Score Gain (Δ)</span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
              +{metrics?.averageAbsoluteGain || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Triangulation Evidence Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{metrics?.totalAssessmentsCompleted || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Diagnostic MCQs Completed</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{metrics?.totalResumesAnalyzed || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Resumes ATS Extracted</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 font-bold">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{metrics?.totalInterviewsCompleted || 0}</span>
            <span className="text-xs text-slate-500 font-medium">AI Mock Interviews Conducted</span>
          </div>
        </div>
      </div>

      {/* Anonymized Dataset Preview */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Anonymized Research Subject Records</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict PII-sanitized records featuring SHA-256 hashed identifiers for reproducible statistical analysis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Subject ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-semibold">{filteredRecords.length} Rows</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No research records found matching your search.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Subject ID</th>
                  <th className="p-4">PRS</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Pre Score</th>
                  <th className="p-4">Post Score</th>
                  <th className="p-4">Gain (Δ)</th>
                  <th className="p-4">Gain (g)</th>
                  <th className="p-4">Evidence Counts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 font-medium text-slate-700">
                    <td className="p-4 font-mono font-bold text-slate-900">{r.anonymizedId}</td>
                    <td className="p-4 font-bold text-brand-600">{r.prsScore != null ? `${r.prsScore}%` : 'N/A'}</td>
                    <td className="p-4">{r.confidenceScore != null ? `${r.confidenceScore}%` : 'N/A'}</td>
                    <td className="p-4">{r.preAssessmentScore != null ? `${r.preAssessmentScore}%` : 'N/A'}</td>
                    <td className="p-4">{r.postAssessmentScore != null ? `${r.postAssessmentScore}%` : 'N/A'}</td>
                    <td className="p-4 font-bold text-emerald-600">
                      {r.absoluteImprovement != null ? `+${r.absoluteImprovement}%` : 'N/A'}
                    </td>
                    <td className="p-4 font-mono">{r.normalizedLearningGain != null ? r.normalizedLearningGain : 'N/A'}</td>
                    <td className="p-4 text-slate-400">
                      {r.assessmentCount} Assessments • {r.resumeCount} Resumes • {r.interviewCount} Interviews
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

