import React, { useState, useEffect } from 'react';
import { profileApi } from '../../api/profileApi';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  Save,
  Plus,
  Trash2,
  Building2,
  GraduationCap,
  Briefcase,
  Award,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  Sparkles,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
} from 'lucide-react';

export const StudentProfilePage = () => {
  const { user, updateUserState } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state initialized strictly without fake default values
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    collegeName: '',
    degree: '',
    branch: '',
    graduationYear: '',
    cgpa: '',
    targetRole: '',
    targetCompanyId: '',
    targetTimelineWeeks: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    bio: '',
    skills: [],
    projects: [],
    certifications: [],
  });

  const loadProfile = async () => {
    try {
      const [compRes, profRes] = await Promise.allSettled([
        profileApi.getTargetCompanies(),
        profileApi.getMyProfile(),
      ]);

      if (compRes.status === 'fulfilled' && compRes.value?.success) {
        setCompanies(compRes.value.data || []);
      }

      if (profRes.status === 'fulfilled' && profRes.value?.success) {
        const prof = profRes.value.data;
        setProfileData(prof);

        const initialForm = {
          firstName: prof?.firstName || user?.firstName || '',
          lastName: prof?.lastName || user?.lastName || '',
          collegeName: prof?.collegeName || '',
          degree: prof?.degree || '',
          branch: prof?.branch || '',
          graduationYear: prof?.graduationYear ? String(prof.graduationYear) : '',
          cgpa: prof?.cgpa ? String(prof.cgpa) : '',
          targetRole: prof?.targetRole || '',
          targetCompanyId: prof?.targetCompany?.id ? String(prof.targetCompany.id) : '',
          targetTimelineWeeks: prof?.targetTimelineWeeks ? String(prof.targetTimelineWeeks) : '',
          githubUrl: prof?.githubUrl || '',
          linkedinUrl: prof?.linkedinUrl || '',
          portfolioUrl: prof?.portfolioUrl || '',
          bio: prof?.bio || '',
          skills: prof?.skills || [],
          projects: prof?.projects || [],
          certifications: prof?.certifications || [],
        };

        setFormData(initialForm);

        // If student has a completed profile, show Profile View mode; otherwise show Setup Form
        if (prof?.profileComplete) {
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } else {
        // First login with no profile record at all -> Setup mode
        setFormData((prev) => ({
          ...prev,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
        }));
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleStartEdit = () => {
    setSuccessMessage('');
    setErrorMessage('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setErrorMessage('');
    if (profileData?.profileComplete) {
      // Revert to saved profile state
      setFormData({
        firstName: profileData.firstName || user?.firstName || '',
        lastName: profileData.lastName || user?.lastName || '',
        collegeName: profileData.collegeName || '',
        degree: profileData.degree || '',
        branch: profileData.branch || '',
        graduationYear: profileData.graduationYear ? String(profileData.graduationYear) : '',
        cgpa: profileData.cgpa ? String(profileData.cgpa) : '',
        targetRole: profileData.targetRole || '',
        targetCompanyId: profileData.targetCompany?.id ? String(profileData.targetCompany.id) : '',
        targetTimelineWeeks: profileData.targetTimelineWeeks ? String(profileData.targetTimelineWeeks) : '',
        githubUrl: profileData.githubUrl || '',
        linkedinUrl: profileData.linkedinUrl || '',
        portfolioUrl: profileData.portfolioUrl || '',
        bio: profileData.bio || '',
        skills: profileData.skills || [],
        projects: profileData.projects || [],
        certifications: profileData.certifications || [],
      });
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.firstName.trim()) {
      setErrorMessage('Student Name is required to save your profile.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName && formData.lastName.trim() ? formData.lastName.trim() : null,
        collegeName: formData.collegeName && formData.collegeName.trim() ? formData.collegeName.trim() : null,
        degree: formData.degree && formData.degree.trim() ? formData.degree.trim() : null,
        branch: formData.branch && formData.branch.trim() ? formData.branch.trim() : null,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : null,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        targetRole: formData.targetRole && formData.targetRole.trim() ? formData.targetRole.trim() : null,
        targetCompanyId: formData.targetCompanyId ? parseInt(formData.targetCompanyId, 10) : null,
        targetTimelineWeeks: formData.targetTimelineWeeks ? parseInt(formData.targetTimelineWeeks, 10) : null,
        githubUrl: formData.githubUrl && formData.githubUrl.trim() ? formData.githubUrl.trim() : null,
        linkedinUrl: formData.linkedinUrl && formData.linkedinUrl.trim() ? formData.linkedinUrl.trim() : null,
        portfolioUrl: formData.portfolioUrl && formData.portfolioUrl.trim() ? formData.portfolioUrl.trim() : null,
        bio: formData.bio && formData.bio.trim() ? formData.bio.trim() : null,
        skills: (formData.skills || [])
          .filter((s) => s?.name && s.name.trim())
          .map((s) => ({
            name: s.name.trim(),
            category: s.category || 'PROGRAMMING_LANGUAGE',
            proficiencyLevel: s.proficiencyLevel || 'BEGINNER',
            verifiedByAssessment: !!s.verifiedByAssessment,
          })),
        projects: (formData.projects || [])
          .filter((p) => p?.title && p.title.trim())
          .map((p) => ({
            title: p.title.trim(),
            description: p.description ? p.description.trim() : '',
            technologiesUsed: p.technologiesUsed ? p.technologiesUsed.trim() : '',
            githubLink: p.githubLink ? p.githubLink.trim() : null,
            liveDemoLink: p.liveDemoLink ? p.liveDemoLink.trim() : null,
          })),
        certifications: (formData.certifications || [])
          .filter((c) => c?.title && c.title.trim())
          .map((c) => ({
            title: c.title.trim(),
            issuingOrganization: c.issuingOrganization ? c.issuingOrganization.trim() : '',
            issueDate: c.issueDate || null,
            credentialId: c.credentialId ? c.credentialId.trim() : null,
            credentialUrl: c.credentialUrl ? c.credentialUrl.trim() : null,
          })),
      };

      const res = await profileApi.updateMyProfile(payload);
      if (res && (res.success || res.data)) {
        const updatedProf = res.data || res;
        setProfileData(updatedProf);

        setFormData({
          firstName: updatedProf?.firstName || user?.firstName || '',
          lastName: updatedProf?.lastName || user?.lastName || '',
          collegeName: updatedProf?.collegeName || '',
          degree: updatedProf?.degree || '',
          branch: updatedProf?.branch || '',
          graduationYear: updatedProf?.graduationYear ? String(updatedProf.graduationYear) : '',
          cgpa: updatedProf?.cgpa ? String(updatedProf.cgpa) : '',
          targetRole: updatedProf?.targetRole || '',
          targetCompanyId: updatedProf?.targetCompany?.id ? String(updatedProf.targetCompany.id) : '',
          targetTimelineWeeks: updatedProf?.targetTimelineWeeks ? String(updatedProf.targetTimelineWeeks) : '',
          githubUrl: updatedProf?.githubUrl || '',
          linkedinUrl: updatedProf?.linkedinUrl || '',
          portfolioUrl: updatedProf?.portfolioUrl || '',
          bio: updatedProf?.bio || '',
          skills: updatedProf?.skills || [],
          projects: updatedProf?.projects || [],
          certifications: updatedProf?.certifications || [],
        });

        setSuccessMessage('Student profile saved successfully!');
        setIsEditing(false);

        updateUserState({
          firstName: updatedProf.firstName,
          lastName: updatedProf.lastName,
          hasProfile: true,
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(res?.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Save Profile Error:', err);
      let errorMsg = 'Failed to save profile. Please verify your entries.';
      if (err?.errors && typeof err.errors === 'object') {
        errorMsg = Object.values(err.errors).join(', ');
      } else if (err?.message) {
        errorMsg = err.message;
      } else if (typeof err === 'string') {
        errorMsg = err;
      }
      setErrorMessage(errorMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  // Skill Handlers
  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [
        ...formData.skills,
        { name: '', category: 'PROGRAMMING_LANGUAGE', proficiencyLevel: 'BEGINNER', verifiedByAssessment: false },
      ],
    });
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  const updateSkill = (index, field, value) => {
    const updated = [...formData.skills];
    updated[index][field] = value;
    setFormData({ ...formData, skills: updated });
  };

  // Project Handlers
  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        { title: '', description: '', technologiesUsed: '', githubLink: '', liveDemoLink: '' },
      ],
    });
  };

  const removeProject = (index) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    });
  };

  const updateProject = (index, field, value) => {
    const updated = [...formData.projects];
    updated[index][field] = value;
    setFormData({ ...formData, projects: updated });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[460px] gap-4">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-500">Loading candidate profile...</p>
      </div>
    );
  }

  const fullName = [
    formData.firstName || profileData?.firstName || user?.firstName,
    formData.lastName || profileData?.lastName || user?.lastName,
  ]
    .filter(Boolean)
    .join(' ') || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 text-[#CBD5E1]">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#202934] bg-gradient-to-b from-[#151D26] via-[#10161C] to-[#0A0E13] p-8 sm:p-10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151D26] border border-[#202934] text-[11px] font-semibold tracking-wider uppercase text-[#E8C982] mb-2">
            <UserCheck className="w-3.5 h-3.5 text-[#E8C982]" />
            <span>Candidate Matrix</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            {isEditing
              ? profileData?.profileComplete
                ? 'Edit Student Profile'
                : 'Setup Your Student Profile'
              : 'Student Profile'}
          </h1>
          <p className="text-xs sm:text-sm text-[#8E9CAE] mt-1 max-w-xl">
            {isEditing
              ? 'Only your name is mandatory. All other academic, skill, and goal details are completely optional.'
              : 'Your verified academic credentials, placement benchmark goals, skills, and projects.'}
          </p>
        </div>

        {!isEditing && profileData?.profileComplete && (
          <button
            onClick={handleStartEdit}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#0B0E14] font-bold text-xs shadow-lg shadow-[#E8C982]/15 transition-all self-start sm:self-auto cursor-pointer active:scale-95 shrink-0"
          >
            <Edit3 className="w-4 h-4 text-[#0B0E14]" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center gap-3 text-rose-300 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: READ-ONLY PROFILE VIEW (RETURNING STUDENT)                        */}
      {/* ========================================================================= */}
      {!isEditing && profileData?.profileComplete && (
        <div className="space-y-6">
          {/* Hero Identity Card */}
          <div className="bg-[#10161C] p-6 sm:p-8 rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6 hover:border-[#E8C982]/30 transition-all">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={fullName}
                  className="w-20 h-20 rounded-2xl object-cover border border-[#202934] shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#151D26] border border-[#202934] flex items-center justify-center text-[#E8C982] text-2xl font-bold shadow-md">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">{fullName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Student
                  </span>
                </div>
                <p className="text-xs text-[#8E9CAE] flex items-center justify-center md:justify-start gap-2 font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#5A6878]" />
                  <span>{profileData.email || user?.email}</span>
                </p>
                {user?.phoneNumber && (
                  <p className="text-xs text-[#8E9CAE] flex items-center justify-center md:justify-start gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-[#5A6878]" />
                    <span>{user.phoneNumber}</span>
                  </p>
                )}
                {profileData.bio && (
                  <p className="text-xs text-[#CBD5E1] mt-2 italic max-w-md">"{profileData.bio}"</p>
                )}
              </div>
            </div>

            <div className="bg-[#11171D] p-5 rounded-2xl border border-[#202934] text-xs space-y-1.5 w-full md:w-auto min-w-[260px]">
              <span className="font-bold text-[#E8C982] block uppercase tracking-wider text-[10px]">
                Target Benchmark
              </span>
              <p className="text-white font-bold text-sm">
                {profileData.targetRole || <span className="text-[#6E7C8E] font-normal italic">Role not specified</span>}
              </p>
              <p className="text-[#8E9CAE]">
                {profileData.targetCompany?.name ? (
                  <span className="font-medium text-[#CBD5E1]">
                    {profileData.targetCompany.name} ({profileData.targetCompany.tier})
                  </span>
                ) : (
                  <span className="text-[#6E7C8E] italic">Company not specified</span>
                )}
              </p>
              {profileData.targetTimelineWeeks && (
                <p className="text-[#6E7C8E] text-[11px] pt-1 font-mono">
                  Timeline: <span className="text-[#E8C982] font-semibold">{profileData.targetTimelineWeeks} Weeks</span>
                </p>
              )}
            </div>
          </div>

          {/* Academic Information Card */}
          <div className="bg-[#10161C] p-6 rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center gap-2.5 font-bold text-white pb-3 border-b border-[#202934]">
              <GraduationCap className="w-5 h-5 text-[#E8C982]" />
              <span>Academic Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-[#11171D] rounded-xl border border-[#202934]">
                <span className="text-[10px] font-bold text-[#6E7C8E] uppercase tracking-wider block">College / University</span>
                <span className="font-semibold text-white text-sm mt-0.5 block truncate" title={profileData.collegeName}>
                  {profileData.collegeName || <span className="text-[#6E7C8E] font-normal italic">Not specified</span>}
                </span>
              </div>

              <div className="p-3.5 bg-[#11171D] rounded-xl border border-[#202934]">
                <span className="text-[10px] font-bold text-[#6E7C8E] uppercase tracking-wider block">Degree Program</span>
                <span className="font-semibold text-[#CBD5E1] text-sm mt-0.5 block truncate">
                  {profileData.degree || <span className="text-[#6E7C8E] font-normal italic">Not specified</span>}
                </span>
              </div>

              <div className="p-3.5 bg-[#11171D] rounded-xl border border-[#202934]">
                <span className="text-[10px] font-bold text-[#6E7C8E] uppercase tracking-wider block">Branch / Major</span>
                <span className="font-semibold text-[#CBD5E1] text-sm mt-0.5 block truncate">
                  {profileData.branch || <span className="text-[#6E7C8E] font-normal italic">Not specified</span>}
                </span>
              </div>

              <div className="p-3.5 bg-[#11171D] rounded-xl border border-[#202934]">
                <span className="text-[10px] font-bold text-[#6E7C8E] uppercase tracking-wider block">Graduation Year</span>
                <span className="font-semibold text-[#CBD5E1] text-sm mt-0.5 block">
                  {profileData.graduationYear ? `Class of ${profileData.graduationYear}` : <span className="text-[#6E7C8E] font-normal italic">Not specified</span>}
                </span>
              </div>

              <div className="p-3.5 bg-[#11171D] rounded-xl border border-[#202934]">
                <span className="text-[10px] font-bold text-[#6E7C8E] uppercase tracking-wider block">Cumulative CGPA</span>
                <span className="font-semibold text-white text-sm mt-0.5 block">
                  {profileData.cgpa ? `${profileData.cgpa} / 10.0` : <span className="text-[#6E7C8E] font-normal italic">Not specified</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Skills Card */}
          <div className="bg-[#10161C] p-6 rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center gap-2.5 font-bold text-white pb-3 border-b border-[#202934]">
              <Award className="w-5 h-5 text-[#E8C982]" />
              <span>Technical Skills ({profileData.skills?.length || 0})</span>
            </div>

            {profileData.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#11171D] border border-[#202934] hover:border-[#E8C982]/40 rounded-xl text-xs font-semibold text-[#CBD5E1] transition-colors"
                  >
                    <span>{skill.name}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#151D26] text-[#E8C982] rounded">
                      {skill.proficiencyLevel || 'BEGINNER'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6E7C8E] italic">No technical skills listed yet.</p>
            )}
          </div>

          {/* Technical Projects Card */}
          <div className="bg-[#10161C] p-6 rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center gap-2.5 font-bold text-white pb-3 border-b border-[#202934]">
              <Briefcase className="w-5 h-5 text-[#E8C982]" />
              <span>Technical Projects ({profileData.projects?.length || 0})</span>
            </div>

            {profileData.projects?.length > 0 ? (
              <div className="space-y-3">
                {profileData.projects.map((project, idx) => (
                  <div key={idx} className="p-4 bg-[#11171D] rounded-2xl border border-[#202934] hover:border-[#E8C982]/30 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{project.title}</h4>
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E8C982] hover:text-[#F5DFA8] transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-xs text-[#8E9CAE] leading-relaxed">{project.description}</p>
                    )}
                    {project.technologiesUsed && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.technologiesUsed.split(',').map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-0.5 bg-[#151D26] border border-[#202934] rounded text-[10px] font-medium text-[#CBD5E1]"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6E7C8E] italic">No projects listed yet.</p>
            )}
          </div>

          {/* Portfolio & Professional Links Card */}
          <div className="bg-[#10161C] p-6 rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center gap-2.5 font-bold text-white pb-3 border-b border-[#202934]">
              <LinkIcon className="w-5 h-5 text-[#E8C982]" />
              <span>Portfolio &amp; Professional Links</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-[#11171D] rounded-xl border border-[#202934] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-[#8E9CAE]" />
                  <span className="font-semibold text-white">GitHub</span>
                </div>
                {profileData.githubUrl ? (
                  <a
                    href={profileData.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#E8C982] font-bold hover:text-[#F5DFA8] flex items-center gap-1 transition-colors"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[#6E7C8E] italic">Not provided</span>
                )}
              </div>

              <div className="p-3.5 bg-[#11171D] rounded-xl border border-[#202934] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-[#8E9CAE]" />
                  <span className="font-semibold text-white">LinkedIn</span>
                </div>
                {profileData.linkedinUrl ? (
                  <a
                    href={profileData.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#E8C982] font-bold hover:text-[#F5DFA8] flex items-center gap-1 transition-colors"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[#6E7C8E] italic">Not provided</span>
                )}
              </div>

              <div className="p-3.5 bg-[#11171D] rounded-xl border border-[#202934] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#8E9CAE]" />
                  <span className="font-semibold text-white">Portfolio</span>
                </div>
                {profileData.portfolioUrl ? (
                  <a
                    href={profileData.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#E8C982] font-bold hover:text-[#F5DFA8] flex items-center gap-1 transition-colors"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[#6E7C8E] italic">Not provided</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SETUP / EDIT PROFILE FORM                                         */}
      {/* ========================================================================= */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mandatory Student Identity Section */}
          <div className="bg-[#10161C] p-6 sm:p-8 rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#202934]">
              <div className="flex items-center gap-2.5 font-bold text-white">
                <UserCheck className="w-5 h-5 text-[#E8C982]" />
                <span>Personal Information</span>
              </div>
              <span className="text-[11px] font-semibold text-[#E8C982] font-mono">
                * Mandatory: Student Name
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  First Name <span className="text-[#E8C982]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Manohar"
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  Last Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Sharma"
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  Professional Bio / Introduction (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Briefly describe your interests, core domains, and placement ambitions..."
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Academic Details Section (Optional) */}
          <div className="bg-[#10161C] p-6 sm:p-8 rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#202934]">
              <div className="flex items-center gap-2.5 font-bold text-white">
                <GraduationCap className="w-5 h-5 text-[#E8C982]" />
                <span>Academic Information (Optional)</span>
              </div>
              <span className="text-[11px] font-semibold text-[#6E7C8E]">All fields optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  College / University Name
                </label>
                <input
                  type="text"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  placeholder="e.g. ABC Engineering College"
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  Degree Program
                </label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g. B.Tech / B.E. / BCA / M.Tech"
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  Branch / Major
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <div>
                  <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2040"
                    placeholder="e.g. 2026"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                    CGPA (out of 10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.0"
                    max="10.0"
                    placeholder="e.g. 8.5"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Placement Goals & Target Benchmark Section (Optional) */}
          <div className="bg-[#10161C] p-6 sm:p-8 rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#202934]">
              <div className="flex items-center gap-2.5 font-bold text-white">
                <Building2 className="w-5 h-5 text-[#E8C982]" />
                <span>Placement Goals &amp; Target Benchmark (Optional)</span>
              </div>
              <span className="text-[11px] font-semibold text-[#6E7C8E]">All fields optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  Target Role
                </label>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  placeholder="e.g. Software Engineer / SDE-1"
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  Target Company
                </label>
                <select
                  value={formData.targetCompanyId}
                  onChange={(e) => setFormData({ ...formData, targetCompanyId: e.target.value })}
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                >
                  <option value="">-- Select Target Company (Optional) --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  Preparation Timeline
                </label>
                <select
                  value={formData.targetTimelineWeeks}
                  onChange={(e) => setFormData({ ...formData, targetTimelineWeeks: e.target.value })}
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                >
                  <option value="">-- Select Timeline (Optional) --</option>
                  <option value="4">4 Weeks (Intensive)</option>
                  <option value="8">8 Weeks (Standard)</option>
                  <option value="12">12 Weeks (Comprehensive)</option>
                  <option value="16">16 Weeks (Full Semester)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Technical Skills Section (Optional) */}
          <div className="bg-[#10161C] p-6 sm:p-8 rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#202934]">
              <div className="flex items-center gap-2.5 font-bold text-white">
                <Award className="w-5 h-5 text-[#E8C982]" />
                <span>Technical Skills (Optional)</span>
              </div>
              <button
                type="button"
                onClick={addSkill}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B0E14] bg-[#E8C982] hover:bg-[#F5DFA8] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#0B0E14]" />
                <span>Add Skill</span>
              </button>
            </div>

            {formData.skills.length === 0 ? (
              <p className="text-xs text-[#6E7C8E] italic">No skills added. Click 'Add Skill' if you would like to list competencies.</p>
            ) : (
              <div className="space-y-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#11171D] rounded-xl border border-[#202934]">
                    <input
                      type="text"
                      placeholder="Skill Name (e.g. Java, React, SQL)"
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      className="flex-1 bg-[#151D26] border border-[#202934] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60"
                    />
                    <select
                      value={skill.proficiencyLevel}
                      onChange={(e) => updateSkill(index, 'proficiencyLevel', e.target.value)}
                      className="bg-[#151D26] border border-[#202934] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="p-1.5 text-[#6E7C8E] hover:text-rose-400 rounded-lg transition-colors cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technical Projects Section (Optional) */}
          <div className="bg-[#10161C] p-6 sm:p-8 rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#202934]">
              <div className="flex items-center gap-2.5 font-bold text-white">
                <Briefcase className="w-5 h-5 text-[#E8C982]" />
                <span>Technical Projects (Optional)</span>
              </div>
              <button
                type="button"
                onClick={addProject}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B0E14] bg-[#E8C982] hover:bg-[#F5DFA8] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#0B0E14]" />
                <span>Add Project</span>
              </button>
            </div>

            {formData.projects.length === 0 ? (
              <p className="text-xs text-[#6E7C8E] italic">No projects listed. Click 'Add Project' if you would like to list projects.</p>
            ) : (
              <div className="space-y-3">
                {formData.projects.map((project, index) => (
                  <div key={index} className="p-4 bg-[#11171D] rounded-xl border border-[#202934] space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Project Title (e.g. HireSense AI)"
                        value={project.title}
                        onChange={(e) => updateProject(index, 'title', e.target.value)}
                        className="flex-1 bg-[#151D26] border border-[#202934] rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-[#E8C982]/60"
                      />
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="p-1 text-[#6E7C8E] hover:text-rose-400 transition-colors cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      placeholder="Brief description of the project architecture and impact..."
                      rows={2}
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      className="w-full bg-[#151D26] border border-[#202934] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 leading-relaxed"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Technologies (e.g. React, Spring Boot, MySQL)"
                        value={project.technologiesUsed}
                        onChange={(e) => updateProject(index, 'technologiesUsed', e.target.value)}
                        className="bg-[#151D26] border border-[#202934] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="GitHub Link (e.g. github.com/user/project)"
                        value={project.githubLink || ''}
                        onChange={(e) => updateProject(index, 'githubLink', e.target.value)}
                        className="bg-[#151D26] border border-[#202934] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio & Professional Links Section (Optional) */}
          <div className="bg-[#10161C] p-6 sm:p-8 rounded-2xl md:rounded-3xl border border-[#202934] shadow-xl space-y-4 hover:border-[#E8C982]/30 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#202934]">
              <div className="flex items-center gap-2.5 font-bold text-white">
                <LinkIcon className="w-5 h-5 text-[#E8C982]" />
                <span>Portfolio &amp; Professional Links (Optional)</span>
              </div>
              <span className="text-[11px] font-semibold text-[#6E7C8E]">All fields optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  GitHub Profile URL
                </label>
                <input
                  type="text"
                  value={formData.githubUrl || ''}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A9B0BA] uppercase tracking-wider mb-1.5">
                  Portfolio Website
                </label>
                <input
                  type="text"
                  value={formData.portfolioUrl || ''}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://yourportfolio.com"
                  className="w-full bg-[#11171D] border border-[#202934] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E8C982]/60 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            {profileData?.profileComplete && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl border border-[#202934] bg-[#11171D] hover:bg-[#1C2530] text-[#CBD5E1] hover:text-white font-semibold text-xs transition-colors cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#E8C982] hover:bg-[#F5DFA8] text-[#0B0E14] font-bold text-xs shadow-lg shadow-[#E8C982]/15 transition-all disabled:opacity-40 cursor-pointer active:scale-95"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-[#0B0E14] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#0B0E14]" />
                  <span>{profileData?.profileComplete ? 'Save Changes' : 'Save Profile'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
export default StudentProfilePage;
