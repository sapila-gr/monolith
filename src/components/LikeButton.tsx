"use client";

import { useState } from "react";

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
}

export function LikeButton({ postId, initialCount, initialLiked, isAuthenticated }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [animating, setAnimating] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) {
        // Revert on failure
        setLiked(wasLiked);
        setCount((c) => (wasLiked ? c + 1 : c - 1));
      }
    } catch {
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={!isAuthenticated}
      className={`
        group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200
        ${
          liked
            ? "bg-pink/15 text-pink border border-pink/30"
            : "bg-surface-hover text-text-secondary border border-transparent hover:text-pink hover:bg-pink/10"
        }
        ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className={`transition-transform ${animating ? "animate-bounce-in" : ""} ${
          !liked ? "group-hover:scale-110" : ""
        }`}
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}
