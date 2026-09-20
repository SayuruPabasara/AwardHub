import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useAwardHub } from '../../context/AwardHubContext';
import { Sliders, Calendar, ShieldCheck, Plus, Trash2 } from 'lucide-react';

export default function CategoryManagerModal({ isOpen, onClose, categoryToEdit = null }) {
  const { createCategory, updateCategory, users } = useAwardHub();

  const judgesList = users.filter((u) => u.role === 'judge');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    eligibility: '',
    status: 'Nomination Open',
    evaluationMode: 'hybrid',
    weights: { judge: 60, public: 40 },
    schedules: {
      nominationStart: '2026-08-01',
      nominationEnd: '2026-08-25',
      evaluationStart: '2026-08-26',
      evaluationEnd: '2026-09-20',
      votingStart: '2026-09-01',
      votingEnd: '2026-09-30'
    },
    assignedJudges: ['usr-judge-1'],
    rubric: [
      { id: 'crit-1', name: 'Innovation & Originality', maxScore: 10, weight: 30, description: 'Novelty of approach' },
      { id: 'crit-2', name: 'Technical Depth & Architecture', maxScore: 10, weight: 30, description: 'Code & architectural quality' },
      { id: 'crit-3', name: 'Real-world Societal Impact', maxScore: 10, weight: 25, description: 'Practical value & adoption' },
      { id: 'crit-4', name: 'Presentation & Documentation', maxScore: 10, weight: 15, description: 'Documentation clarity' }
    ]
  });

  useEffect(() => {
    if (categoryToEdit) {
      setFormData(categoryToEdit);
    } else {
      setFormData({
        name: '',
        code: `CAT-${Math.floor(100 + Math.random() * 900)}`,
        description: '',
        eligibility: '',
        status: 'Nomination Open',
        evaluationMode: 'hybrid',
        weights: { judge: 60, public: 40 },
        schedules: {
          nominationStart: '2026-08-01',
          nominationEnd: '2026-08-25',
          evaluationStart: '2026-08-26',
          evaluationEnd: '2026-09-20',
          votingStart: '2026-09-01',
          votingEnd: '2026-09-30'
        },
        assignedJudges: judgesList.slice(0, 2).map((j) => j.id),
        rubric: [
          { id: 'crit-1', name: 'Innovation & Originality', maxScore: 10, weight: 40, description: 'Novelty of approach' },
          { id: 'crit-2', name: 'Technical Depth', maxScore: 10, weight: 30, description: 'Code & engineering quality' },
          { id: 'crit-3', name: 'Demonstrated Impact', maxScore: 10, weight: 30, description: 'User value and results' }
        ]
      });
    }
  }, [categoryToEdit, isOpen]);

  const handleJudgeWeightChange = (newJudgeWeight) => {
    const j = Math.max(0, Math.min(100, Number(newJudgeWeight)));
    setFormData((prev) => ({
      ...prev,
      weights: { judge: j, public: 100 - j }
    }));
  };

  const handleToggleJudge = (judgeId) => {
    setFormData((prev) => {
      const exists = prev.assignedJudges.includes(judgeId);
      return {
        ...prev,
        assignedJudges: exists
          ? prev.assignedJudges.filter((id) => id !== judgeId)
          : [...prev.assignedJudges, judgeId]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, formData);
    } else {
      createCategory(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Configure Award Category' : 'Create New Award Category'}
      subtitle="Define eligibility rules, hybrid weights, schedules, and assigned judges"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Category Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Best Innovative Cloud Platform"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Category Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Category Description
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of what this award honors..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Eligibility Requirements & Criteria
          </label>
          <input
            type="text"
            value={formData.eligibility}
            onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            placeholder="e.g. Must have working live prototype, enrolled undergraduate student..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Lifecycle Status & Evaluation Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Category Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="Draft">Draft</option>
              <option value="Nomination Open">Nomination Open</option>
              <option value="Evaluation">Evaluation (Judges scoring)</option>
              <option value="Voting Active">Voting Active (Public ballot open)</option>
              <option value="Completed">Completed (Ready for publication)</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Evaluation Approach
            </label>
            <select
              value={formData.evaluationMode}
              onChange={(e) => {
                const mode = e.target.value;
                let weights = { judge: 60, public: 40 };
                if (mode === 'judge_only') weights = { judge: 100, public: 0 };
                if (mode === 'public_only') weights = { judge: 0, public: 100 };
                setFormData({ ...formData, evaluationMode: mode, weights });
              }}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="hybrid">Hybrid (Weighted Judge + Public Vote)</option>
              <option value="judge_only">Judge Evaluation Only (100% Judges)</option>
              <option value="public_only">Public Voting Only (100% Popular Vote)</option>
            </select>
          </div>
        </div>

        {/* Hybrid Weighting Slider */}
        {formData.evaluationMode === 'hybrid' && (
          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Hybrid Score Formula Configuration
              </span>
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                {formData.weights.judge}% Judges / {formData.weights.public}% Public
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={formData.weights.judge}
              onChange={(e) => handleJudgeWeightChange(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              <span>Higher Judge Rigor (e.g. 80/20)</span>
              <span>Balanced (50/50)</span>
              <span>Higher Public Voice (e.g. 30/70)</span>
            </div>
          </div>
        )}

        {/* Schedules */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Nomination & Voting Schedule Periods
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Nomination Period:</span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Opens</span>
                  <input
                    type="date"
                    value={formData.schedules.nominationStart}
                    onChange={(e) => setFormData({
                      ...formData,
                      schedules: { ...formData.schedules, nominationStart: e.target.value }
                    })}
                    className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Closes</span>
                  <input
                    type="date"
                    value={formData.schedules.nominationEnd}
                    onChange={(e) => setFormData({
                      ...formData,
                      schedules: { ...formData.schedules, nominationEnd: e.target.value }
                    })}
                    className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Public Voting Period:</span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Opens</span>
                  <input
                    type="date"
                    value={formData.schedules.votingStart}
                    onChange={(e) => setFormData({
                      ...formData,
                      schedules: { ...formData.schedules, votingStart: e.target.value }
                    })}
                    className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Closes</span>
                  <input
                    type="date"
                    value={formData.schedules.votingEnd}
                    onChange={(e) => setFormData({
                      ...formData,
                      schedules: { ...formData.schedules, votingEnd: e.target.value }
                    })}
                    className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Judges */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Assigned Evaluators / Judges
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {judgesList.map((judge) => {
              const isAssigned = formData.assignedJudges?.includes(judge.id);
              return (
                <div
                  key={judge.id}
                  onClick={() => handleToggleJudge(judge.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isAssigned
                      ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-500/20 dark:bg-indigo-950/50 dark:border-indigo-700'
                      : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    onChange={() => {}} // handled by parent div
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <img src={judge.avatar} alt={judge.name} className="w-7 h-7 rounded-full object-cover" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{judge.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{judge.department}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
          >
            {categoryToEdit ? 'Save Category Changes' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
