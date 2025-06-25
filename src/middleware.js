import { NextResponse } from 'next/server';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

export async function middleware(request) {
  const origin = request.headers.get('origin');
  const normalizedOrigin = origin?.replace(/\/$/, '');

  const isAllowed =
    (normalizedOrigin && allowedOrigins.includes(normalizedOrigin)) ||
    (!origin && process.env.NODE_ENV === 'development');

  if (
    request.method === 'OPTIONS' &&
    request.headers.get('Access-Control-Request-Method')
  ) {
    const response = new NextResponse(null, { status: 204 });

    if (isAllowed && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-V, Authorization'
    );

    return response;
  }

  if (!isAllowed) {
    return new NextResponse('Not allowed by CORS', { status: 403 });
  }

  const response = NextResponse.next();
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-V, Authorization'
  );

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
