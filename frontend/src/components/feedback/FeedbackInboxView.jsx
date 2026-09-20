import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import { 
  Star, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Send, 
  Filter, 
  AlertCircle,
  HelpCircle,
  ThumbsUp,
  Sparkles,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function FeedbackInboxView() {
  const { 
    feedback, 
    updateFeedbackStatus, 
    addFeedbackReply, 
    deleteFeedback,
    currentRole, 
    loadFeedback 
  } = useAwardHub();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [replyInputs, setReplyInputs] = useState({});
  const [isSubmittingReply, setIsSubmittingReply] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canReply = currentRole === 'admin' || currentRole === 'organizer';

  // Allowed backend transitions
  const getNextStatuses = (currentStatus) => {
    const s = (currentStatus || 'OPEN').toUpperCase();
    switch (s) {
      case 'OPEN':
      case 'NEW':
        return ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];
      case 'IN_PROGRESS':
        return ['RESOLVED', 'CLOSED'];
      case 'RESOLVED':
      case 'REVIEWED':
        return ['CLOSED'];
      default:
        return ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].filter((x) => x !== s);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm(`Are you sure you want to permanently delete Feedback #${id}?`)) {
      try {
        await deleteFeedback(id);
      } catch (e) {
        // toast handled in context
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFeedback();
    setIsRefreshing(false);
  };

  const handleReplyChange = (id, text) => {
    setReplyInputs((prev) => ({ ...prev, [id]: text }));
  };

  const handleSendReply = async (feedbackId) => {
    const text = replyInputs[feedbackId]?.trim();
    if (!text) return;

    try {
      setIsSubmittingReply((prev) => ({ ...prev, [feedbackId]: true }));
      await addFeedbackReply(feedbackId, text);
      setReplyInputs((prev) => ({ ...prev, [feedbackId]: '' }));
    } catch (e) {
      // Handled in context toast
    } finally {
      setIsSubmittingReply((prev) => ({ ...prev, [feedbackId]: false }));
    }
  };

  const feedbackList = Array.isArray(feedback) ? feedback : [];

  const filteredFeedback = feedbackList.filter((item) => {
    if (!item) return false;
    const itemStatus = (item.status || 'OPEN').toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || itemStatus === statusFilter;
    const itemType = (item.feedbackType || 'SUGGESTION').toUpperCase();
    const matchesType = typeFilter === 'ALL' || itemType === typeFilter;
    return matchesStatus && matchesType;
  });

  const getTypeIcon = (type) => {
    switch ((type || '').toUpperCase()) {
      case 'BUG':
        return <AlertCircle className="w-3 h-3 text-rose-500" />;
      case 'PRAISE':
        return <ThumbsUp className="w-3 h-3 text-emerald-500" />;
      case 'COMPLAINT':
        return <AlertCircle className="w-3 h-3 text-amber-500" />;
      default:
        return <Sparkles className="w-3 h-3 text-indigo-500" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || 'OPEN').toUpperCase();
    switch (s) {
      case 'RESOLVED':
      case 'REVIEWED':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'IN_PROGRESS':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'CLOSED':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: // OPEN / NEW
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Stakeholder Feedback & Inquiries Inbox</h3>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Refresh from backend API"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live feedback received via Spring Boot REST API (`/api/feedback` &amp; `/api/feedback/:id/replies`).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses ({feedbackList.length})</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Types</option>
                <option value="SUGGESTION">Suggestion</option>
                <option value="BUG">Bug</option>
                <option value="COMPLAINT">Complaint</option>
                <option value="PRAISE">Praise</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No feedback matching current filters</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try resetting the status or type filter above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedback.map((item) => {
            const nextStatuses = getNextStatuses(item.status);
            const replies = Array.isArray(item.replies) ? item.replies : [];
            const itemRating = typeof item.rating === 'number' ? item.rating : 5;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top metadata */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {item.submittedBy || 'Stakeholder'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.userRole || 'VOTER'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono mt-0.5">
                        Feedback #{item.id}
                      </span>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= itemRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Badges & Content */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                        {item.category || item.subject || 'General Experience'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase">
                        {getTypeIcon(item.feedbackType)}
                        {item.feedbackType || 'SUGGESTION'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                      "{item.comment || item.message || 'No additional comments provided.'}"
                    </p>
                  </div>

                  {/* Replies thread */}
                  {replies.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Official Committee Responses ({replies.length})
                      </span>
                      <div className="space-y-1.5">
                        {replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200"
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                              <span className="font-bold text-indigo-700 dark:text-indigo-400">
                                {reply.repliedByName || 'Organizer/Admin'}
                              </span>
                              <span>{formatDateTime(reply.repliedAt)}</span>
                            </div>
                            <p className="text-xs">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply Input for Organizer & Admin */}
                  {canReply && item.status !== 'CLOSED' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={replyInputs[item.id] || ''}
                          onChange={(e) => handleReplyChange(item.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendReply(item.id);
                            }
                          }}
                          placeholder="Type official reply (Admin/Organizer)..."
                          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendReply(item.id)}
                          disabled={isSubmittingReply[item.id] || !replyInputs[item.id]?.trim()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Footer: Date & State Transitions & Delete Button */}
                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 gap-2">
                  <span>{formatDateTime(item.submittedAt || item.createdAt)}</span>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${getStatusBadgeClass(item.status)}`}>
                      {item.status || 'OPEN'}
                    </span>

                    {/* Transition options */}
                    {canReply && nextStatuses.length > 0 && (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            updateFeedbackStatus(item.id, e.target.value);
                          }
                        }}
                        className="rounded border border-slate-300 dark:border-slate-700 px-2 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="">Update Status...</option>
                        {nextStatuses.map((s) => (
                          <option key={s} value={s}>
                            → {s}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Delete action for Admin/Organizer */}
                    {canReply && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFeedback(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title={`Permanently delete feedback #${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
