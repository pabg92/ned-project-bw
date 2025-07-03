'use client';

import { useRouter } from 'next/navigation';

export default function DevMode() {
  const router = useRouter();

  const handleDemoAccess = (role: 'admin' | 'company' | 'candidate') => {
    // Store demo mode in localStorage
    localStorage.setItem('devMode', 'true');
    localStorage.setItem('devRole', role);
    
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'company') {
      router.push('/company');
    } else if (role === 'candidate') {
      router.push('/candidate');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-2">
          NED Backend
        </h1>
        <p className="text-center text-sm text-gray-600 mb-8">
          Next.js Enterprise Directory - Development Mode
        </p>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">🚧 Development Mode</h3>
              <p className="text-xs text-yellow-700 mb-3">
                Clerk authentication is not configured. Choose a role to explore the interface:
              </p>
            </div>
            
            <button
              onClick={() => handleDemoAccess('admin')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              🛠️ Admin Dashboard
            </button>
            
            <button
              onClick={() => handleDemoAccess('company')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              🏢 Company Portal
            </button>
            
            <button
              onClick={() => handleDemoAccess('candidate')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              👤 Candidate Profile
            </button>
          </div>
          
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Available Features</h3>
            <div className="text-xs text-blue-600">
              <ul className="mt-1 ml-4 list-disc space-y-1">
                <li>Admin Dashboard with analytics</li>
                <li>Candidate management and approval workflows</li>
                <li>Document upload and management</li>
                <li>Profile quality assessment</li>
                <li>API testing interface (67+ endpoints)</li>
                <li>Mock data for development testing</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <strong>To enable full authentication:</strong> Set up your Clerk keys in <code>.env.local</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}