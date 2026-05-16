import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    // Better-auth uses 'better-auth.session_token' or similar as default cookie name.
    // We check for common session cookie prefixes/names used by better-auth.
    const cookies = request.cookies.getAll();
    const hasSession = cookies.some(cookie => 
        cookie.name.includes("better-auth.session_token") || 
        cookie.name.includes("session_token")
    );

    if (!hasSession) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/incidents/:path*"],
};
