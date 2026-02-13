"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";

const CHAR_LIMIT = 500;

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-lime border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) {
      setError("You gotta write something!");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, textContent, type: "text" }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        setError("Something went wrong. Try again?");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const charPercent = (textContent.length / CHAR_LIMIT) * 100;
  const isOverLimit = textContent.length > CHAR_LIMIT;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Decorative elements */}
      <div className="fixed top-20 right-10 w-32 h-32 bg-pink/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-40 h-40 bg-lime/5 rounded-full blur-3xl pointer-events-none" />

      <main className="relative mx-auto max-w-lg px-4 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors mb-8 group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="transition-transform group-hover:-translate-x-1"
          >
            <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to feed
        </Link>

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display font-extrabold text-3xl text-text-primary mb-2">
            Drop a banger
          </h1>
          <p className="text-text-secondary">
            Make it funny. Make it memorable. No pressure.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          {/* Caption */}
          <div>
            <label
              htmlFor="caption"
              className="block text-sm font-semibold text-text-secondary mb-2"
            >
              Caption{" "}
              <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <input
              type="text"
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-lime/50 focus:shadow-[var(--shadow-glow-lime)] transition-all"
              placeholder="Title your masterpiece..."
            />
          </div>

          {/* Text content */}
          <div>
            <label
              htmlFor="textContent"
              className="block text-sm font-semibold text-text-secondary mb-2"
            >
              The goods
            </label>
            <div className="relative">
              <textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={6}
                className={`w-full bg-surface border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none transition-all resize-none ${
                  isOverLimit
                    ? "border-pink focus:border-pink focus:shadow-[var(--shadow-glow-pink)]"
                    : "border-border focus:border-lime/50 focus:shadow-[var(--shadow-glow-lime)]"
                }`}
                placeholder="Why did the developer quit? Because they didn't get arrays..."
                required
              />

              {/* Character counter */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <div className="relative w-6 h-6">
                  <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke={
                        isOverLimit
                          ? "var(--accent-pink)"
                          : charPercent > 80
                            ? "var(--accent-lime-dim)"
                            : "var(--accent-lime)"
                      }
                      strokeWidth="2"
                      strokeDasharray={`${Math.min(charPercent, 100) * 0.628} 62.8`}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  </svg>
                </div>
                <span
                  className={`text-xs font-mono ${
                    isOverLimit ? "text-pink" : "text-text-tertiary"
                  }`}
                >
                  {textContent.length}/{CHAR_LIMIT}
                </span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink/10 border border-pink/20 text-pink text-sm animate-fade-in">
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isOverLimit || !textContent.trim()}
            className="w-full btn-primary py-3.5 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-[#0B0B0F] border-t-transparent animate-spin" />
                Posting...
              </>
            ) : (
              <>
                Send it
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
