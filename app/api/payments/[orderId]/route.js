import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    // 🔥 PERBAIKAN UTAMA: Tambahkan 'await' sebelum memecah params
    // Ini wajib dilakukan di Next.js 15 ke atas
    const { orderId } = await params;
    
    // Cari data transaksi berdasarkan orderId
    const payment = await prisma.paymentTransaction.findFirst({
      where: { orderId }
    })

    // Jika data tidak ditemukan, kembalikan status 404
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Kembalikan data payment ke frontend
    return NextResponse.json(payment)
    
  } catch (error) {
    console.error('Fetch payment error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}