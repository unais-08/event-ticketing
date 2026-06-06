import { NextRequest, NextResponse } from "next/server";


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

  const isCheckerRoute =
    pathname === "/checker" || pathname.startsWith("/checker/");

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

  // CHECKER can only access /checker/*
  if (role === "CHECKER") {
    if (!isCheckerRoute) {
      return NextResponse.redirect(
        new URL("/checker/check-in", request.url)
      );
    }

    return NextResponse.next();
  }

  // Normal users cannot access admin/organizer/checker routes
  if (isAdminRoute || isOrganizerRoute || isCheckerRoute) {
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