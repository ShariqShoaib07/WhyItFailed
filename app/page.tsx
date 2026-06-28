import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="font-mono text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
        Engineering Failure Feed
      </h2>
      <p className="mt-4 max-w-md text-sm text-zinc-400 font-medium leading-relaxed">
        This is where engineering failures become collective intelligence. Week 1 & 2 foundations (Auth, Database Pipeline) are successfully active.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/new"
          className="rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-white active:scale-95 shadow-md cursor-pointer"
        >
          Post a Failure
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:border-zinc-700 active:scale-95 cursor-pointer"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
