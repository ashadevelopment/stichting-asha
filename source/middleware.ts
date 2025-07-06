import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) { 
  const token = await getToken({ req });
  const url = req.nextUrl.clone();

  // Block users without proper roles from /beheer
  if (url.pathname.startsWith("/beheer")) {
    // Allow both beheerder and developer roles
    const userRole = token?.role as string;
    if (userRole !== "beheerder" && userRole !== "developer") {
      console.log("MIDDLEWARE: Blocking access for role:", userRole);
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/beheer/:path*"],
};