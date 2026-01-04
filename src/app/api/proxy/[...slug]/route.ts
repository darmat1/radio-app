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
    
    // For development, allow all domains (remove in production)
    const allowedDomains = [
      'icecast.walmradio.com',
      'stream.radioparadise.com',
      'listen.radionomy.com',
      'streaming.radio.co',
      'ice2.somafm.com',
      'ice1.somafm.com',
      'uf6bae2x0maifpz6.myfritz.net',
      'radio.garden',
      'tunein.com',
      'iheart.com',
      'stream.live.vc.bbcmedia.co.uk',
      'streamer-uc1.radio.co',
      'ais-sa5.cdnstream1.com',
      'radio-streaming.info',
      'provisioning.streamtheworld.com',
      'playerservices.streamtheworld.com'
    ];
    
    // Temporarily allow all domains for testing
    if (false && !allowedDomains.includes(url.hostname)) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }

     // Only log minimal info to reduce bandwidth
     if (Math.random() < 0.01) { // 1% of requests
       console.log('Proxying stream:', streamUrl);
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
      console.error('Stream fetch error:', response.status, response.statusText);
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
      'Cache-Control': 'public, max-age=300', // 5 minutes cache
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

    // Stream response directly with bandwidth optimization
    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
    }

    // Stream the response directly without transformation to preserve quality
    const stream = response.body;

    // Stream the response directly
    return new NextResponse(stream, {
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