import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(_req) {
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/sign-in" },
  }
);

export const config = {
  matcher: [
    "/upload/:path*",
    "/studio/:path*",
    "/settings/:path*",
    "/subscriptions/:path*",
    "/history/:path*",
    "/watch-later/:path*",
    "/api/videos/upload",
    "/api/user/:path*",
    "/api/notifications/:path*",
    "/api/studio/:path*",
  ],
};
