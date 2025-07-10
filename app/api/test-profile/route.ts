import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const profileId = '60de3fa9-8f52-4a57-94c2-fb67faf55669'; // James Montgomery
  
  try {
    // Make internal API call
    const response = await fetch(`${request.nextUrl.origin}/api/search/profiles/${profileId}`, {
      headers: request.headers,
    });
    
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      contentType,
      isJson: contentType?.includes('application/json'),
      isHtml: contentType?.includes('text/html'),
      bodyPreview: text.substring(0, 200),
      url: response.url
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}