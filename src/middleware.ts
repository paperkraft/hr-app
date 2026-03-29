import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Not logged in? NextAuth automatically redirects to /login based on our config.
    if (!token) return; 

    // Handle root /dashboard redirect based on role automatically 
    if (path === "/dashboard") {
      switch (token.role) {
        case "ADMIN":
          return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        case "MANAGER":
          return NextResponse.redirect(new URL("/dashboard/manager", req.url));
        case "ACCOUNTANT":
          return NextResponse.redirect(new URL("/dashboard/accountant", req.url));
        case "EMPLOYEE":
        default:
          return NextResponse.redirect(new URL("/dashboard/employee", req.url));
      }
    }

    // Role Guards securely enforce proper paths based on token
    // 1. Protect Manager Routes
    if (path.startsWith("/dashboard/manager") && token.role !== "MANAGER" && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }

    // 2. Protect Accountant Routes
    if (path.startsWith("/dashboard/accountant") && token.role !== "ACCOUNTANT" && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }

    // 3. Protect Admin Routes
    if (path.startsWith("/dashboard/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }
  },
  {
    callbacks: {
      // Middleware only runs if this returns true
      authorized: ({ token }) => !!token,
    },
  }
);

// Define exactly which routes trigger this middleware
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
