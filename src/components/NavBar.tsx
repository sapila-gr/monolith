"use client";

import { useSession, signIn, signOut } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function NavBar() {
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthenticated = !!session?.user;

  return (
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
                  className="w-9 h-9 rounded-full border-2 border-border hover:border-lime transition-colors overflow-hidden"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt=""
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-raised flex items-center justify-center text-text-secondary text-sm font-bold">
                      {session.user?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
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
                          {session.user?.name ?? "Anonymous"}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  signIn.social({
                    provider: "github",
                    callbackURL: "/",
                  })
                }
                className="btn-ghost px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:border-lime hover:text-lime transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
