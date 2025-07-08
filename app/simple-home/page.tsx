"use client";

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export default function SimpleHomePage() {
  const { isSignedIn, userId } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Board Champions</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Authentication Status</h2>
          <p className="mb-2">Signed In: {isSignedIn ? 'Yes' : 'No'}</p>
          {isSignedIn && <p className="mb-2">User ID: {userId}</p>}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            {!isSignedIn ? (
              <>
                <Link href="/sign-in" className="block text-blue-600 hover:underline">
                  Sign In
                </Link>
                <Link href="/sign-up" className="block text-blue-600 hover:underline">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link href="/search" className="block text-blue-600 hover:underline">
                  Search Candidates
                </Link>
                <Link href="/set-admin" className="block text-blue-600 hover:underline">
                  Set Admin Role
                </Link>
                <Link href="/admin" className="block text-blue-600 hover:underline">
                  Admin Panel
                </Link>
                <Link href="/test-clerk" className="block text-blue-600 hover:underline">
                  Test Clerk
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}