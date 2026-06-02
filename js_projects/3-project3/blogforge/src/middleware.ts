// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// v4 middleware uses withAuth() wrapper instead of auth()
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true = allow through. Return false = redirect to signIn page.
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        const protectedRoutes = ["/dashboard", "/posts/new", "/posts/edit"];
        const isProtectedRoute = protectedRoutes.some((route) =>
          pathname.startsWith(route),
        );

        // If it's a protected route, require a token
        if (isProtectedRoute) return !!token;

        // Everything else is allowed
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
