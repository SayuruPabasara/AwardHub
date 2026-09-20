import React from 'react';
import { formatDateTime } from './src/utils/formatters.js';

const feedback = [
  {
    id: 1,
    userId: 6,
    username: 'voter1',
    subject: 'Voting Experience',
    message: 'The NIC validation process is very straightforward and fast.',
    feedbackType: 'PRAISE',
    status: 'IN_PROGRESS',
    rating: 5,
    categoryId: null,
    createdAt: '2026-09-16T20:54:58.914249',
    updatedAt: '2026-09-16T20:56:06.707779',
    replies: [
      {
        id: 1,
        repliedById: 2,
        repliedByName: 'organizer',
        message: 'Thank you for your feedback! We are glad the NIC validation works smoothly.',
        repliedAt: '2026-09-16T20:56:06.774344'
      }
    ]
  },
  {
    id: 2,
    userId: 3,
    username: 'kavindu',
    subject: 'Nomination Portal & Uploads',
    message: 'The document upload speeds are great for large PDF whitepapers.',
    feedbackType: 'SUGGESTION',
    status: 'RESOLVED',
    rating: 5,
    categoryId: null,
    createdAt: '2026-09-16T22:16:53.928044',
    updatedAt: '2026-09-16T22:17:30.683333',
    replies: [
      {
        id: 2,
        repliedById: 2,
        repliedByName: 'organizer',
        message: 'Thanks Kavindu! We enhanced the S3 upload gateway for faster dossier uploads.',
        repliedAt: '2026-09-16T22:17:17.533483'
      }
    ]
  },
  {
    id: 3,
    userId: 2,
    username: 'organizer',
    subject: 'Voting Experience',
    message: 'NL <HJV ihyvj;oi',
    feedbackType: 'BUG',
    status: 'OPEN',
    rating: 5,
    categoryId: 1,
    createdAt: '2026-09-16T22:22:06.250109',
    updatedAt: '2026-09-16T22:22:06.250109',
    replies: []
  }
];

const initialFeedback = [
  {
    id: 'fb-1',
    submittedBy: 'Dinuka Fernando',
    userRole: 'Public Voter',
    rating: 5,
    category: 'Voting Experience',
    comment: 'The NIC validation process is very straightforward and fast. It feels much more fair and secure than old Google Forms!',
    submittedAt: '2026-09-05T09:15:00Z',
    status: 'Reviewed'
  },
  {
    id: 'fb-2',
    submittedBy: 'Kavindu Perera',
    userRole: 'Nominee',
    rating: 5,
    category: 'Nomination Portal',
    comment: 'Great feature being able to save drafts and upload whitepapers directly to the nominee document vault.',
    submittedAt: '2026-08-14T18:20:00Z',
    status: 'Reviewed'
  },
  {
    id: 'fb-3',
    submittedBy: 'Dr. Anoma Wijesinghe',
    userRole: 'Judge',
    rating: 4,
    category: 'Evaluation System',
    comment: 'The blind review mode helps eliminate unconscious bias completely. Would love to see an integrated PDF viewer next!',
    submittedAt: '2026-09-04T12:00:00Z',
    status: 'New'
  }
];

function testLogic(items, label) {
  console.log('--- Testing', label, '---');
  const statusFilter = 'ALL';
  const typeFilter = 'ALL';
  const filteredFeedback = items.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || (item.feedbackType || '').toUpperCase() === typeFilter;
    return matchesStatus && matchesType;
  });

  console.log('Filtered count:', filteredFeedback.length);

  const getNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'OPEN':
        return ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];
      case 'IN_PROGRESS':
        return ['RESOLVED', 'CLOSED'];
      case 'RESOLVED':
        return ['CLOSED'];
      default:
        return [];
    }
  };

  const getTypeIcon = (type) => {
    switch ((type || '').toUpperCase()) {
      case 'BUG': return 'BugIcon';
      case 'PRAISE': return 'PraiseIcon';
      case 'COMPLAINT': return 'ComplaintIcon';
      default: return 'SparklesIcon';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'RESOLVED': return 'emerald';
      case 'IN_PROGRESS': return 'blue';
      case 'CLOSED': return 'slate';
      default: return 'amber';
    }
  };

  for (const item of filteredFeedback) {
    try {
      const nextStatuses = getNextStatuses(item.status);
      const replies = item.replies || [];
      const submittedBy = item.submittedBy;
      const userRole = item.userRole;
      const id = item.id;
      const rating = item.rating;
      const category = item.category || item.subject;
      const typeIcon = getTypeIcon(item.feedbackType);
      const feedbackType = item.feedbackType || 'SUGGESTION';
      const comment = item.comment || item.message;
      const formattedDate = formatDateTime(item.submittedAt || item.createdAt);
      const badge = getStatusBadgeClass(item.status);

      for (const reply of replies) {
        const repName = reply.repliedByName || 'Organizer/Admin';
        const repDate = formatDateTime(reply.repliedAt);
        const repMsg = reply.message;
      }
      console.log('Item OK:', id);
    } catch (e) {
      console.error('Error on item:', item.id, e);
    }
  }
}

testLogic(feedback, 'Backend Feedback');
testLogic(initialFeedback, 'Initial Feedback');
