import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { orderId } = params
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Fetch order error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { orderId } = params
    const data = await request.json()
    
    const order = await prisma.order.update({
      where: { id: orderId },
      data,
      include: {
        items: true
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { orderId } = params
    
    // First delete related order items
    await prisma.orderItem.deleteMany({
      where: { orderId }
    })

    // Then delete the order
    await prisma.order.delete({
      where: { id: orderId }
    })

    return NextResponse.json(
      { message: 'Order deleted successfully' }
    )
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}