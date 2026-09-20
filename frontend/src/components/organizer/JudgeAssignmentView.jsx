import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import Modal from '../common/Modal';
import { Sliders, Plus, Trash2, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';

export default function JudgeAssignmentView() {
  const { categories, users, updateCategory, showToast } = useAwardHub();

  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || '');
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);

  const judgesList = users.filter((u) => u.role === 'judge');
  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  const [rubricState, setRubricState] = useState(activeCategory?.rubric || []);

  const handleSelectCategory = (id) => {
    setSelectedCatId(id);
    const cat = categories.find((c) => c.id === id);
    if (cat) setRubricState(cat.rubric || []);
  };

  const handleToggleJudge = (judgeId) => {
    if (!activeCategory) return;
    const currentJudges = activeCategory.assignedJudges || [];
    const updatedJudges = currentJudges.includes(judgeId)
      ? currentJudges.filter((id) => id !== judgeId)
      : [...currentJudges, judgeId];

    updateCategory(activeCategory.id, { assignedJudges: updatedJudges });
    showToast('Updated judge assignments for category');
  };

  const handleAddCriterion = () => {
    const newCrit = {
      id: `crit-${Date.now()}`,
      name: 'New Evaluation Criterion',
      maxScore: 10,
      weight: 10,
      description: 'Describe assessment parameters...'
    };
    setRubricState([...rubricState, newCrit]);
  };

  const handleRemoveCriterion = (critId) => {
    setRubricState(rubricState.filter((c) => c.id !== critId));
  };

  const handleSaveRubric = (e) => {
    e.preventDefault();
    const totalWeight = rubricState.reduce((sum, c) => sum + Number(c.weight), 0);
    if (totalWeight !== 100) {
      alert(`The sum of rubric criterion weights must equal 100%. Current total: ${totalWeight}%`);
      return;
    }

    updateCategory(activeCategory.id, { rubric: rubricState });
    setIsRubricModalOpen(false);
    showToast('Category scoring rubric updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Judge Assignment & Evaluation Rubric Configuration</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Module 5 Setup
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Assign industry evaluators and define structured, weighted scoring criteria for blind judging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCatId}
            onChange={(e) => handleSelectCategory(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Assigned Judges */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Assigned Judges for Category
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluators authorized to score candidates in {activeCategory?.name}
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              {activeCategory?.assignedJudges?.length || 0} Assigned
            </span>
          </div>

          <div className="space-y-2">
            {judgesList.map((judge) => {
              const isAssigned = activeCategory?.assignedJudges?.includes(judge.id);
              return (
                <div
                  key={judge.id}
                  onClick={() => handleToggleJudge(judge.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isAssigned
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={judge.avatar} alt={judge.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{judge.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{judge.department}</p>
                      <div className="flex gap-1 mt-1">
                        {judge.expertise?.map((exp, idx) => (
                          <span key={idx} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    isAssigned 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {isAssigned ? 'Assigned' : 'Assign'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Scoring Rubric Criteria */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Predefined Scoring Rubric Criteria
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluation weights must sum to 100%
              </p>
            </div>
            <button
              onClick={() => {
                setRubricState(activeCategory?.rubric || []);
                setIsRubricModalOpen(true);
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Configure Criteria →
            </button>
          </div>

          <div className="space-y-3">
            {activeCategory?.rubric?.map((crit) => (
              <div key={crit.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{crit.name}</span>
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900 font-mono">
                    Weight: {crit.weight}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{crit.description}</p>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 font-mono">
                  Scale: 1.0 – {crit.maxScore}.0 Points
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rubric Edit Modal */}
      {isRubricModalOpen && (
        <Modal
          isOpen={isRubricModalOpen}
          onClose={() => setIsRubricModalOpen(false)}
          title={`Configure Rubric for: ${activeCategory.name}`}
          subtitle="Ensure weights sum up to exactly 100%"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveRubric} className="space-y-4 text-xs">
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {rubricState.map((crit, idx) => (
                <div key={crit.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      required
                      value={crit.name}
                      onChange={(e) => {
                        const next = [...rubricState];
                        next[idx].name = e.target.value;
                        setRubricState(next);
                      }}
                      className="flex-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1 font-bold text-xs"
                      placeholder="Criterion name..."
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Weight %:</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={crit.weight}
                        onChange={(e) => {
                          const next = [...rubricState];
                          next[idx].weight = Number(e.target.value);
                          setRubricState(next);
                        }}
                        className="w-16 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1 text-xs text-center font-bold"
                      />
                    </div>
                    {rubricState.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(crit.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={crit.description}
                    onChange={(e) => {
                      const next = [...rubricState];
                      next[idx].description = e.target.value;
                      setRubricState(next);
                    }}
                    className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1 text-[11px]"
                    placeholder="Short description..."
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddCriterion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Rubric Criterion
            </button>

            {/* Total weight check */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 font-bold">
              <span className="text-slate-700 dark:text-slate-300">Total Weight Sum:</span>
              <span className={`font-mono text-sm ${
                rubricState.reduce((sum, c) => sum + Number(c.weight), 0) === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {rubricState.reduce((sum, c) => sum + Number(c.weight), 0)}% / 100%
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsRubricModalOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
              >
                Save Rubric
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
