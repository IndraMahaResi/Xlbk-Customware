import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('token')?.value

  // 1. DAFTAR PATH PUBLIC (Bisa diakses siapa saja)
  const isPublicApi = path.startsWith('/api/auth') || 
                      path.startsWith('/api/products') || 
                      path.startsWith('/api/orders/create')

  // 2. PROTEKSI HALAMAN DASHBOARD
  if (path.startsWith('/dashboard')) {
    // Jika tidak ada token sama sekali
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // Verifikasi apakah token valid (mencegah token palsu/editan manual)
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch (error) {
      // Jika token expired atau rusak, hapus cookie dan paksa login ulang
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }
  }

  // 3. PROTEKSI API PRIVATE (Admin Only)
  if (path.startsWith('/api/') && !isPublicApi) {
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Sesi berakhir, silakan login' },
        { status: 401 }
      )
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)

      // Cek role khusus untuk folder api/admin jika ada
      if (path.startsWith('/api/admin') && payload.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid Session' }, { status: 401 })
    }
  }

  // 4. CEGAH INFINITE LOOP PADA LOGIN/REGISTER
  // Kita HAPUS redirect otomatis dari /login ke /dashboard di sini.
  // Biarkan halaman login yang menangani redirect setelah localStorage terisi.
  
  return NextResponse.next()
}

// CONFIG MATCHER (Dioptimalkan)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth, api/products (API Public)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, uploads (public folders)
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
}