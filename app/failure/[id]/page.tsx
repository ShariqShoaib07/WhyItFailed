import { createClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface FailurePageProps {
  params: Promise<{ id: string }>;
}

export default async function FailureDetailPage({ params }: FailurePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch failure with author profiles joined
  const { data: failure, error } = await supabase
    .from('failures')
    .select('*, profiles(*)')
    .eq('id', id)
    .single();

  if (error || !failure) {
    notFound();
  }

  // Format creation date
  const dateStr = new Date(failure.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition-colors duration-200"
      >
        &larr; back to feed
      </Link>

      <article className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 shadow-xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-mono font-semibold text-zinc-300">
              {failure.profiles?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">{failure.profiles?.name || 'Anonymous User'}</p>
              <p className="text-[10px] font-mono text-zinc-500">{dateStr}</p>
            </div>
          </div>
          <span className="rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-mono text-red-400">
            #{failure.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
          {failure.title}
        </h1>

        {/* Optional Image */}
        {failure.image_url && (
          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-900/20 max-h-96 flex items-center justify-center">
            <img
              src={failure.image_url}
              alt={failure.title}
              className="max-h-96 w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Content Sections */}
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="font-mono text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              The Problem
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{failure.problem}</p>
          </div>

          <div>
            <h2 className="font-mono text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              What I Tried
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{failure.what_tried}</p>
          </div>

          <div>
            <h2 className="font-mono text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Why It Failed
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{failure.why_failed}</p>
          </div>
        </div>

        {/* Tags */}
        {failure.tags && failure.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-zinc-900">
            {failure.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-900 border border-zinc-850 px-3 py-1 text-xs font-mono text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
