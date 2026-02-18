"use client";

import { useState } from "react";

interface SetNicknameModalProps {
  isOpen: boolean;
  onComplete: (username: string) => void;
}

export function SetNicknameModal({ isOpen, onComplete }: SetNicknameModalProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Pick a nickname, bestie");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/users/me/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      onComplete(data.username);
    } catch {
      setError("Network error. Try again?");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-sm mx-4 rounded-2xl bg-surface border border-border p-6 animate-fade-in-scale">
        <div className="mb-6">
          <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
            Pick your vibe
          </h2>
          <p className="text-sm text-text-secondary">
            Choose a unique nickname (3-20 characters)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input */}
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. meme_lord, viral_vibes"
              maxLength={20}
              autoFocus
              disabled={isLoading}
              className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-lime focus:shadow-[var(--shadow-glow-lime)] transition-all disabled:opacity-50"
            />
            <p className="text-xs text-text-tertiary mt-1">
              {username.length}/20 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-pink/10 border border-pink/20 text-pink text-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3M8 10.5v.5" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full btn-primary py-3 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-[#0B0B0F] border-t-transparent animate-spin" />
                Setting up...
              </>
            ) : (
              "Let's go"
            )}
          </button>
        </form>

        <p className="text-xs text-text-tertiary text-center mt-4">
          You can change this later
        </p>
      </div>
    </div>
  );
}
