'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/login');
      router.refresh();
    }
  };

  // Get user avatar letter or fallback
  const getAvatarFallback = () => {
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        {/* Left: Logo */}
        <Link 
          href="/" 
          className="font-mono text-xl font-bold tracking-wider text-zinc-100 hover:text-white transition-colors duration-200"
        >
          Fail<span className="text-red-500">Log</span>
        </Link>

        {/* Center: Search icon placeholder */}
        <div className="flex-1 max-w-xs mx-4 hidden sm:block">
          <div className="relative flex items-center rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-500 font-mono cursor-not-allowed">
            <svg className="mr-2 h-4.5 w-4.5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>search failures...</span>
          </div>
        </div>

        {/* Right: Actions & User Dropdown */}
        <div className="flex items-center gap-3">
          {/* Add Post Button */}
          <Link
            href="/new"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-700 active:scale-95"
            title="Post a failure"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>

          {/* Auth State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm font-semibold text-zinc-200 transition-all duration-200 hover:border-zinc-500 active:scale-95 cursor-pointer overflow-hidden"
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.full_name || 'Avatar'}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{getAvatarFallback()}</span>
                )}
              </button>

              {dropdownOpen && (
                <>
                  {/* Backdrop to close dropdown on click outside */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-20 w-48 origin-top-right rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 text-[10px] border-b border-zinc-900 text-zinc-500 font-mono truncate">
                      {user.email}
                    </div>
                    <Link
                      href={`/profile/${user.id}`}
                      className="flex w-full items-center px-3 py-2 text-xs text-zinc-300 rounded-lg transition-colors hover:bg-zinc-900 hover:text-zinc-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Posts
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center px-3 py-2 text-xs text-red-400 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-300 text-left cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition-all duration-200 hover:bg-white active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
