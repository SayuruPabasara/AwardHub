import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAwardHub } from '../../context/AwardHubContext';
import { FileText, Send, Save, CheckCircle, ExternalLink, Paperclip } from 'lucide-react';

export default function SubmitNominationModal({ isOpen, onClose }) {
  const { categories, currentUser, submitNomination, saveNominationDraft } = useAwardHub();

  const openCategories = categories.filter((c) => c.status !== 'Archived' && c.status !== 'Completed');

  const [categoryId, setCategoryId] = useState(openCategories[0]?.id || '');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [detailedPitch, setDetailedPitch] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [selectedDocs, setSelectedDocs] = useState([]);

  const userDocs = currentUser.documents || [];

  const handleToggleDoc = (doc) => {
    const exists = selectedDocs.some((d) => d.name === doc.name);
    if (exists) {
      setSelectedDocs(selectedDocs.filter((d) => d.name !== doc.name));
    } else {
      setSelectedDocs([...selectedDocs, { name: doc.name, size: doc.size }]);
    }
  };

  const handleAction = (isSubmit) => {
    if (!title.trim() || !categoryId) return;

    const selectedCategory = categories.find((c) => c.id === categoryId);

    const nomData = {
      categoryId,
      categoryName: selectedCategory?.name || 'Selected Category',
      title: title.trim(),
      summary: summary.trim(),
      detailedPitch: detailedPitch.trim(),
      liveDemoUrl: liveDemoUrl.trim(),
      documentsAttached: selectedDocs.length > 0 ? selectedDocs : [{ name: 'Executive_Summary.pdf', size: '1.2 MB' }]
    };

    if (isSubmit) {
      submitNomination(nomData);
    } else {
      saveNominationDraft(nomData);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Award Nomination"
      subtitle="Complete your project dossier to enter the evaluation and voting stages"
      maxWidth="max-w-3xl"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAction(true);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Select Award Category *
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-medium focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
          >
            {openCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code}) - {c.status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Project / Initiative Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. BioScan: Low-Cost Edge AI for Crop Disease Detection"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Executive Summary *
          </label>
          <textarea
            required
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A concise 2-sentence summary highlighting core innovation and outcomes..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Detailed Pitch & Technical / Societal Impact
          </label>
          <textarea
            rows={4}
            value={detailedPitch}
            onChange={(e) => setDetailedPitch(e.target.value)}
            placeholder="Elaborate on the problem addressed, architecture/solution, quantitative results, and why this deserves the award..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Live Demo / Repository URL (Optional)
          </label>
          <input
            type="url"
            value={liveDemoUrl}
            onChange={(e) => setLiveDemoUrl(e.target.value)}
            placeholder="https://github.com/your-project or https://your-demo.web.app"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Attach documents from Vault */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Attach Evidence Documents from Your Vault
          </label>
          {userDocs.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500">No documents found in vault. You can upload in profile tab.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {userDocs.map((doc) => {
                const isChecked = selectedDocs.some((d) => d.name === doc.name);
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleToggleDoc(doc)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="truncate">
                      <p className="font-semibold truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{doc.size}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleAction(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            Save Draft
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Nomination
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
