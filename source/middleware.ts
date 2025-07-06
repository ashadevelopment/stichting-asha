import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) { 
  const token = await getToken({ req });
  const url = req.nextUrl.clone();

  // Block non-beheerders from /admin
  if (url.pathname.startsWith("/beheer") && token?.role !== "beheerder") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/beheer/:path*"],
};