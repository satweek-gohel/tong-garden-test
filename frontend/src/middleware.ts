import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_ONLY_PATHS = ["/login", "/signup"];

const ALWAYS_PUBLIC_PATHS = ["/forgot-password", "/verify-email"];

async function hasValidAccessToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthOnlyPath = AUTH_ONLY_PATHS.includes(pathname);
  const isAlwaysPublicPath = ALWAYS_PUBLIC_PATHS.includes(pathname);

  const accessToken = request.cookies.get("access_token")?.value;
  const hasValidAccess = await hasValidAccessToken(accessToken);

  const hasRefreshCookie = Boolean(request.cookies.get("refresh_token")?.value);
  const hasSession = hasValidAccess || hasRefreshCookie;

  if (!hasSession && !isAuthOnlyPath && !isAlwaysPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && isAuthOnlyPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
