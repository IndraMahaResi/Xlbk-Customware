import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { orderId } = await params
    
    if (!orderId) {
       return NextResponse.json({ error: 'Order ID tidak valid' }, { status: 400 })
    }

    // 1. Cari pesanan
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    // 2. Update database (Hanya ubah status agar gembok di HP pelanggan terbuka)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PENDING' 
      }
    })

    return NextResponse.json({ success: true, order: updatedOrder })

  } catch (error) {
    console.error("Error verifying order:", error)
    return NextResponse.json({ error: 'Terjadi kesalahan pada server saat verifikasi' }, { status: 500 })
  }
}