import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const protectedPaths = [
    '/api/events',
    '/api/gallery',
    '/api/members',
    '/api/recruitment',
    '/api/forms/submissions',
    '/api/audience/get',
    '/app/admin/dashboard'
];

const excludedPaths = [
    '/api/events/get',
    '/api/events/winners/get',
    '/api/gallery/get',
    '/api/members/get',
    '/api/recruitment/get',
];

export default async function middleware(request) {
    const { pathname } = request.nextUrl;
    console.log('[Middleware] Pathname:', pathname);

    // Skip OPTIONS requests
    if (request.method === 'OPTIONS') return NextResponse.next();

    const isProtected = protectedPaths.some(
        path => pathname.startsWith(path) &&
            !excludedPaths.some(excluded => pathname.includes(excluded))
    );

    console.log('Is protected:', isProtected);

    if (!isProtected) return NextResponse.next();
    // console.log("Middleware request:", request);
    // console.log('Auth header:', request.headers.get('authorization'));
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
        return new NextResponse(
            JSON.stringify({ error: 'Unauthorized - No token provided' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const token = authHeader.split(' ')[1];
    // console.log('Token:', token);

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        // console.log('Secret:', secret);

        const { payload } = await jwtVerify(token, secret);
        const { id, role } = payload;
        // console.log('Payload:', payload);

        if (role !== 'admin' && role !== 'clubMember') {
            // console.log('Role:', role);
            return new NextResponse(
                JSON.stringify({ error: 'Forbidden - Admin access required' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Optional DB check if needed
        // await connectDB();
        // console.log('Connected to MongoDB');
        // console.log('Request headers:', request.headers);
        const requestHeaders = new Headers(request.headers);
        // console.log('New request headers:', requestHeaders);
        requestHeaders.set('x-user-id', id);
        requestHeaders.set('x-user-role', role);
        // console.log('Updated request headers:', requestHeaders);
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

    } catch (err) {
        console.error('[Middleware] JWT verification error:', err);
        return new NextResponse(
            JSON.stringify({ error: 'Unauthorized - Invalid or expired token' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
export const config = {
    matcher: [
      '/api/events/:path*',
      '/api/gallery/:path*',
      '/api/members/:path*',
      '/api/recruitment/:path*',
      '/api/forms/submissions/:path*',
      '/api/audience/:path*',
    ],
  };
  