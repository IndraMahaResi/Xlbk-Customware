import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request) {
  const path = request.nextUrl.pathname

  // PUBLIC ROUTES - Routes yang bisa diakses tanpa login
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/products',
    '/order',
    '/how-to-order',
    '/contact',
    '/payment', // Tambahkan untuk halaman payment
    '/invoice', // Tambahkan untuk halaman invoice
  ]
  
  // PUBLIC API ROUTES
  const publicApiPaths = [
    '/api/auth',
    '/api/products',
    '/api/contact',
    '/api/upload', // Upload file public
    '/api/payment', // Payment API public
    '/api/orders/create', // Create order public
  ]

  // Cek apakah path termasuk public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  )
  
  const isPublicApi = publicApiPaths.some(apiPath => 
    path.startsWith(apiPath)
  )

  const token = request.cookies.get('token')?.value

  // 🔐 Protect DASHBOARD ONLY
  if (path.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  // 🔐 Protect API yang bukan public
  if (path.startsWith('/api/') && !isPublicApi) {
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          message: 'Anda harus login untuk mengakses API ini' 
        }, 
        { status: 401 }
      )
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      
      // Optional: Cek role untuk API tertentu
      if (path.startsWith('/api/admin') && payload.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Akses hanya untuk admin' },
          { status: 403 }
        )
      }
    } catch (error) {
      console.error('Token verification error:', error)
      return NextResponse.json(
        { error: 'Invalid token', message: 'Sesi Anda telah berakhir, silakan login kembali' },
        { status: 401 }
      )
    }
  }

  // Redirect kalau udah login tapi buka login/register page
  if (token && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (images, uploads, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
}