"use client";

import Link from "next/link";

interface EmptyStateProps {
  isAuthenticated: boolean;
}

export function EmptyState({ isAuthenticated }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
      {/* Fun animated illustration */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-surface border-2 border-dashed border-border flex items-center justify-center animate-float">
          <span className="text-5xl">💀</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-lime flex items-center justify-center animate-bounce-in">
          <span className="text-sm">?</span>
        </div>
      </div>

      <h3 className="font-display font-bold text-2xl text-text-primary mb-2">
        Dead in here
      </h3>
      <p className="text-text-secondary text-center max-w-xs mb-6 leading-relaxed">
        {isAuthenticated
          ? "No memes yet. Be the first to break the silence and post something fire."
          : "Sign in to start posting and bring this place to life."}
      </p>

      {isAuthenticated && (
        <Link
          href="/submit"
          className="btn-primary px-6 py-3 text-sm font-bold flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3v10M3 8h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Drop the first meme
        </Link>
      )}
    </div>
  );
}
