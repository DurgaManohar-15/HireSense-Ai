import React, { useState, useEffect } from 'react';
import { 
  FolderArchive, FileText, Plus, Trash2, ExternalLink, 
  Upload, Search, Filter, Award, Shield, FileCheck, Copy
} from 'lucide-react';
import { documentApi } from '../../../api/documentApi';
import toast from 'react-hot-toast';

const DOC_TYPES = [
  { key: 'ALL', label: 'All Documents' },
  { key: 'RESUME', label: 'Resumes' },
  { key: 'COVER_LETTER', label: 'Cover Letters' },
  { key: 'CERTIFICATE', label: 'Certificates' },
  { key: 'PORTFOLIO', label: 'Portfolios & Links' },
  { key: 'TRANSCRIPT', label: 'Transcripts & Marks' }
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New doc form
  const [newDoc, setNewDoc] = useState({
    title: '',
    documentType: 'RESUME',
    documentUrl: '',
    tags: '',
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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newDoc.title.trim() || !newDoc.documentUrl.trim()) {
      toast.error('Please enter a title and document link');
      return;
    }

    try {
      await documentApi.createDocument({
        ...newDoc,
        tags: newDoc.tags ? newDoc.tags.split(',').map(t => t.trim()) : []
      });
      toast.success('Document cataloged successfully!');
      setShowAddModal(false);
      setNewDoc({ title: '', documentType: 'RESUME', documentUrl: '', tags: '', notes: '' });
      fetchDocuments();
    } catch (err) {
      console.error('Error creating document:', err);
      toast.error('Could not save document');
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

  const filteredDocs = documents.filter(d => {
    const matchesFilter = activeFilter === 'ALL' || d.documentType === activeFilter;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.notes && d.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <FolderArchive className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career Documents Hub</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage your resumes, certificates, cover letters, and verifiable portfolio credentials in one place.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Document Link
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {DOC_TYPES.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                activeFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading documents...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <FolderArchive className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">No documents cataloged</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Store links to your Google Drive resumes, LinkedIn certificates, GitHub portfolios, and mark sheets.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
          >
            Add First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {doc.documentType}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(doc.documentUrl);
                        toast.success('Link copied!');
                      }}
                      title="Copy Link"
                      className="p-1 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      title="Delete"
                      className="p-1 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                  {doc.title}
                </h4>

                {doc.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {doc.notes}
                  </p>
                )}

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {doc.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  Added {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recently'}
                </span>
                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                  Open Resource <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Document Link</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Resume 2026, AWS Cloud Practitioner Cert"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Document Category</label>
                <select
                  value={newDoc.documentType}
                  onChange={(e) => setNewDoc({ ...newDoc, documentType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                >
                  <option value="RESUME">Resume</option>
                  <option value="COVER_LETTER">Cover Letter</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="PORTFOLIO">Portfolio / Project Link</option>
                  <option value="TRANSCRIPT">Academic Transcript</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">URL / Link *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... or https://github.com/..."
                  value={newDoc.documentUrl}
                  onChange={(e) => setNewDoc({ ...newDoc, documentUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="cloud, springboot, verified"
                  value={newDoc.tags}
                  onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  rows="2"
                  placeholder="Add any verification IDs or special details..."
                  value={newDoc.notes}
                  onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
