import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request) {
  const path = request.nextUrl.pathname

  // PUBLIC ROUTES
  const isPublicPath =
    path === '/' ||
    path === '/login' ||
    path === '/register' ||
    path.startsWith('/products') ||
    path === '/order' ||
    path === '/how-to-order' ||
    path === '/contact' ||
    path.startsWith('/api/auth') ||
    path === '/api/products' // 🔥 INI KUNCI FIX LU

  const token = request.cookies.get('token')?.value

  // 🔐 Protect DASHBOARD ONLY
  if (path.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 🔐 Protect API selain products
  if (path.startsWith('/api/') && !isPublicPath) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      await jwtVerify(token, secret)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }

  // Redirect kalau udah login tapi buka login page
  if (token && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}