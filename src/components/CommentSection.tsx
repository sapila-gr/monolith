"use client";

import { useState } from "react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  author: { id: string; username: string | null };
  replies: Comment[];
  _count: { replies: number };
}

interface CommentSectionProps {
  postId: string;
  commentCount: number;
  isAuthenticated: boolean;
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/* ─────────────── Reply Form ─────────────── */

function ReplyForm({
  postId,
  parentId,
  onReply,
  onCancel,
}: {
  postId: string;
  parentId: string;
  onReply: (comment: Comment) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim(), parentId }),
      });
      if (res.ok) {
        const comment = await res.json();
        onReply(comment);
        setText("");
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Reply..."
        autoFocus
        className="flex-1 bg-surface-hover border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-indigo transition-colors"
      />
      <button
        type="submit"
        disabled={!text.trim() || submitting}
        className="px-2.5 py-1.5 rounded-lg bg-indigo text-white text-xs font-semibold disabled:opacity-40 hover:bg-indigo-dim transition-colors"
      >
        {submitting ? "..." : "Reply"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-2 py-1.5 rounded-lg text-xs text-text-tertiary hover:text-text-secondary transition-colors"
      >
        Cancel
      </button>
    </form>
  );
}

/* ─────────────── Single Comment (recursive) ─────────────── */

function CommentNode({
  comment,
  postId,
  depth,
  isAuthenticated,
  onReplyAdded,
}: {
  comment: Comment;
  postId: string;
  depth: number;
  isAuthenticated: boolean;
  onReplyAdded: () => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies ?? []);
  const [collapsed, setCollapsed] = useState(false);

  const maxDepth = 4;
  const isDeep = depth >= maxDepth;

  const handleReply = (newComment: Comment) => {
    setReplies((prev) => [...prev, newComment]);
    setShowReplyForm(false);
    onReplyAdded();
  };

  return (
    <div className={depth > 0 ? "mt-2" : ""}>
      <div className="flex gap-2 group">
        {/* Thread line + avatar */}
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 rounded-full shrink-0 bg-surface-raised flex items-center justify-center text-[10px] font-bold text-text-tertiary">
            {comment.author.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          {/* Thread line */}
          {replies.length > 0 && !collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="w-0.5 flex-1 min-h-[12px] mt-1 bg-border hover:bg-indigo/50 transition-colors cursor-pointer rounded-full"
              title="Collapse thread"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-text-primary">
              {comment.author.username ?? "Anon"}
            </span>
            <span className="text-[10px] text-text-tertiary">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p className="text-sm text-text-secondary leading-relaxed">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1">
            {isAuthenticated && !isDeep && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-[11px] font-medium text-text-tertiary hover:text-indigo transition-colors"
              >
                Reply
              </button>
            )}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="text-[11px] font-medium text-indigo/70 hover:text-indigo transition-colors"
              >
                Show {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <ReplyForm
              postId={postId}
              parentId={comment.id}
              onReply={handleReply}
              onCancel={() => setShowReplyForm(false)}
            />
          )}

          {/* Nested replies */}
          {!collapsed && replies.length > 0 && (
            <div className="mt-1 pl-1 border-l border-border/50">
              {replies.map((reply) => (
                <CommentNode
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  depth={depth + 1}
                  isAuthenticated={isAuthenticated}
                  onReplyAdded={onReplyAdded}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Comment Section (entry point) ─────────────── */

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
          <div className="border-t border-border pt-3 space-y-1">
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
              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <CommentNode
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                    depth={0}
                    isAuthenticated={isAuthenticated}
                    onReplyAdded={() => setCount((c) => c + 1)}
                  />
                ))}
              </div>
            )}

            {isAuthenticated && (
              <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
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
