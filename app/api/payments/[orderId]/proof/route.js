import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  try {
    // 🔥 PERBAIKAN: Wajib unwrap params dengan await di Next.js 15
    const resolvedParams = await params;
    const { orderId } = resolvedParams;
    
    // Ambil URL file dari body request
    const { proofUrl } = await request.json()

    // 1. Cari data pesanan terlebih dahulu untuk mengecek tipe pembayaran
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    // 2. LOGIKA CERDAS: Tentukan status pembayaran berikutnya
    let newPaymentStatus = existingOrder.paymentStatus

    if (existingOrder.paymentType === 'DP' && existingOrder.paymentStatus === 'UNPAID') {
      // Jika ini DP dan baru bayar pertama kali -> DP MASUK (VERIFIED)
      newPaymentStatus = 'VERIFIED'
    } 
    else if (existingOrder.paymentType === 'DP' && existingOrder.paymentStatus === 'VERIFIED') {
      // Jika ini DP dan pelanggan sedang melunasi sisa tagihan -> LUNAS (PAID)
      newPaymentStatus = 'PAID'
    } 
    else if (existingOrder.paymentType === 'FULL' || !existingOrder.paymentType) {
      // Jika sistemnya bayar lunas dari awal -> LUNAS (PAID)
      newPaymentStatus = 'PAID'
    }

    // 3. Update order dengan bukti pembayaran dan status yang sudah dikalkulasi
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProof: proofUrl,
        paymentStatus: newPaymentStatus,
        // Jika statusnya berujung LUNAS (PAID), barulah catat waktu pelunasannya
        ...(newPaymentStatus === 'PAID' ? { paidAt: new Date() } : {})
      }
    })

    // 4. Update payment transaction agar sinkron dengan status Order
    await prisma.paymentTransaction.updateMany({
      where: { orderId },
      data: {
        status: newPaymentStatus
      }
    })

    // Here you would typically send email notification to admin
    // await sendEmailNotification(order)

    return NextResponse.json({ 
      success: true,
      message: 'Payment proof uploaded successfully',
      paymentStatus: newPaymentStatus 
    })
  } catch (error) {
    console.error('Upload payment proof error:', error)
    return NextResponse.json(
      { error: 'Failed to upload payment proof' },
      { status: 500 }
    )
  }
}