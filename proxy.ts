import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/", "/login"];

// Routes that require ADMIN or MANAGER (not LOGISTICS)
const editorRoutes = ["/dashboard/events/new", "/dashboard/events/edit"];
// Routes that require MANAGER
const managerRoutes = ["/dashboard/users"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get("session")?.value;
  const session = cookie ? await decrypt(cookie).catch(() => null) : null;

  // 1. Not logged in -> Redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 2. Logged in and trying to access public route -> Redirect to dashboard
  if (isPublicRoute && session && path === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // 3. RBAC Enforcement
  if (session) {
    const role = session.user.role;

    // Logistics cannot access editor routes
    const isEditorRoute = editorRoutes.some(r => path.startsWith(r));
    if (isEditorRoute && role === "LOGISTICS") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    // Only Managers can access manager routes
    const isManagerRoute = managerRoutes.some(r => path.startsWith(r));
    if (isManagerRoute && role !== "MANAGER") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    
    // Check if user is active (we should check DB but cookie is faster for middleware)
    // For now, we trust the cookie, but we could add a check if needed.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
