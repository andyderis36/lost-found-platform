import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const q = searchParams.get('q');

    const headers = {
      'Accept-Language': 'en',
      'User-Agent': 'LostFoundPlatform/1.0'
    };

    if (lat && lon) {
      // Reverse geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
        headers,
      });

      if (!response.ok) {
        return NextResponse.json(errorResponse('Failed to fetch from geocoding service'), { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(successResponse(data));
    } else if (q) {
      // Forward geocoding (search)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, {
        headers,
      });

      if (!response.ok) {
        return NextResponse.json(errorResponse('Failed to fetch from geocoding service'), { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(successResponse(data));
    }

    return NextResponse.json(errorResponse('Invalid parameters. Provide lat/lon or q.'), { status: 400 });
  } catch (error: any) {
    console.error('[GEOCODE API] Error:', error);
    return NextResponse.json(errorResponse(error.message || 'Internal Server Error'), { status: 500 });
  }
}
