import React, { useState, useEffect } from 'react';
import { platformApi } from '../../api/platformApi';
import {
  Users,
  Search,
  Filter,
  Eye,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  BrainCircuit,
  FileText,
  Bot,
  Layers,
} from 'lucide-react';

export const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBand, setSelectedBand] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await platformApi.searchStudentsAdmin({
        query: searchQuery,
        band: selectedBand,
        targetRole: selectedRole,
      });
      if (res.success && res.data) {
        setStudents(res.data.content || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to search students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedBand, selectedRole]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleViewDetail = async (studentId) => {
    setDetailLoading(true);
    try {
      const res = await platformApi.getStudentDetailAdmin(studentId);
      if (res.success && res.data) {
        setSelectedStudentDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load student detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const getBandBadge = (band) => {
    switch (band) {
      case 'EXCELLENT':
        return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20';
      case 'GOOD':
        return 'text-white bg-white/10 border-white/20';
      case 'DEVELOPING':
        return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
      default:
        return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Student Registry</h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Real-time candidate diagnostic calibrations and placement readiness scoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#71717A] bg-[#141414] px-3.5 py-1.5 rounded-full border border-[#222222]">
            Total Records: <strong className="text-white">{students.length}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#141414] border border-[#EF4444]/30 rounded-2xl flex items-center gap-3 text-[#EF4444] text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-[#101010] p-4 rounded-2xl border border-[#222222] flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full pl-10 pr-4 py-2 bg-[#0B0B0B] border border-[#252525] rounded-xl text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#666666] transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E5E5E5] transition-all transform hover:-translate-y-0.5 shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedBand}
            onChange={(e) => setSelectedBand(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2 bg-[#0B0B0B] border border-[#252525] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#666666]"
          >
            <option value="">All Readiness Bands</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="DEVELOPING">Developing</option>
            <option value="NEEDS_IMPROVEMENT">Needs Improvement</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[#101010] rounded-2xl border border-[#222222] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.7)] overflow-hidden">
        {loading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="mt-3 text-xs text-[#71717A]">Loading registry...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-[#71717A] text-xs font-medium">
            No students found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080808] text-[#71717A] uppercase font-semibold border-b border-[#222222]">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Target Track</th>
                  <th className="p-4">PRS Score</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Readiness Band</th>
                  <th className="p-4">Completed Diagnostics</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C] font-medium text-[#A1A1AA]">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-[#141414] transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-white block">{student.name}</span>
                      <span className="text-[11px] text-[#71717A]">{student.email}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-white block">{student.targetRole}</span>
                      <span className="text-[11px] text-[#71717A]">{student.targetCompany}</span>
                    </td>
                    <td className="p-4 font-bold text-white text-sm">
                      {student.prsScore != null ? `${student.prsScore}%` : 'N/A'}
                    </td>
                    <td className="p-4 text-[#A1A1AA]">
                      {student.confidenceScore != null ? `${student.confidenceScore}%` : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getBandBadge(student.readinessBand)}`}>
                        {student.readinessBand}
                      </span>
                    </td>
                    <td className="p-4 text-[#71717A]">
                      <span>{student.assessmentsCompleted} MCQs</span>
                      <span className="mx-1.5">•</span>
                      <span>{student.hasResume ? 'Resume ✓' : 'No Resume'}</span>
                      <span className="mx-1.5">•</span>
                      <span>{student.interviewsCompleted} Interviews</span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleViewDetail(student.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161616] hover:bg-[#202020] text-white font-medium text-xs border border-[#292929] hover:border-[#3A3A3A] transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#A1A1AA]" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#101010] rounded-2xl border border-[#292929] p-7 md:p-8 max-w-2xl w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] animate-fadeIn max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedStudentDetail.name}</h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  {selectedStudentDetail.email} • {selectedStudentDetail.profile?.degree || 'B.Tech'} ({selectedStudentDetail.profile?.branch || 'Computer Science'})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1.5 rounded-lg hover:bg-[#1A1A1A] text-[#71717A] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PRS Scorecard */}
            {selectedStudentDetail.readiness ? (
              <div className="bg-[#141414] p-5 rounded-xl border border-[#222222] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Placement Readiness Score</span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-3xl font-extrabold text-white">{selectedStudentDetail.readiness.prsScore}</span>
                    <span className="text-[#71717A] font-medium text-xs">/ 100</span>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border mt-2 ${getBandBadge(selectedStudentDetail.readiness.readinessBand)}`}>
                    {selectedStudentDetail.readiness.readinessBand}
                  </span>
                </div>

                <div className="text-right text-xs">
                  <span className="text-[#71717A] font-semibold uppercase block">Confidence</span>
                  <span className="text-2xl font-bold text-white mt-1 block">{selectedStudentDetail.readiness.confidenceScore}%</span>
                  <span className="text-[11px] text-[#71717A] block mt-1">
                    Target: {selectedStudentDetail.readiness.targetRole}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#141414] rounded-xl border border-[#222222] text-xs text-[#A1A1AA] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Diagnostic Calibration Pending</span>
                  <span className="text-[#71717A]">Comprehensive PRS index will generate upon taking initial assessment or interview.</span>
                </div>
              </div>
            )}

            {/* Diagnostic Dimensions */}
            <div>
              <h4 className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-2.5">Diagnostic Dimension Scores</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                <div className="p-3 bg-[#141414] rounded-xl border border-[#222222]">
                  <span className="text-[#71717A] block text-[11px]">Technical</span>
                  <span className="font-bold text-white text-sm mt-1 block">{selectedStudentDetail.readiness?.technicalScore != null ? `${selectedStudentDetail.readiness.technicalScore}%` : 'Pending'}</span>
                </div>
                <div className="p-3 bg-[#141414] rounded-xl border border-[#222222]">
                  <span className="text-[#71717A] block text-[11px]">Aptitude</span>
                  <span className="font-bold text-white text-sm mt-1 block">{selectedStudentDetail.readiness?.aptitudeScore != null ? `${selectedStudentDetail.readiness.aptitudeScore}%` : 'Pending'}</span>
                </div>
                <div className="p-3 bg-[#141414] rounded-xl border border-[#222222]">
                  <span className="text-[#71717A] block text-[11px]">Resume</span>
                  <span className="font-bold text-white text-sm mt-1 block">{selectedStudentDetail.readiness?.resumeScore != null ? `${selectedStudentDetail.readiness.resumeScore}%` : (selectedStudentDetail.resumeCount > 0 ? 'Uploaded' : 'No Resume')}</span>
                </div>
                <div className="p-3 bg-[#141414] rounded-xl border border-[#222222]">
                  <span className="text-[#71717A] block text-[11px]">Interview</span>
                  <span className="font-bold text-white text-sm mt-1 block">{selectedStudentDetail.readiness?.interviewScore != null ? `${selectedStudentDetail.readiness.interviewScore}%` : (selectedStudentDetail.interviewCount > 0 ? 'Completed' : 'Pending')}</span>
                </div>
              </div>
            </div>

            {/* Completed Diagnostics Counts */}
            <div className="p-4 bg-[#141414] rounded-xl border border-[#222222] grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <span className="text-[#71717A] block text-[10px] uppercase font-semibold">MCQ Tests</span>
                <span className="text-base font-bold text-white mt-0.5 block">{selectedStudentDetail.assessmentCount || 0}</span>
              </div>
              <div>
                <span className="text-[#71717A] block text-[10px] uppercase font-semibold">Resumes</span>
                <span className="text-base font-bold text-white mt-0.5 block">{selectedStudentDetail.resumeCount || 0}</span>
              </div>
              <div>
                <span className="text-[#71717A] block text-[10px] uppercase font-semibold">Interviews</span>
                <span className="text-base font-bold text-white mt-0.5 block">{selectedStudentDetail.interviewCount || 0}</span>
              </div>
            </div>

            {/* Skill Gaps Breakdown */}
            <div>
              <h4 className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-2.5">Identified Skill Gaps</h4>
              {selectedStudentDetail.skillGaps && selectedStudentDetail.skillGaps.length > 0 ? (
                <div className="space-y-2">
                  {selectedStudentDetail.skillGaps.map((gap, idx) => (
                    <div key={idx} className="p-3 bg-[#141414] rounded-xl border border-[#222222] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white">{gap.skillName}</span>
                        <span className="text-[10px] text-[#71717A] ml-2">({gap.category})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#A1A1AA]">Observed: {gap.observedProficiency}%</span>
                        {gap.gapScore > 0 && (
                          <span className="px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444] rounded text-[10px] font-semibold border border-[#EF4444]/20">
                            Gap -{gap.gapScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#71717A] italic p-3 bg-[#141414] rounded-xl border border-[#222222]">
                  No active benchmark skill gaps found or diagnostic evaluation pending.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsPage;
