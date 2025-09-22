import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../config/jwt';

export async function middleware(request) {
    // Check if it's a business route
    if (request.nextUrl.pathname.startsWith('/business') || 
        request.nextUrl.pathname.startsWith('/api/business')) {
        
        const accessToken = request.cookies.get('accessToken');

        if (!accessToken) {
            // Redirect to business login if no token
            return NextResponse.redirect(new URL('/Bauth', request.url));
        }

        try {
            const decoded = verifyAccessToken(accessToken.value);
            
            // Check if user has business role
            if (!decoded || decoded.role !== 'business') {
                return NextResponse.redirect(new URL('/Bauth', request.url));
            }

            // Add company info to headers for API routes
            if (request.nextUrl.pathname.startsWith('/api/business')) {
                const requestHeaders = new Headers(request.headers);
                requestHeaders.set('x-company-email', decoded.email);
                requestHeaders.set('x-company-bid', decoded.bid);
                requestHeaders.set('x-company-name', decoded.companyName);

                return NextResponse.next({
                    request: {
                        headers: requestHeaders,
                    },
                });
            }

            return NextResponse.next();
        } catch (error) {
            // Token invalid or expired
            return NextResponse.redirect(new URL('/Bauth', request.url));
        }
    }

    // For non-business routes
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/business/:path*',
        '/api/business/:path*'
    ]
}; 