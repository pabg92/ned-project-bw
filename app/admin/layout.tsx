'use client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if we're in setup mode (no env vars)
  const isSetupMode = typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (isSetupMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Portal Setup Required</h1>
          <p className="text-gray-600 mb-6">
            The admin portal requires configuration of database and authentication services.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h2 className="font-semibold text-blue-900 mb-2">Next Steps:</h2>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Configure Supabase environment variables</li>
              <li>Set up Clerk authentication</li>
              <li>Configure Stripe for payments</li>
              <li>Redeploy the application</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}