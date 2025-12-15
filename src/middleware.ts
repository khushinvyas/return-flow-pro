import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

// 1. Specify protected and public routes
// 1. Specify protected and public routes
const protectedRoutes = ['/'];
const publicRoutes = ['/login', '/register', '/subscription-expired'];

export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path) || path.startsWith('/dashboard') || path.startsWith('/tickets') || path.startsWith('/customers') || path.startsWith('/products') || path.startsWith('/companies') || path.startsWith('/settings');
    const isPublicRoute = publicRoutes.includes(path);

    // 3. Decrypt the session from the cookie
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie as string);

    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // 5. Subscription Check
    if (isProtectedRoute && session?.userId && !session?.isGlobalAdmin) {
        const status = session.subscriptionStatus;
        const expiry = session.subscriptionExpiry ? new Date(session.subscriptionExpiry) : null;
        const now = new Date();

        // Check if status is invalid or trial/subscription expired
        // If status is undefined (legacy users?), we might fail safe or block. Let's block to force update.
        // Actually, for migration, existing users might not have status in session unless they relogin.
        // But the prompt implies new flow. I'll strictly enforce.

        const isExpired =
            (status !== 'ACTIVE' && status !== 'TRIAL') ||
            (expiry && expiry < now);

        if (isExpired) {
            return NextResponse.redirect(new URL('/subscription-expired', req.nextUrl));
        }
    }

    // 6. Redirect to /dashboard if the user is authenticated
    // Disabled to prevent redirect loops when session is invalidated by DB but Valid by JWT
    /*
    if (isPublicRoute && session?.userId && path !== '/subscription-expired' && path !== '/') {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    */

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
