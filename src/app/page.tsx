"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { PostCard } from "@/components/PostCard";
import { FeedSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { SetNicknameModal } from "@/components/SetNicknameModal";

interface SessionUser {
  username?: string | null;
}

interface Post {
  id: string;
  caption: string | null;
  type: string;
  textContent: string | null;
  contentUrl: string | null;
  createdAt: string;
  author: { id: string; username: string | null };
  _count: { comments: number; likes: number; skulls: number };
  userHasLiked: boolean;
  userHasSkulled: boolean;
}

export default function Home() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Derive modal visibility from session state
  const showNicknameModal =
    !!session?.user && !(session.user as unknown as SessionUser).username;

  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-screen bg-background">
      <SetNicknameModal
        isOpen={showNicknameModal}
        onComplete={() => {}} // Modal closes automatically when page reloads after setting username
      />
      <NavBar />

      {/* Decorative gradient blob */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-lime/5 via-indigo/3 to-transparent rounded-full blur-3xl pointer-events-none" />

      <main className="relative mx-auto max-w-2xl px-4 py-6">
        {/* Feed header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-2xl text-text-primary">
            Feed
          </h1>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface border border-border text-xs text-text-tertiary font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            fresh
          </div>
        </div>

        {loading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <EmptyState isAuthenticated={isAuthenticated} />
        ) : (
          <div className="space-y-4 stagger-children">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
