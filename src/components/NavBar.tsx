"use client";

import { useSession, signOut } from "@/lib/auth-client";
import Link from "next/link";
import { useState } from "react";
import { SignInModal } from "./SignInModal";

interface SessionUser {
  username?: string | null;
  name?: string | null;
}

export function NavBar() {
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  const isAuthenticated = !!session?.user;

  return (
    <>
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
      <header className="glass sticky top-0 z-50 border-b border-border">
      <div className="mx-auto max-w-2xl flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-lime flex items-center justify-center transition-transform group-hover:rotate-[-6deg] group-hover:scale-110">
            <span className="text-[#0B0B0F] font-display font-extrabold text-sm">
              S
            </span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-text-primary">
            sapila
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/submit"
                className="btn-primary px-4 py-2 text-sm font-bold flex items-center gap-1.5"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform group-hover:rotate-90"
                >
                  <path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Post
              </Link>

              {/* Avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full border-2 border-border hover:border-lime transition-colors bg-surface-raised flex items-center justify-center text-text-secondary text-sm font-bold"
                >
                  {((session.user as unknown as SessionUser)?.username ?? session.user?.name ?? "?")?.[0]?.toUpperCase()}
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-surface border border-border shadow-lg animate-fade-in-scale overflow-hidden">
                      <div className="px-3 py-2.5 border-b border-border">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {(session.user as unknown as SessionUser)?.username ?? session.user?.name ?? "Anonymous"}
                        </p>
                        <p className="text-xs text-text-tertiary truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-3 py-2.5 text-sm text-text-secondary hover:text-pink hover:bg-surface-hover transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : isPending ? (
            <div className="w-20 h-9 rounded-xl animate-shimmer" />
          ) : (
            <button
              onClick={() => setSignInOpen(true)}
              className="btn-primary px-4 py-2 text-sm font-semibold"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
