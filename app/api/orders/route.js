import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET all orders (for admin dashboard)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let whereClause = {}
    if (status && status !== 'ALL') {
      whereClause.status = status
    }
    
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Fetch orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST new order (alternative to create route)
export async function POST(request) {
  try {
    const data = await request.json()
    
    // Generate invoice number
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const invoiceNumber = `INV/${year}${month}${day}/${random}`
    
    // Validate required fields
    if (!data.customerName || !data.customerEmail || !data.customerPhone) {
      return NextResponse.json(
        { error: 'Mohon lengkapi data diri' },
        { status: 400 }
      )
    }
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Keranjang belanja kosong' },
        { status: 400 }
      )
    }
    
    // Create order
    const order = await prisma.order.create({
      data: {
        invoiceNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        address: data.address,
        designFile: data.designFile,
        designNotes: data.designNotes,
        notes: data.notes,
        subtotal: data.subtotal,
        total: data.total,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'UNPAID',
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    // Create payment transaction
    let paymentData = {
      orderId: order.id,
      amount: order.total,
      method: order.paymentMethod,
      status: 'PENDING',
      expiresAt: order.expiredAt
    }
    
    // Add crypto details if needed
    if (order.paymentMethod === 'BTC') {
      paymentData.walletAddress = 'bc1qar9fgrkghr6v58qelc3cdjkptyw8j3gh95w24s'
      paymentData.cryptoAmount = (order.total / 1000000).toFixed(6)
      paymentData.cryptoCurrency = 'BTC'
    } else if (order.paymentMethod === 'USDT') {
      paymentData.walletAddress = '0xb1bFa84d196aB9F32D07F770F3c5712501d5903c'
      paymentData.cryptoAmount = (order.total / 15000).toFixed(2)
      paymentData.cryptoCurrency = 'USDT'
    } else if (order.paymentMethod === 'QRIS') {
      paymentData.qrCode = '/images/qris-placeholder.png'
    }
    
    await prisma.paymentTransaction.create({
      data: paymentData
    })
    
    return NextResponse.json({
      success: true,
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
      total: order.total
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order: ' + error.message },
      { status: 500 }
    )
  }
}