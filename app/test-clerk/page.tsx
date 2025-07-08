"use client";

import { useAuth } from "@clerk/nextjs";

export default function TestClerkPage() {
  const { isLoaded, userId, sessionId } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Clerk Test Page</h1>
      <p>Clerk Loaded: {isLoaded ? "Yes" : "No"}</p>
      <p>User ID: {userId || "Not signed in"}</p>
      <p>Session ID: {sessionId || "No session"}</p>
    </div>
  );
}