import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useAwardHub } from '../../context/AwardHubContext';
import { Sliders, Scale, FileText, ExternalLink, Send, CheckCircle2 } from 'lucide-react';

export default function RubricScoringModal({ isOpen, onClose, nomination, category, isBlind }) {
  const { currentUser, submitJudgeScore, judgeScores } = useAwardHub();

  const [criteriaScores, setCriteriaScores] = useState({});
  const [feedback, setFeedback] = useState('');

  // Find existing evaluation if already evaluated
  useEffect(() => {
    if (nomination && category) {
      const existing = judgeScores.find(
        (s) => s.nominationId === nomination.id && s.judgeId === currentUser.id
      );

      if (existing) {
        setCriteriaScores(existing.criteriaScores || {});
        setFeedback(existing.feedback || '');
      } else {
        // Initialize default mid scores
        const defaults = {};
        category.rubric?.forEach((crit) => {
          defaults[crit.id] = 8.0;
        });
        setCriteriaScores(defaults);
        setFeedback('');
      }
    }
  }, [nomination, category, currentUser, judgeScores, isOpen]);

  if (!nomination || !category) return null;

  // Calculate live weighted score out of 10
  const totalWeightedScore = category.rubric?.reduce((sum, crit) => {
    const score = Number(criteriaScores[crit.id] || 0);
    return sum + (score * (crit.weight / 100));
  }, 0) || 0;

  const handleSliderChange = (critId, val) => {
    setCriteriaScores((prev) => ({
      ...prev,
      [critId]: Number(val)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitJudgeScore({
      categoryId: category.id,
      nominationId: nomination.id,
      criteriaScores,
      weightedScore: Number(totalWeightedScore.toFixed(2)),
      feedback: feedback.trim(),
      isBlind
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBlind ? `Blind Evaluation: ${nomination.anonymousId}` : `Evaluate: ${nomination.nomineeName}`}
      subtitle={`Category: ${category.name} (${category.code})`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Candidate / Submission Dossier */}
        <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 font-bold">
              {isBlind ? `Anonymous Dossier ID: ${nomination.anonymousId}` : nomination.nomineeName}
            </span>
            {isBlind && (
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                Blind Review Active (Identity Masked)
              </span>
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{nomination.title}</h4>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{nomination.summary}</p>
          </div>

          <div>
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Methodology & Impact:</span>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{nomination.detailedPitch}</p>
          </div>

          {nomination.liveDemoUrl && (
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Proof of Work:</span>
              <a
                href={nomination.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5 font-mono"
              >
                {nomination.liveDemoUrl} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Rubric Criteria Sliders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Predefined Category Rubric Scoring
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">Each criterion scored 1.0 – 10.0</span>
          </div>

          <div className="space-y-4">
            {category.rubric?.map((crit) => {
              const currentScore = criteriaScores[crit.id] !== undefined ? criteriaScores[crit.id] : 8.0;
              return (
                <div key={crit.id} className="bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{crit.name}</span>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold ml-2">
                        (Weight: {crit.weight}%)
                      </span>
                    </div>
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {currentScore.toFixed(1)} / 10.0
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{crit.description}</p>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">1.0</span>
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.1"
                      value={currentScore}
                      onChange={(e) => handleSliderChange(crit.id, e.target.value)}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">10.0</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Weighted Score Summary Box */}
        <div className="bg-gradient-to-r from-indigo-50 to-amber-50 dark:from-indigo-950/40 dark:to-amber-950/40 p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 block">
              Computed Weighted Evaluation Score
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Normalized score based on weighted rubric criteria
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-200 font-mono">
              {totalWeightedScore.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"> / 10.0</span>
          </div>
        </div>

        {/* Qualitative Comments */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Qualitative Evaluation Notes & Recommendations
          </label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Document technical strengths, weaknesses, and rationale for your scores..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
            Submit Official Score
          </button>
        </div>
      </form>
    </Modal>
  );
}
