import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Database, RefreshCw, Save } from 'lucide-react';
import {
  useFetchKnowledgeDocsQuery,
  useSaveKnowledgeDocMutation,
  useDeleteKnowledgeDocMutation,
  useReindexCatalogMutation,
} from '../../features/ai/aiApi';

const KnowledgeBaseTab = () => {
  const { data, isLoading, refetch } = useFetchKnowledgeDocsQuery();
  const [saveDoc, { isLoading: isSaving }] = useSaveKnowledgeDocMutation();
  const [deleteDoc] = useDeleteKnowledgeDocMutation();
  const [reindexCatalog, { isLoading: isReindexing }] = useReindexCatalogMutation();

  const [form, setForm] = useState({ title: '', category: 'faq', content: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const docs = data?.data || [];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;

    try {
      await saveDoc(form).unwrap();
      setForm({ title: '', category: 'faq', content: '' });
      setIsFormOpen(false);
      refetch();
      alert('Knowledge document saved and vectorized!');
    } catch (err) {
      alert(err?.data?.message || 'Failed to save document.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this knowledge document?')) return;
    try {
      await deleteDoc(id).unwrap();
      refetch();
    } catch (err) {
      alert('Failed to delete document.');
    }
  };

  const handleReindex = async () => {
    try {
      const res = await reindexCatalog().unwrap();
      alert(`Re-indexed ${res.data?.indexed || 0} catalog products into vector database!`);
    } catch (err) {
      alert('Failed to re-index vector database.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div>
          <h2 className="text-lg font-bold text-on-surface">Knowledge Base & RAG Vector Management</h2>
          <p className="text-xs text-on-surface-variant">Add company policies, FAQs, and warranty docs. RAG uses these to answer customer questions accurately.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReindex}
            disabled={isReindexing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/60"
          >
            <Database className="w-3.5 h-3.5 text-primary" />
            {isReindexing ? 'Indexing Vector DB...' : 'Re-index Product Catalog'}
          </button>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-primary text-on-primary hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4" /> Add Knowledge Doc
          </button>
        </div>
      </div>

      {/* Add Document Form */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant space-y-4">
          <h3 className="text-sm font-bold text-on-surface">New Knowledge Base Document</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant">Document Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Extended Return Policy for Holidays"
                className="w-full mt-1 px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface-variant">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="faq">FAQ</option>
                <option value="return_policy">Return Policy</option>
                <option value="shipping_policy">Shipping Policy</option>
                <option value="refund_policy">Refund Policy</option>
                <option value="warranty">Warranty</option>
                <option value="company_info">Company Info</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface-variant">Content / Text Body</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              placeholder="Paste exact store policy text or FAQ question & answer..."
              className="w-full mt-1 px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-outline-variant text-on-surface"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-primary text-on-primary hover:bg-neutral-800"
            >
              <Save className="w-3.5 h-3.5" /> {isSaving ? 'Indexing...' : 'Save & Embed'}
            </button>
          </div>
        </form>
      )}

      {/* Documents Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-xs text-on-surface-variant">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /> Loading Knowledge Docs...
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-outline-variant/40">
          <BookOpen className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-2" />
          <p className="text-sm font-semibold text-on-surface">No custom knowledge documents added yet.</p>
          <p className="text-xs text-on-surface-variant mt-1">Default ShopNest policies are automatically active in RAG.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div key={doc._id} className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-on-surface">{doc.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container">
                    {doc.category}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">{doc.content}</p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-outline-variant/30 text-[10px] text-on-surface-variant">
                <span>Vectorized & Active</span>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="p-1 text-error hover:bg-error/10 rounded-md transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseTab;
