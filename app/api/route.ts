import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'BoardChampions API',
    status: 'Backend services are being configured. The main website is fully functional.',
    endpoints: {
      health: '/api/health',
      message: 'API endpoints will be enabled once environment variables are configured in Vercel.'
    }
  });
}