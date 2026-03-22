import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { orderId } = params
    
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Check if payment is already verified
    const isPaid = order.paymentStatus === 'PAID' || order.paymentStatus === 'VERIFIED'
    
    return NextResponse.json({
      paid: isPaid,
      status: order.paymentStatus,
      orderId: order.id,
      invoiceNumber: order.invoiceNumber
    })
  } catch (error) {
    console.error('Check payment error:', error)
    return NextResponse.json(
      { error: 'Failed to check payment' },
      { status: 500 }
    )
  }
}