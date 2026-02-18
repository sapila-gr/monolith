"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/NavBar";
import { uploadImage } from "@/lib/storage";

const CHAR_LIMIT = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function SubmitPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [postType, setPostType] = useState<"text" | "image">("text");
  const [caption, setCaption] = useState("");
  const [textContent, setTextContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-lime border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/");
    return null;
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("That's not an image, chief.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Too thicc! Max file size is 5MB.");
      return;
    }
    setError("");
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (postType === "text" && !textContent.trim()) {
      setError("You gotta write something!");
      return;
    }

    if (postType === "image" && !imageFile) {
      setError("You gotta upload an image!");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      let contentUrl: string | undefined;

      if (postType === "image" && imageFile) {
        contentUrl = await uploadImage(imageFile);
      }

      const body =
        postType === "text"
          ? { caption, textContent, type: "text" }
          : { caption, type: "image", contentUrl };

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  const isSubmitDisabled =
    isSubmitting ||
    (postType === "text" && (isOverLimit || !textContent.trim())) ||
    (postType === "image" && !imageFile);

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
          {/* Post type toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setPostType("text")}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                postType === "text"
                  ? "bg-lime text-[#0B0B0F]"
                  : "bg-surface text-text-secondary hover:text-text-primary"
              }`}
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => setPostType("image")}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                postType === "image"
                  ? "bg-lime text-[#0B0B0F]"
                  : "bg-surface text-text-secondary hover:text-text-primary"
              }`}
            >
              Image
            </button>
          </div>

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
          {postType === "text" && (
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
          )}

          {/* Image upload */}
          {postType === "image" && (
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                The goods
              </label>

              {!imagePreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 w-full min-h-[200px] rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    isDragging
                      ? "border-lime bg-lime/5"
                      : "border-border hover:border-lime/50 bg-surface"
                  }`}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-text-tertiary"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-center">
                    <p className="text-text-secondary text-sm font-semibold">
                      Drop your meme here
                    </p>
                    <p className="text-text-tertiary text-xs mt-1">
                      or click to browse (max 5MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={600}
                    height={400}
                    className="w-full h-auto object-contain max-h-[400px]"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#0B0B0F]/80 backdrop-blur-sm border border-border flex items-center justify-center text-text-secondary hover:text-pink hover:border-pink/50 transition-all"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2 2l10 10M12 2L2 12" strokeLinecap="round" />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-[#0B0B0F]/80 backdrop-blur-sm border border-border">
                    <span className="text-xs text-text-tertiary font-mono">
                      {imageFile?.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

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
            disabled={isSubmitDisabled}
            className="w-full btn-primary py-3.5 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-[#0B0B0F] border-t-transparent animate-spin" />
                {postType === "image" ? "Uploading..." : "Posting..."}
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
