import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Star, Send, Sparkles } from 'lucide-react';
import { useAwardHub } from '../../context/AwardHubContext';

export default function FeedbackModal({ isOpen, onClose }) {
  const { submitFeedback } = useAwardHub();
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Voting Experience');
  const [feedbackType, setFeedbackType] = useState('SUGGESTION');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      await submitFeedback({
        rating,
        category,
        subject: category,
        comment,
        message: comment,
        feedbackType
      });
      setComment('');
      setRating(5);
      setFeedbackType('SUGGESTION');
      onClose();
    } catch (e) {
      // Toast already shown
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Stakeholder Feedback"
      subtitle="Connected directly to the Spring Boot Reporting & Feedback API"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Overall Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 rounded hover:scale-110 transition-transform text-amber-400"
              >
                <Star
                  className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                />
              </button>
            ))}
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-2">
              {rating === 5 ? 'Excellent (5/5)' : rating === 4 ? 'Good (4/5)' : rating === 3 ? 'Average (3/5)' : 'Needs Improvement'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Feedback Type
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="SUGGESTION">Suggestion</option>
              <option value="BUG">Bug Report</option>
              <option value="COMPLAINT">Complaint</option>
              <option value="PRAISE">Praise / Commendation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Topic / Area
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="Voting Experience">Voting Experience & NIC Validation</option>
              <option value="Nomination Portal">Nomination Portal & Document Uploads</option>
              <option value="Evaluation System">Judge Rubrics & Scoring System</option>
              <option value="Results Transparency">Results Transparency & Calculation</option>
              <option value="General Usability">Platform Performance & Usability</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Your Comments or Suggestions
          </label>
          <textarea
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your detailed feedback on how the award cycle operated..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
