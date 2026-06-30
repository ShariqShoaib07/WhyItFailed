export default function FailureCardSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-zinc-900 bg-zinc-900/10 p-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-zinc-800" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-28 rounded bg-zinc-800" />
          <div className="h-2 w-14 rounded bg-zinc-800" />
        </div>
        <div className="h-6 w-16 rounded-full bg-zinc-800" />
      </div>

      {/* Title */}
      <div className="mt-4 h-5 w-3/4 rounded bg-zinc-800" />

      {/* Snippet */}
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-full rounded bg-zinc-800" />
        <div className="h-3.5 w-5/6 rounded bg-zinc-800" />
        <div className="h-3.5 w-2/3 rounded bg-zinc-800" />
      </div>

      {/* Tags */}
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-12 rounded-full bg-zinc-800" />
        <div className="h-5 w-14 rounded-full bg-zinc-800" />
        <div className="h-5 w-10 rounded-full bg-zinc-800" />
      </div>

      <div className="my-4 h-[1px] bg-zinc-900/60" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-14 rounded-lg bg-zinc-800" />
        <div className="h-4 w-32 rounded bg-zinc-800" />
      </div>
    </div>
  );
}
