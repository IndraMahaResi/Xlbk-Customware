import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password, name } = await request.json()

    // VALIDASI
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah digunakan' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER'
      }
    })

    return NextResponse.json(
      { message: 'User berhasil dibuat', user },
      { status: 201 }
    )

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}