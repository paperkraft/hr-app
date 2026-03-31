import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const proxy = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Root and Base Dashboard Redirection
    // Automatically route users to their specific dashboard based on role
    if (path === "/" || path === "/dashboard") {
      if (!token) return NextResponse.redirect(new URL("/login", req.url));
      
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

    // 2. Role-Based Access Control (RBAC)
    // Securely prevent users from accessing routes they don't have permissions for
    
    // Protect Manager Routes (Allow only Manager and Admin)
    if (path.startsWith("/dashboard/manager") && token?.role !== "MANAGER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }

    // Protect Accountant Routes (Allow only Accountant and Admin)
    if (path.startsWith("/dashboard/accountant") && token?.role !== "ACCOUNTANT" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }

    // Protect Admin Routes (Strict - Allow ONLY Admin)
    if (path.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }
  },
  {
    callbacks: {
      // authorized callback determines if the middleware function above runs.
      // If it returns false, users are automatically redirected to authOptions.pages.signIn (/login)
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export { proxy };

// SECURITY BY DEFAULT: This matcher protects all routes except specifically excluded ones (login, auth api, and static assets)
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
