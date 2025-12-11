import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const session = req.auth
  const isLoggedIn = !!session?.user   // <-- FIXED (checks real user)
  const pathname = req.nextUrl.pathname

  const isAdminRoute = pathname.startsWith("/admin")
  const isLoginPage = pathname === "/admin/login"

  // 1. Not logged in → accessing admin → redirect to login
  if (isAdminRoute && !isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  // 2. Logged in → trying to access login page → redirect to dashboard
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"]
}
