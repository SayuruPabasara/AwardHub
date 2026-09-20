export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function getStatusStyle(status) {
  switch (status) {
    case 'Approved':
    case 'Completed':
    case 'Active':
    case 'Voting Active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 dark:ring-emerald-500/20';
    case 'Under Review':
    case 'Evaluation':
    case 'Pending':
    case 'Nomination Open':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 dark:ring-amber-500/20';
    case 'Draft':
      return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:ring-slate-500/20';
    case 'Rejected':
    case 'Archived':
    case 'Withdrawn':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 dark:ring-rose-500/20';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 dark:ring-blue-500/20';
  }
}

export function getRoleBadge(role) {
  switch (role) {
    case 'admin':
      return { 
        label: 'System Admin', 
        style: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800' 
      };
    case 'organizer':
      return { 
        label: 'Award Organizer', 
        style: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' 
      };
    case 'nominee':
      return { 
        label: 'Nominee', 
        style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' 
      };
    case 'judge':
      return { 
        label: 'Evaluator / Judge', 
        style: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' 
      };
    case 'voter':
      return { 
        label: 'Public Voter', 
        style: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' 
      };
    default:
      return { 
        label: role, 
        style: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' 
      };
  }
}
