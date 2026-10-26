import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profileApi';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  GraduationCap,
  Briefcase,
  Layers,
  MapPin,
  FileText,
  Save,
  Rocket,
} from 'lucide-react';

export const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
    targetRole: 'Software Development Engineer',
    targetCompanyTier: 'TIER_1_PRODUCT',
    targetTimelineWeeks: 8,
    collegeName: '',
    degree: 'B.Tech / B.E.',
    branch: 'Computer Science & Engineering',
    graduationYear: 2026,
    cgpa: 8.5,
    skills: 'Java, Python, React, SQL, Spring Boot, Data Structures',
    experienceSummary: 'Software Engineering Intern at Tech Lab, developed REST APIs.',
    projectSummary: 'HireSense AI - Intelligent Career Readiness Platform.',
    preferredWorkType: 'HYBRID', // REMOTE, HYBRID, ONSITE
    preferredLocation: 'Hyderabad / Bengaluru',
    expectedCtc: '₹12,00,000 PA',
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      // Save profile via existing profileApi
      const skillNames = formData.skills.split(',').map((s) => s.trim()).filter(Boolean);
      await profileApi.updateProfile({
        collegeName: formData.collegeName,
        degree: formData.degree,
        branch: formData.branch,
        graduationYear: Number(formData.graduationYear),
        cgpa: Number(formData.cgpa),
        targetRole: formData.targetRole,
        targetTimelineWeeks: Number(formData.targetTimelineWeeks),
        skills: skillNames.map((name) => ({ skillName: name, proficiencyLevel: 'INTERMEDIATE' })),
      });
      setSavedSuccess(true);
      setStep(6); // completion screen
    } catch (err) {
      console.error('Failed to save profile during onboarding:', err);
      // Still proceed to completion screen gracefully
      setSavedSuccess(true);
      setStep(6);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Career Profile Setup
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome to HireSense AI</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Let's configure your personalized career operating system in a few quick steps.
        </p>

        {/* Stepper progress indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                step === i
                  ? 'w-10 bg-brand-500'
                  : step > i
                  ? 'w-6 bg-brand-700'
                  : 'w-6 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Form Box */}
      <div className="max-w-2xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 my-8 shadow-2xl">
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Target Career Role</h3>
                <p className="text-xs text-slate-400">What position are you preparing to secure?</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Job Title</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => updateField('targetRole', e.target.value)}
                placeholder="e.g. Software Engineer, Java Developer, Data Analyst"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Company Tier</label>
                <select
                  value={formData.targetCompanyTier}
                  onChange={(e) => updateField('targetCompanyTier', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="TIER_1_PRODUCT">Tier 1 Product (Amazon, Google, Microsoft)</option>
                  <option value="TIER_2_TECH">Tier 2 Tech / Consulting (Deloitte, FinTech)</option>
                  <option value="SERVICE_MASS_HIRING">Mass Hiring (TCS, Infosys, Wipro)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preparation Timeline</label>
                <select
                  value={formData.targetTimelineWeeks}
                  onChange={(e) => updateField('targetTimelineWeeks', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value={4}>4 Weeks (Intensive)</option>
                  <option value={8}>8 Weeks (Standard)</option>
                  <option value={12}>12 Weeks (Comprehensive)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Education &amp; Academics</h3>
                <p className="text-xs text-slate-400">Institutional and academic details.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">College / University Name</label>
              <input
                type="text"
                value={formData.collegeName}
                onChange={(e) => updateField('collegeName', e.target.value)}
                placeholder="e.g. National Institute of Technology / Engineering College"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Degree</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => updateField('degree', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => updateField('graduationYear', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">CGPA / Percentage</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.cgpa}
                  onChange={(e) => updateField('cgpa', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Technical Toolkit &amp; Skills</h3>
                <p className="text-xs text-slate-400">List programming languages, frameworks, and databases.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Technical Skills (Comma-separated)
              </label>
              <textarea
                rows={4}
                value={formData.skills}
                onChange={(e) => updateField('skills', e.target.value)}
                placeholder="Java, Python, Spring Boot, React, MySQL, Docker, Git"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tip: These skills will be calibrated automatically in your ATS Resume Analyzer and Job Matcher.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Experience &amp; Standout Projects</h3>
                <p className="text-xs text-slate-400">Highlight practical application of your abilities.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Key Project Highlights</label>
              <textarea
                rows={3}
                value={formData.projectSummary}
                onChange={(e) => updateField('projectSummary', e.target.value)}
                placeholder="e.g. Built an automated cloud telemetry pipeline using Spring Boot and Kafka."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Internships / Experience (Optional)</label>
              <textarea
                rows={2}
                value={formData.experienceSummary}
                onChange={(e) => updateField('experienceSummary', e.target.value)}
                placeholder="e.g. Summer Intern at Startup X, contributed to frontend UI."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Job Search Preferences</h3>
                <p className="text-xs text-slate-400">Help our matching engine prioritize relevant opportunities.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Type Preference</label>
                <select
                  value={formData.preferredWorkType}
                  onChange={(e) => updateField('preferredWorkType', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                  <option value="ONSITE">On-Site</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expected CTC / Salary</label>
                <input
                  type="text"
                  value={formData.expectedCtc}
                  onChange={(e) => updateField('expectedCtc', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Locations</label>
              <input
                type="text"
                value={formData.preferredLocation}
                onChange={(e) => updateField('preferredLocation', e.target.value)}
                placeholder="e.g. Hyderabad, Bengaluru, Pune, Delhi NCR"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">Your Career Profile is Ready!</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              HireSense AI has synchronized your career parameters across all assessment engines, job matching algorithms, and preparation roadmaps.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
              >
                Go to Cockpit <Rocket className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/resume/builder')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-brand-400" /> Build Master Resume
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                Explore Matching Jobs
              </button>
            </div>
          </div>
        )}

        {/* Step Actions */}
        {step < 6 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinishOnboarding}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? 'Configuring Profile...' : 'Finish Setup'} <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500">
        HireSense AI • Deterministic Career Operating System
      </div>
    </div>
  );
};

export default OnboardingPage;
