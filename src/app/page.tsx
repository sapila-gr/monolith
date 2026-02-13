"use client"; // This component needs to be a Client Component to use useSession

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold">Welcome, {session.user?.name}!</h1>
        <p className="text-lg">You are signed in as {session.user?.email}</p>
        <button
          onClick={() => signOut()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold">You are not signed in</h1>
      <button
        onClick={() => signIn("github")} // 'github' is the ID of our provider
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
