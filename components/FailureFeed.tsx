'use client';

import { useState, useEffect, useRef } from 'react';
import { Failure } from '@/lib/types';
import FailureCard from './FailureCard';
import FailureCardSkeleton from './FailureCardSkeleton';
import { createClient } from '@/lib/supabaseClient';

interface FailureFeedProps {
  initialFailures: Failure[];
}

const PAGE_SIZE = 6;

export default function FailureFeed({ initialFailures }: FailureFeedProps) {
  const [failures, setFailures] = useState<Failure[]>(initialFailures);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialFailures.length >= PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMoreFailures = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const supabase = createClient();
    
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const { data, error } = await supabase
        .from('failures')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data && data.length > 0) {
        setFailures((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
        
        // If we retrieved less items than the page size, we have reached the end
        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching failures:', error);
      setHasMore(false); // Stop loading if error occurs to prevent infinite loops
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentSentinel = sentinelRef.current;
    if (!currentSentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreFailures();
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // Load slightly before hitting the exact bottom for smooth IG-like scroll
    );

    observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, loading, page]);

  return (
    <div className="flex flex-col gap-6">
      {failures.length === 0 ? (
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-8 text-center shadow-xl backdrop-blur-md">
          <p className="text-zinc-400 font-mono text-sm">No failure reports found.</p>
          <p className="text-zinc-500 text-xs mt-2 font-medium">Be the first to share what you tried, what broke, and what you learned!</p>
        </div>
      ) : (
        failures.map((failure) => (
          <FailureCard key={failure.id} failure={failure} />
        ))
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="flex flex-col gap-6">
          <FailureCardSkeleton />
          <FailureCardSkeleton />
        </div>
      )}

      {/* Infinite Scroll Sentinel element */}
      {hasMore && !loading && (
        <div ref={sentinelRef} className="h-10 w-full" />
      )}

      {/* End of Feed Message */}
      {!hasMore && failures.length > 0 && (
        <div className="py-8 text-center">
          <p className="font-mono text-xs text-zinc-600">You've reached the end of the feed</p>
        </div>
      )}
    </div>
  );
}
