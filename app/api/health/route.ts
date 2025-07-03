import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'BoardChampions is running',
    frontend: 'operational',
    backend: 'configuration_pending'
  });
}