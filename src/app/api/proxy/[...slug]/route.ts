import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const streamUrl = `https://${slug.join('/')}`;
  
  try {
    // Validate URL format
    const url = new URL(streamUrl);
    
    // Allowed domains for production
    const allowedDomains = [
      'icecast.walmradio.com',
      'stream.radioparadise.com',
      'listen.radionomy.com',
      'streaming.radio.co',
      'ice2.somafm.com',
      'ice1.somafm.com',
      'radio.garden',
      'tunein.com',
      'iheart.com',
      'stream.live.vc.bbcmedia.co.uk',
      'radio.mp3islam.com',
      'online.radioroks.ua'
    ];
    
    if (!allowedDomains.includes(url.hostname)) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }

    // Fetch stream with optimization for Vercel limits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s limit
    
    const response = await fetch(streamUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'TgFM/1.0',
        'Accept': 'audio/mpeg,audio/aac,audio/ogg,*/*;q=0.1',
        'Accept-Encoding': 'identity',
        'Range': request.headers.get('range') || '',
        'Icy-MetaData': '1',
        'Connection': 'close',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch stream: ${response.status}` }, 
        { status: response.status }
      );
    }

    // Get content type and headers
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const contentLength = response.headers.get('content-length');
    const icyMetaint = response.headers.get('icy-metaint');
    
    // Create response headers with caching to reduce requests
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, User-Agent, Accept',
      'Cache-Control': 'public, max-age=300',
      'Connection': 'close',
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }
    
    if (icyMetaint) {
      headers['Icy-Metaint'] = icyMetaint;
    }

    // Disable range requests to reduce bandwidth
    if (request.headers.get('range')) {
      return NextResponse.json({ error: 'Range requests not supported' }, { status: 400 });
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, User-Agent, Accept',
    },
  });
}