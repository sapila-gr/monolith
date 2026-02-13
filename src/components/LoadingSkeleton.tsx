"use client";

export function PostSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-9 h-9 rounded-full animate-shimmer shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-24 rounded-md animate-shimmer" />
          <div className="h-2.5 w-16 rounded-md animate-shimmer" />
        </div>
      </div>
      <div className="px-5 pb-4 space-y-2">
        <div className="h-5 w-3/4 rounded-md animate-shimmer" />
        <div className="rounded-xl p-4 space-y-2">
          <div className="h-3.5 w-full rounded animate-shimmer" />
          <div className="h-3.5 w-5/6 rounded animate-shimmer" />
          <div className="h-3.5 w-2/3 rounded animate-shimmer" />
        </div>
      </div>
      <div className="px-5 pb-4 flex gap-2">
        <div className="h-8 w-16 rounded-full animate-shimmer" />
        <div className="h-8 w-16 rounded-full animate-shimmer" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
