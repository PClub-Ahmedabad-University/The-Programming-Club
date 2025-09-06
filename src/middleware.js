import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const protectedPaths = [
    '/api/events',
    '/api/gallery',
    '/api/members',
    '/api/recruitment',
    '/api/forms/submissions',
    '/api/audience/get',
    '/app/admin/dashboard',
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

    if (request.method === 'OPTIONS') return NextResponse.next();

    const isProtected = protectedPaths.some(
        path =>
            pathname.startsWith(path) &&
            !excludedPaths.some(excluded => pathname.includes(excluded))
    );

    if (!isProtected) return NextResponse.next();

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return new NextResponse(
            JSON.stringify({ error: 'Unauthorized - No token provided' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const { id, role } = payload;

        // ✅ Role-based access logic
        if (pathname.startsWith('/api/cp')) {
            if (request.method === 'POST') {
      
                if (!['admin', 'cp-cym-moderator'].includes(role)) {
                    return new NextResponse(
                        JSON.stringify({ error: 'Forbidden - Cannot post problems' }),
                        { status: 403, headers: { 'Content-Type': 'application/json' } }
                    );
                }
            } else if (request.method === 'DELETE') {
                // Only admin can delete
                if (role !== 'admin') {
                    return new NextResponse(
                        JSON.stringify({ error: 'Forbidden - Only admin can delete' }),
                        { status: 403, headers: { 'Content-Type': 'application/json' } }
                    );
                }
            }
        } else {
            // For all other protected routes: only admin and clubMember
            if (!['admin'].includes(role)) {
                return new NextResponse(
                    JSON.stringify({ error: 'Forbidden - Access denied' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', id);
        requestHeaders.set('x-user-role', role);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (err) {
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
        '/api/cp/:path*',
    ],
};
