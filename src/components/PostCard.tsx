"use client";

import Image from "next/image";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";

interface Post {
  id: string;
  caption: string | null;
  type: string;
  textContent: string | null;
  contentUrl: string | null;
  createdAt: string;
  author: { id: string; username: string | null };
  _count: { comments: number; likes: number };
}

interface PostCardProps {
  post: Post;
  isAuthenticated: boolean;
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PostCard({ post, isAuthenticated }: PostCardProps) {
  return (
    <article className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-border-hover hover:shadow-[var(--shadow-card-hover)] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-9 h-9 rounded-full border-2 border-border group-hover:border-lime/30 transition-colors shrink-0 bg-surface-raised flex items-center justify-center text-sm font-bold text-text-secondary">
          {post.author.username?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-text-primary">
            {post.author.username ?? "Anonymous"}
          </span>
          <span className="text-xs text-text-tertiary ml-2">
            {timeAgo(post.createdAt)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        {post.caption && (
          <h2 className="font-display font-bold text-lg text-text-primary mb-2 leading-snug">
            {post.caption}
          </h2>
        )}
        {post.type === "image" && post.contentUrl && (
          <div className="relative w-full rounded-xl overflow-hidden border border-border/50">
            <Image
              src={post.contentUrl}
              alt={post.caption ?? "Post image"}
              width={600}
              height={400}
              className="w-full h-auto object-contain"
              sizes="(max-width: 640px) 100vw, 600px"
            />
          </div>
        )}
        {post.textContent && (
          <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
            <p className="text-text-primary whitespace-pre-wrap leading-relaxed text-[15px]">
              {post.textContent}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2">
          <LikeButton
            postId={post.id}
            initialCount={post._count.likes}
            isAuthenticated={isAuthenticated}
          />
          <CommentSection
            postId={post.id}
            commentCount={post._count.comments}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </article>
  );
}
