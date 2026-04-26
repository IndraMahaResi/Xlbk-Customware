import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const promos = await prisma.promoEvent.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(promos)
  } catch (error) {
    return NextResponse.json({ error: 'Error sistem' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const newPromo = await prisma.promoEvent.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        badge: data.badge || 'PROMO'
      }
    })
    return NextResponse.json(newPromo)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah promo' }, { status: 500 })
  }
}