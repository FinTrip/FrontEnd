import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const isAuthPage = request.nextUrl.pathname.startsWith('/page/auth')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/page/dashboard')

  if (!token && isDashboardPage) {
    return NextResponse.redirect(new URL('/page/auth/login', request.url))
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/page/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/page/dashboard/:path*',
    '/page/auth/:path*',
  ],
}