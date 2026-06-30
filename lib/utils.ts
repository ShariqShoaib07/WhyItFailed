// Utility functions for FailLog

/**
 * Formats a timestamp into a relative time descriptor (e.g. "2h ago", "3d ago", or "Jun 28").
 */
export function getRelativeTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (isNaN(date.getTime())) return dateString;

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  
  // Return formatted short date if older than a week
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Hashes a category name to return a consistent desaturated color combination
 * matching the dark-mode aesthetic.
 */
export function getCategoryColor(category: string): string {
  if (!category) return 'bg-zinc-900 border-zinc-800 text-zinc-400';

  const colors = [
    'bg-blue-500/10 border-blue-500/20 text-blue-400',
    'bg-purple-500/10 border-purple-500/20 text-purple-400',
    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    'bg-orange-500/10 border-orange-500/20 text-orange-400',
    'bg-rose-500/10 border-rose-500/20 text-rose-400',
    'bg-teal-500/10 border-teal-500/20 text-teal-400',
    'bg-pink-500/10 border-pink-500/20 text-pink-400',
    'bg-amber-500/10 border-amber-500/20 text-amber-400',
  ];

  let hash = 0;
  const normalized = category.trim().toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
