'use client';

import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
  const errorParam = searchParams.get('error');

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    
    // Redirect back to our server's OAuth callback handler
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    
    if (error) {
      console.error('Error logging in:', error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-zinc-700/80">
      <div className="flex flex-col items-center text-center">
        <h1 className="font-mono text-3xl font-bold tracking-wider text-zinc-100">
          Fail<span className="text-red-500">Log</span>
        </h1>
        <p className="mt-3 text-sm text-zinc-400 font-medium">
          Where engineering failures become collective intelligence.
        </p>
      </div>

      <div className="mt-8">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition-all duration-200 hover:bg-zinc-800 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg active:scale-[0.98]"
        >
          {loading ? (
            <svg className="h-5 w-5 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
          )}
          <span>Continue with Google</span>
        </button>
      </div>

      {errorParam && (
        <p className="mt-4 text-center font-mono text-xs text-red-400">
          Authentication failed. Please try again.
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-zinc-50">
      <Suspense fallback={
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8 text-center text-zinc-400 animate-pulse">
          Loading login credentials...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
