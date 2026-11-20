import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderArchive, FileText, Plus, Trash2, ExternalLink, 
  Upload, Search, Award, Shield, FileCheck, Copy, 
  File, Download, Eye, X, CheckCircle2, Sparkles, AlertCircle
} from 'lucide-react';
import { documentApi } from '../../../api/documentApi';
import toast from 'react-hot-toast';

const DOC_TYPES = [
  { key: 'ALL', label: 'All Documents' },
  { key: 'RESUME', label: 'Resumes' },
  { key: 'CERTIFICATE', label: 'Certificates' },
  { key: 'COVER_LETTER', label: 'Cover Letters' },
  { key: 'TRANSCRIPT', label: 'Transcripts & Marks' },
  { key: 'PORTFOLIO', label: 'Portfolios & Links' },
  { key: 'OTHER', label: 'Other Documents' }
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'link'
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [openingDocId, setOpeningDocId] = useState(null);
  const fileInputRef = useRef(null);

  // New doc form
  const [newDoc, setNewDoc] = useState({
    title: '',
    documentType: 'RESUME',
    documentUrl: '',
    notes: ''
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentApi.getDocuments();
      setDocuments(res.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('File size exceeds 15 MB limit');
        return;
      }
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!newDoc.title.trim()) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setNewDoc(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!newDoc.title.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    setSubmitting(true);
    try {
      if (uploadMode === 'file') {
        if (!selectedFile) {
          toast.error('Please select a PDF or document file to upload');
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', newDoc.title.trim());
        formData.append('documentType', newDoc.documentType);
        if (newDoc.notes) {
          formData.append('notes', newDoc.notes.trim());
        }

        await documentApi.uploadDocument(formData);
        toast.success('Document uploaded and saved to vault!');
      } else {
        if (!newDoc.documentUrl.trim()) {
          toast.error('Please enter a document URL');
          setSubmitting(false);
          return;
        }

        await documentApi.createDocument({
          title: newDoc.title.trim(),
          documentType: newDoc.documentType,
          externalUrl: newDoc.documentUrl.trim(),
          notes: newDoc.notes ? newDoc.notes.trim() : null
        });
        toast.success('Document link cataloged successfully!');
      }

      setShowAddModal(false);
      resetForm();
      fetchDocuments();
    } catch (err) {
      console.error('Error saving document:', err);
      toast.error(err.response?.data?.message || 'Could not save document');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewDoc({ title: '', documentType: 'RESUME', documentUrl: '', notes: '' });
    setSelectedFile(null);
    setUploadMode('file');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenDocument = async (doc) => {
    // If it's an external link without uploaded file
    if (doc.externalUrl && !doc.filePath) {
      window.open(doc.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // If it's an uploaded file
    if (doc.id && doc.filePath) {
      try {
        setOpeningDocId(doc.id);
        const blob = await documentApi.downloadDocumentBlob(doc.id);
        const fileBlob = new Blob([blob], { type: doc.mimeType || 'application/pdf' });
        const objectUrl = window.URL.createObjectURL(fileBlob);
        
        // Open directly in browser tab
        const newWindow = window.open(objectUrl, '_blank');
        if (!newWindow) {
          // If popup blocked, create anchor trigger
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = doc.title || 'document.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error('Failed to view document:', err);
        toast.error('Could not open document attachment');
      } finally {
        setOpeningDocId(null);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document from your vault?')) return;
    try {
      await documentApi.deleteDocument(id);
      toast.success('Document removed');
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return null;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getDocTypeIcon = (type) => {
    switch (type) {
      case 'RESUME':
        return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'CERTIFICATE':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'TRANSCRIPT':
        return <FileCheck className="w-5 h-5 text-emerald-400" />;
      default:
        return <File className="w-5 h-5 text-blue-400" />;
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchesFilter = activeFilter === 'ALL' || d.documentType === activeFilter;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.notes && d.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Career Documents Vault</h1>
              <span className="text-xs text-indigo-400 font-semibold">Verified Artifacts &amp; Attachments</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Store and manage your resumes, PDF certificates, academic transcripts, and portfolio credentials.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 self-start md:self-auto text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" /> Add Document / PDF
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {DOC_TYPES.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeFilter === tab.key
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by title or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Loading your documents vault...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <FolderArchive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No documents cataloged</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upload your resumes, course completion PDFs, semester mark sheets, or portfolio links here.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20"
          >
            Upload Your First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-indigo-500/5 transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60">
                      {getDocTypeIcon(doc.documentType)}
                    </div>
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {doc.documentType.replace('_', ' ')}
                      </span>
                      {doc.fileSizeBytes && (
                        <span className="text-[10px] text-slate-400 ml-2">
                          {formatFileSize(doc.fileSizeBytes)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    {doc.externalUrl && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(doc.externalUrl);
                          toast.success('Link copied to clipboard!');
                        }}
                        title="Copy Link"
                        className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      title="Delete"
                      className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white line-clamp-1 mb-1 group-hover:text-indigo-300 transition">
                  {doc.title}
                </h4>

                {doc.notes && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {doc.notes}
                  </p>
                )}

                {doc.filePath && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md my-1">
                    <FileCheck className="w-3 h-3" />
                    <span>File attached in vault</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recently'}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenDocument(doc)}
                  disabled={openingDocId === doc.id}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-indigo-500/10 transition"
                >
                  {openingDocId === doc.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  ) : doc.filePath ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>View File</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
            {/* Top Glowing Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderArchive className="w-5 h-5 text-indigo-400" />
                  Add Document to Vault
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload a PDF/document or save an external verified credential
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher: Upload File vs Link */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  uploadMode === 'file'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF / File</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode('link')}
                className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  uploadMode === 'link'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>External Link / Cloud URL</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* File Upload Zone (When in 'file' mode) */}
              {uploadMode === 'file' && (
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                    Select Document File *
                  </label>
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                      selectedFile
                        ? 'border-indigo-500/80 bg-indigo-500/10'
                        : 'border-slate-700 hover:border-indigo-500/50 bg-slate-950/50 hover:bg-slate-950'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                          <FileCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{selectedFile.name}</p>
                          <p className="text-[11px] text-slate-400">{formatFileSize(selectedFile.size)} · Click to change file</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center mx-auto">
                          <Upload className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 text-xs">
                            Click to browse or drag and drop document
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Supports PDF, DOCX, DOC, TXT, PNG, JPG (Max 15MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* URL Input (When in 'link' mode) */}
              {uploadMode === 'link' && (
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                    Document URL / Link *
                  </label>
                  <div className="relative">
                    <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      required={uploadMode === 'link'}
                      placeholder="https://drive.google.com/... or https://github.com/..."
                      value={newDoc.documentUrl}
                      onChange={(e) => setNewDoc({ ...newDoc, documentUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Resume 2026, AWS Cloud Practitioner Certificate"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                  Document Category
                </label>
                <select
                  value={newDoc.documentType}
                  onChange={(e) => setNewDoc({ ...newDoc, documentType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition"
                >
                  <option value="RESUME">Resume</option>
                  <option value="CERTIFICATE">Certificate / License</option>
                  <option value="COVER_LETTER">Cover Letter</option>
                  <option value="TRANSCRIPT">Academic Transcript / Mark Sheet</option>
                  <option value="PORTFOLIO">Portfolio / Project Deliverable</option>
                  <option value="OTHER">Other Professional Document</option>
                </select>
              </div>

              {/* Notes Input */}
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                  Notes / Description (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Add license numbers, issuing organizations, or verification notes..."
                  value={newDoc.notes}
                  onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving to Vault...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{uploadMode === 'file' ? 'Upload Document' : 'Save Link'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
