"use client";

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SetAdminPage() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/set-admin', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Admin role granted! Redirecting to admin panel...');
        // Reload user data
        await user?.reload();
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      } else {
        setMessage('Error: ' + data.error);
      }
    } catch (error) {
      setMessage('Failed to set admin role');
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in first</h1>
          <button
            onClick={() => router.push('/sign-in')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const currentRole = user?.publicMetadata?.role || 'user';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Set Admin Role</h1>
        
        <div className="mb-6 space-y-2">
          <p><strong>User ID:</strong> {userId}</p>
          <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
          <p><strong>Current Role:</strong> <span className={`font-semibold ${currentRole === 'admin' ? 'text-green-600' : 'text-gray-600'}`}>{currentRole}</span></p>
        </div>

        {currentRole === 'admin' ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            You already have admin access!
          </div>
        ) : (
          <button
            onClick={handleSetAdmin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting Admin Role...' : 'Grant Admin Access'}
          </button>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-600 hover:underline"
          >
            Go to Admin Panel →
          </button>
        </div>
      </div>
    </div>
  );
}