import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privatePaths = ['/me'];
const authPaths = ['/login', '/register'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get('sessionToken')?.value;
    // Chưa đăng nhập mà vào mấy trang private thì redirect về login
    if (privatePaths.some(path => pathname.startsWith(path)) && !sessionToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    // Đăng nhập rồi thì không cho vào login/register nữa
    if (authPaths.some(path => pathname.startsWith(path)) && sessionToken) {
        return NextResponse.redirect(new URL('/me', request.url));
    }

    return NextResponse.next();
}

// config những route mà proxy sẽ áp dụng
export const config = {
    matcher: [
        '/me/:path*', // Chặn /me và tất cả con của nó (/me/a, /me/b...)
        '/login',
        '/register'
    ]
};