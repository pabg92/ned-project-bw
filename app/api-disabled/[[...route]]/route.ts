import { NextRequest, NextResponse } from 'next/server';

// Catch-all API route handler during setup
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API endpoints are being configured. Please check back later.',
    status: 'setup_in_progress'
  }, { status: 503 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API endpoints are being configured. Please check back later.',
    status: 'setup_in_progress'
  }, { status: 503 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API endpoints are being configured. Please check back later.',
    status: 'setup_in_progress'
  }, { status: 503 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API endpoints are being configured. Please check back later.',
    status: 'setup_in_progress'
  }, { status: 503 });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API endpoints are being configured. Please check back later.',
    status: 'setup_in_progress'
  }, { status: 503 });
}