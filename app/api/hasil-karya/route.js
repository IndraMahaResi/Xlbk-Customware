import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: Mengambil daftar semua Hasil Karya
export async function GET() {
  try {
    const karya = await prisma.hasilKarya.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8 // Tampilkan maksimal 8 karya terbaru di beranda
    })
    return NextResponse.json(karya)
  } catch (error) {
    console.error('Gagal mengambil data hasil karya:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}

// POST: Menambah karya baru dari Dashboard
export async function POST(request) {
  try {
    const data = await request.json()
    
    if (!data.title || !data.imageUrl) {
      return NextResponse.json({ error: 'Judul dan Gambar wajib diisi' }, { status: 400 })
    }

    const newKarya = await prisma.hasilKarya.create({
      data: {
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl
      }
    })

    return NextResponse.json(newKarya)
  } catch (error) {
    console.error('Gagal menambah hasil karya:', error)
    return NextResponse.json({ error: 'Gagal menambah data' }, { status: 500 })
  }
}