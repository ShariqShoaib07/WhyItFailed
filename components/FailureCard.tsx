import Link from 'next/link';
import { Failure } from '@/lib/types';
import { getRelativeTime, getCategoryColor } from '@/lib/utils';

interface FailureCardProps {
  failure: Failure;
}

export default function FailureCard({ failure }: FailureCardProps) {
  const authorName = failure.profiles?.name || 'Anonymous User';
  const avatarLetter = authorName.charAt(0).toUpperCase();
  const relativeTime = getRelativeTime(failure.created_at);
  const categoryColorClass = getCategoryColor(failure.category);

  return (
    <div className="w-full rounded-2xl border border-zinc-900 bg-zinc-900/10 p-5 shadow-lg transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/20 hover:-translate-y-0.5">
      {/* Header Row */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-mono font-semibold text-zinc-300">
          {avatarLetter}
        </div>
        {/* Author Name and Timestamp */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-200 truncate">{authorName}</p>
          <p className="text-[10px] font-mono text-zinc-500">{relativeTime}</p>
        </div>
        {/* Category Badge */}
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono capitalize ${categoryColorClass}`}>
          #{failure.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-4 text-base font-bold text-zinc-100 sm:text-lg leading-snug">
        {failure.title}
      </h3>

      {/* Problem Snippet (Clamped to 3 lines) */}
      <p className="mt-2 text-sm text-zinc-400 font-medium leading-relaxed line-clamp-3">
        {failure.problem}
      </p>

      {/* Optional Full-width Image */}
      {failure.image_url && (
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950/40">
          <img
            src={failure.image_url}
            alt={failure.title}
            className="w-full max-h-80 object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
      )}

      {/* Tags Chips */}
      {failure.tags && failure.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {failure.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-900 border border-zinc-850 px-2 py-0.5 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="my-4 h-[1px] bg-zinc-900/60" />

      {/* Footer Row */}
      <div className="flex items-center justify-between">
        {/* Upvote Button (visual only for Week 4) */}
        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-850 bg-zinc-900/30 px-3 py-1.5 text-xs text-zinc-400 font-mono transition-all hover:bg-zinc-900/60 hover:text-zinc-200">
          <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 14h6v8h4v-8h6L12 4 4 14z" />
          </svg>
          <span className="font-semibold text-zinc-300">{failure.upvote_count}</span>
        </div>

        {/* Read Full Breakdown Link */}
        <Link
          href={`/failure/${failure.id}`}
          className="font-mono text-xs font-semibold text-red-400 transition-colors duration-200 hover:text-red-300"
        >
          Read full breakdown &rarr;
        </Link>
      </div>
    </div>
  );
}
