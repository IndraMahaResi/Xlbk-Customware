import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({
      message: 'Logout success'
    })

    // hapus cookie token
    response.cookies.set('token', '', {
      httpOnly: true,
      expires: new Date(0)
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}