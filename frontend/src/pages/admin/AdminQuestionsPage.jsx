import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Layers,
  Save,
  X,
} from 'lucide-react';

export const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    category: 'CORE_CS_TECHNICAL',
    topic: 'Java',
    difficulty: 'MEDIUM',
    questionText: '',
    explanation: '',
    example: '',
    useCase: '',
    marks: 1,
    options: [
      { optionLabel: 'A', optionText: '', correct: true },
      { optionLabel: 'B', optionText: '', correct: false },
      { optionLabel: 'C', optionText: '', correct: false },
      { optionLabel: 'D', optionText: '', correct: false },
    ],
  });

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 15,
        category: categoryFilter || undefined,
        difficulty: difficultyFilter || undefined,
      };
      const res = await adminApi.getQuestions(params);
      if (res.success && res.data) {
        setQuestions(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [page, categoryFilter, difficultyFilter]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      category: 'CORE_CS_TECHNICAL',
      topic: 'Java',
      difficulty: 'MEDIUM',
      questionText: '',
      explanation: '',
      example: '',
      useCase: '',
      marks: 1,
      options: [
        { optionLabel: 'A', optionText: '', correct: true },
        { optionLabel: 'B', optionText: '', correct: false },
        { optionLabel: 'C', optionText: '', correct: false },
        { optionLabel: 'D', optionText: '', correct: false },
      ],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (q) => {
    setEditingId(q.id);
    setFormData({
      category: q.category,
      topic: q.topic,
      difficulty: q.difficulty,
      questionText: q.questionText,
      explanation: q.explanation || '',
      example: q.example || '',
      useCase: q.useCase || '',
      marks: q.marks,
      options: q.options || [],
    });
    setShowModal(true);
  };

  const handleOptionCorrectChange = (index) => {
    const updated = formData.options.map((opt, i) => ({
      ...opt,
      correct: i === index,
    }));
    setFormData({ ...formData, options: updated });
  };

  const handleOptionTextChange = (index, text) => {
    const updated = [...formData.options];
    updated[index].optionText = text;
    setFormData({ ...formData, options: updated });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.updateQuestion(editingId, formData);
      } else {
        await adminApi.createQuestion(formData);
      }
      setShowModal(false);
      loadQuestions();
    } catch (err) {
      alert(err.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this question? It will be removed from future tests while preserving past attempts.')) return;
    try {
      await adminApi.deactivateQuestion(id);
      loadQuestions();
    } catch (err) {
      alert(err.message || 'Failed to deactivate question');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-600" />
            <span>Question Bank Management</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Maintain high-quality database-driven MCQ questions across Aptitude, Reasoning, Verbal, and Core CS.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="CORE_CS_TECHNICAL">Core CS / Technical</option>
            <option value="QUANTITATIVE_APTITUDE">Quantitative Aptitude</option>
            <option value="LOGICAL_REASONING">Logical Reasoning</option>
            <option value="VERBAL_ABILITY">Verbal Ability</option>
          </select>
        </div>

        <div className="min-w-[150px]">
          <select
            value={difficultyFilter}
            onChange={(e) => { setDifficultyFilter(e.target.value); setPage(0); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No questions found matching criteria.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {questions.map((q) => (
              <div key={q.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                      {q.category}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded">
                      {q.topic}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 rounded">
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">{q.questionText}</p>
                  
                  {/* Options Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {q.options?.map((opt) => (
                      <div
                        key={opt.id}
                        className={`text-xs px-2.5 py-1 rounded-lg border flex items-center justify-between ${
                          opt.correct
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                            : 'bg-slate-50 text-slate-600 border-slate-100'
                        }`}
                      >
                        <span>{opt.optionLabel}. {opt.optionText}</span>
                        {opt.correct && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-start">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeactivate(q.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Deactivate Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Question' : 'Create New Question'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="CORE_CS_TECHNICAL">Core CS / Technical</option>
                    <option value="QUANTITATIVE_APTITUDE">Quantitative Aptitude</option>
                    <option value="LOGICAL_REASONING">Logical Reasoning</option>
                    <option value="VERBAL_ABILITY">Verbal Ability</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Topic</label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. OOP, DBMS, Ratios"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Question Text</label>
                <textarea
                  rows={3}
                  required
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter the complete question prompt..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Options (Select radio for correct answer)
                </label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.correct}
                      onChange={() => handleOptionCorrectChange(idx)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="w-6 text-xs font-bold text-slate-500">{opt.optionLabel}.</span>
                    <input
                      type="text"
                      required
                      value={opt.optionText}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      placeholder={`Option ${opt.optionLabel} text`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Technical Explanation &amp; Rationale
                </label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Why is this answer correct? Provide textbook / mathematical rationale..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Programming / Real-World Example
                  </label>
                  <textarea
                    rows={2}
                    value={formData.example}
                    onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                    placeholder="e.g. Map<String, User> cache = new HashMap<>();..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Industry / Production Use Case
                  </label>
                  <textarea
                    rows={2}
                    value={formData.useCase}
                    onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                    placeholder="Where is this concept applied in engineering and production?..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
