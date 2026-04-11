import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function middleware(request: NextRequest) {
  // Get auth token from cookie (set by login API)
  const token = request.cookies.get('auth_token')?.value

  let isAuthenticated = false

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET)
      isAuthenticated = true
    } catch {
      // Token is invalid or expired
      isAuthenticated = false
    }
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/auth') && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
