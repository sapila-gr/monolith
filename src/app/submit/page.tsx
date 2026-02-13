"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle session loading and unauthenticated user
  if (status === "loading") {
    return <p className="text-center mt-12">Loading...</p>;
  }

  if (status === "unauthenticated") {
    router.push("/"); // Redirect to home if not logged in
    return null; // Return null to prevent rendering anything before redirect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption,
          textContent,
          type: 'text',
        }),
      });

      if (response.ok) {
        // Handle successful submission, e.g., redirect to the new post
        router.push("/"); // For now, redirect home
      } else {
        // Handle error
        console.error("Failed to submit post");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-lg p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
            Caption
          </label>
          <input
            type="text"
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="A catchy caption"
          />
        </div>
        <div>
          <label htmlFor="textContent" className="block text-sm font-medium text-gray-700">
            Your Joke
          </label>
          <textarea
            id="textContent"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={5}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Tell us a funny joke..."
            required
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isSubmitting ? "Submitting..." : "Submit Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
