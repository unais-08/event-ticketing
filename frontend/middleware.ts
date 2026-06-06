import { NextRequest, NextResponse } from "next/server";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  ORGANIZER: "/organizer/dashboard",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const role = request.cookies.get("eventflow_role")?.value;

  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  const isOrganizerRoute =
    pathname === "/organizer" || pathname.startsWith("/organizer/");

  // ADMIN can only access /admin/*
  if (role === "ADMIN") {
    if (!isAdminRoute) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
    }

    return NextResponse.next();
  }

  // ORGANIZER can only access /organizer/*
  if (role === "ORGANIZER") {
    if (!isOrganizerRoute) {
      return NextResponse.redirect(
        new URL("/organizer/dashboard", request.url)
      );
    }

    return NextResponse.next();
  }

  // Normal users cannot access admin or organizer routes
  if (isAdminRoute || isOrganizerRoute) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};