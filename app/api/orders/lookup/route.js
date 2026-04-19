import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { invoiceNumber, customerPhone } = await request.json()

    if (!invoiceNumber || !customerPhone) {
      return NextResponse.json(
        { error: 'Nomor Invoice dan Nomor WhatsApp wajib diisi' },
        { status: 400 }
      )
    }

    // Cari pesanan berdasarkan Invoice dan Nomor WA yang cocok
    const order = await prisma.order.findFirst({
      where: {
        invoiceNumber: invoiceNumber.trim(),
        customerPhone: customerPhone.trim(),
      },
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
        { error: 'Pesanan tidak ditemukan. Pastikan Nomor Invoice dan WA sudah benar.' },
        { status: 404 }
      )
    }

    // 🟢 REVISI: Hitung sisa tagihan dengan benar
    let outstandingAmount = 0;
    if (order.paymentType === 'DP' && order.paymentStatus !== 'PAID') {
        // order.total sudah mencakup harga barang + ongkir. Sisa tagihan adalah setengahnya.
        outstandingAmount = order.total / 2; 
    }

    return NextResponse.json({
        success: true,
        order: {
            id: order.id,
            invoiceNumber: order.invoiceNumber,
            customerName: order.customerName,
            status: order.status,
            paymentType: order.paymentType,
            paymentStatus: order.paymentStatus,
            total: order.total,
            shippingFee: order.shippingFee,
            outstandingAmount: outstandingAmount,
            createdAt: order.createdAt,
            items: order.items
        }
    })

  } catch (error) {
    console.error('Lookup order error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada sistem' },
      { status: 500 }
    )
  }
}