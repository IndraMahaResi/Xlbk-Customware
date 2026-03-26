import { prisma } from '@/lib/prisma'
import { comparePassword, createToken } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    const isValid = await comparePassword(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    const token = createToken(user)

    // 🔥 REVISI: Kirim token & user di body JSON agar bisa dibaca localStorage
    const response = NextResponse.json({
      success: true,
      token: token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    // Tetap set cookie untuk keamanan tambahan di Server Side
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return response

  } catch (error) {
    console.error("Login API Error:", error)
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}