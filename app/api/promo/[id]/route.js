import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.promoEvent.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus promo' }, { status: 500 })
  }
}