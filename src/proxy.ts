import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Root and Base Dashboard Redirection
    if (path === "/" || path === "/dashboard") {
      if (!token) return NextResponse.redirect(new URL("/login", req.url));
      
      switch (token.role) {
        case "SYSTEM_ADMIN":
        case "ADMIN":
          return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        case "ACCOUNTANT":
          return NextResponse.redirect(new URL("/dashboard/accountant", req.url));
        case "EMPLOYEE":
        default:
          return NextResponse.redirect(new URL("/dashboard/employee", req.url));
      }
    }

    // 2. Role-Based Access Control (RBAC)
    const isAdmin = token?.role === "ADMIN" || token?.role === "SYSTEM_ADMIN";
    const isManager = token?.isTeamLeader === true;
    
    if (path.startsWith("/dashboard/manager") && !isManager && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }

    if (path.startsWith("/dashboard/accountant") && token?.role !== "ACCOUNTANT" && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }

    if (path.startsWith("/dashboard/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow public access to cron and auth APIs
        if (path.startsWith("/api/cron") || path.startsWith("/api/auth")) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - api/cron (Protected by its own key)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api/auth|api/cron|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
