import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import AnalyticsReportsView from '../organizer/AnalyticsReportsView';
import FeedbackInboxView from '../feedback/FeedbackInboxView';
import ErrorBoundary from '../common/ErrorBoundary';
import { BarChart3, MessageSquare, Star, Send, Sparkles, FileSpreadsheet } from 'lucide-react';

export default function ReportingFeedbackModule() {
  const { currentRole, feedback, reports, submitFeedback, categories } = useAwardHub();

  const feedbackCount = Array.isArray(feedback) ? feedback.length : 0;

  const [activeTab, setActiveTab] = useState(
    currentRole === 'organizer' || currentRole === 'admin' ? 'analytics' : 'submit_feedback'
  );
  const [rating, setRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState('SUGGESTION');
  const [category, setCategory] = useState('Voting Experience');
  const [categoryId, setCategoryId] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInlineSubmit = async (e) => {
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
        feedbackType,
        categoryId: categoryId ? Number(categoryId) : null
      });
      setComment('');
      setRating(5);
      setFeedbackType('SUGGESTION');
      setCategoryId('');
    } catch (err) {
      // Handled in context toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-400" />
          <span>
            Reporting, Analytics & Feedback Management: Real-time turnouts, database report archives, and continuous stakeholder feedback.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline mr-1" />
            Analytics & Reports
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'inbox'
                ? 'bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
            Feedback Inbox ({feedbackCount})
          </button>
          <button
            onClick={() => setActiveTab('submit_feedback')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'submit_feedback'
                ? 'bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Send className="w-3.5 h-3.5 inline mr-1" />
            Submit Feedback Form
          </button>
        </div>
      </div>

      <ErrorBoundary>
        {activeTab === 'analytics' && <AnalyticsReportsView />}
        {activeTab === 'inbox' && <FeedbackInboxView />}
      </ErrorBoundary>
      {activeTab === 'submit_feedback' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Stakeholder Experience Feedback</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submit evaluations regarding the nomination, voting, and judging processes to support continuous improvement via the Spring Boot backend.
            </p>
          </div>

          <form onSubmit={handleInlineSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Rating
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
                      className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
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
                  <option value="Evaluation System">Judge Rubrics & Blind Review System</option>
                  <option value="Results Transparency">Results Transparency & Score Calculation</option>
                  <option value="General Usability">Platform Performance & Usability</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Related Award Category (Optional)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="">General / None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id.replace('cat-', '')}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Suggestions, Comments or Issues
              </label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your detailed feedback on how the award cycle operated..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Submitting to Backend...' : 'Submit Official Feedback'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
