"use client";

import { useState } from "react";

interface SkullButtonProps {
  postId: string;
  initialCount: number;
  initialSkulled: boolean;
  isAuthenticated: boolean;
}

export function SkullButton({
  postId,
  initialCount,
  initialSkulled,
  isAuthenticated,
}: SkullButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [skulled, setSkulled] = useState(initialSkulled);
  const [animating, setAnimating] = useState(false);

  const handleSkull = async () => {
    if (!isAuthenticated) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    // Optimistic update
    const wasSkulled = skulled;
    setSkulled(!wasSkulled);
    setCount((c) => (wasSkulled ? c - 1 : c + 1));

    try {
      const res = await fetch(`/api/posts/${postId}/skull`, { method: "POST" });
      if (!res.ok) {
        // Revert on failure
        setSkulled(wasSkulled);
        setCount((c) => (wasSkulled ? c + 1 : c - 1));
      }
    } catch {
      setSkulled(wasSkulled);
      setCount((c) => (wasSkulled ? c + 1 : c - 1));
    }
  };

  return (
    <button
      onClick={handleSkull}
      disabled={!isAuthenticated}
      className={`
        group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200
        ${
          skulled
            ? "bg-indigo/15 text-indigo border border-indigo/30"
            : "bg-surface-hover text-text-secondary border border-transparent hover:text-indigo hover:bg-indigo/10"
        }
        ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`text-lg transition-transform ${animating ? "animate-bounce-in" : ""} ${
          !skulled ? "group-hover:scale-110" : ""
        }`}
      >
        💀
      </span>
      <span>{count}</span>
    </button>
  );
}
