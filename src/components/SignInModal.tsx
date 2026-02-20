"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Provider {
  id: "github" | "google" | "instagram";
  name: string;
  icon: React.ReactNode;
  color: string;
}

const providers: Provider[] = [
  {
    id: "github",
    name: "GitHub",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    ),
    color: "hover:bg-white/10 hover:border-white/20",
  },
  {
    id: "google",
    name: "Google",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="currentColor"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="currentColor"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="currentColor"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="currentColor"
        />
      </svg>
    ),
    color: "hover:bg-blue-500/10 hover:border-blue-500/20",
  },
];

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (provider: "github" | "google" | "instagram") => {
    setLoading(provider);
    setError(null);
    try {
      await signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (err) {
      setError(`Failed to sign in with ${provider}`);
      setLoading(null);
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-sm mx-4 rounded-2xl bg-surface border border-border p-8 animate-fade-in-scale">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-surface-hover rounded-lg transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
            Welcome to Sapila
          </h2>
          <p className="text-sm text-text-secondary">
            Sign in with your favorite account
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-pink/10 border border-pink/20 text-pink text-sm">
            {error}
          </div>
        )}

        {/* Providers Grid */}
        <div className="space-y-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleSignIn(provider.id)}
              disabled={loading !== null}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border transition-all ${provider.color} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === provider.id ? (
                <div className="w-5 h-5 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-text-primary">{provider.icon}</span>
                  <span className="text-sm font-semibold text-text-primary">
                    Sign in with {provider.name}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs text-text-tertiary text-center mt-6">
          By signing in, you agree to our terms. You&apos;ll set a unique nickname to get started.
        </p>
      </div>
    </div>
  );
}
