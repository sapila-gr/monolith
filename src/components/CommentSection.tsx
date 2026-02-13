"use client";

import { useState } from "react";
import Image from "next/image";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null };
}

interface CommentSectionProps {
  postId: string;
  commentCount: number;
  isAuthenticated: boolean;
}

export function CommentSection({
  postId,
  commentCount,
  isAuthenticated,
}: CommentSectionProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [count, setCount] = useState(commentCount);

  const loadComments = async () => {
    if (comments.length > 0) {
      setOpen(!open);
      return;
    }
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
        setCount((c) => c + 1);
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 1000
    );
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div>
      <button
        onClick={loadComments}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-surface-hover text-text-secondary border border-transparent hover:text-indigo hover:bg-indigo/10 transition-all"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{count}</span>
      </button>

      {open && (
        <div className="mt-3 animate-fade-in">
          <div className="border-t border-border pt-3 space-y-3">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-6 h-6 rounded-full animate-shimmer shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-20 rounded animate-shimmer" />
                      <div className="h-3 w-full rounded animate-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-text-tertiary text-center py-2">
                No comments yet. Be the first!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 group">
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-surface-raised">
                      {comment.author.image ? (
                        <Image
                          src={comment.author.image}
                          alt=""
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-text-tertiary">
                          {comment.author.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-text-primary">
                          {comment.author.name ?? "Anon"}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isAuthenticated && (
              <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Drop a comment..."
                  className="flex-1 bg-surface-hover border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-indigo transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-3 py-2 rounded-xl bg-indigo text-white text-sm font-semibold disabled:opacity-40 hover:bg-indigo-dim transition-colors"
                >
                  {submitting ? "..." : "Send"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
