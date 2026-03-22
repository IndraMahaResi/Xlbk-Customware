import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  try {
    // 🔥 PERBAIKAN: Wajib unwrap params dengan await di Next.js 15
    const resolvedParams = await params;
    const { orderId } = resolvedParams;
    
    // Ambil URL file dari body request
    const { proofUrl } = await request.json()

    // Update order with payment proof
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProof: proofUrl,
        paymentStatus: 'PAID', // Mengubah status otomatis menjadi PAID setelah upload
        paidAt: new Date()
      }
    })

    // Update payment transaction
    await prisma.paymentTransaction.updateMany({
      where: { orderId },
      data: {
        status: 'PAID'
      }
    })

    // Here you would typically send email notification to admin
    // await sendEmailNotification(order)

    return NextResponse.json({ 
      success: true,
      message: 'Payment proof uploaded successfully' 
    })
  } catch (error) {
    console.error('Upload payment proof error:', error)
    return NextResponse.json(
      { error: 'Failed to upload payment proof' },
      { status: 500 }
    )
  }
}