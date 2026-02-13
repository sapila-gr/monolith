"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Post {
  id: string;
  caption: string | null;
  type: string;
  textContent: string | null;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null };
  _count: { comments: number; likes: number };
}

export default function Home() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-2xl flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-bold">
            Sapila
          </Link>
          <div className="flex items-center gap-3">
            {status === "authenticated" ? (
              <>
                <Link
                  href="/submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  New Post
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Sign out
                </button>
              </>
            ) : status === "loading" ? null : (
              <button
                onClick={() => signIn("github")}
                className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Sign in with GitHub
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="container mx-auto max-w-2xl px-4 py-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">
            No posts yet. {session ? "Be the first to post!" : "Sign in to create a post."}
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  {post.author.image && (
                    <Image
                      src={post.author.image}
                      alt=""
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium">
                    {post.author.name ?? "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {post.caption && (
                  <h2 className="font-semibold mb-1">{post.caption}</h2>
                )}
                {post.textContent && (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {post.textContent}
                  </p>
                )}
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span>{post._count.likes} {post._count.likes === 1 ? "like" : "likes"}</span>
                  <span>{post._count.comments} {post._count.comments === 1 ? "comment" : "comments"}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
