import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

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

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 })
    const chunks = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => {})

    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text('Xlbk Customwear', { align: 'center' })
    doc.text('Jl. Contoh No. 123, Jakarta Selatan', { align: 'center' })
    doc.text('Email: info@xlbk.com | Telp: 0812-3456-7890', { align: 'center' })
    doc.moveDown()

    // Invoice Details
    doc.fontSize(10)
    doc.text(`Invoice Number: ${order.invoiceNumber}`)
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('id-ID')}`)
    doc.text(`Payment Method: ${order.paymentMethod}`)
    doc.text(`Payment Status: ${order.paymentStatus}`)
    doc.moveDown()

    // Customer Info
    doc.text('Customer Information:', { underline: true })
    doc.text(`Name: ${order.customerName}`)
    doc.text(`Email: ${order.customerEmail}`)
    doc.text(`Phone: ${order.customerPhone}`)
    if (order.address) doc.text(`Address: ${order.address}`)
    doc.moveDown()

    // Order Items Table
    const tableTop = doc.y
    doc.text('Order Items:', { underline: true })
    doc.moveDown()
    
    let y = doc.y
    doc.text('Product', 50, y)
    doc.text('Qty', 250, y)
    doc.text('Price', 350, y)
    doc.text('Subtotal', 450, y)
    doc.moveDown()
    
    y = doc.y
    doc.lineWidth(0.5).moveTo(50, y).lineTo(550, y).stroke()
    
    order.items.forEach((item) => {
      y = doc.y
      doc.text(item.product.name.substring(0, 30), 50, y)
      doc.text(item.quantity.toString(), 250, y)
      doc.text(`Rp ${item.price.toLocaleString()}`, 350, y)
      doc.text(`Rp ${(item.price * item.quantity).toLocaleString()}`, 450, y)
      doc.moveDown()
    })
    
    y = doc.y
    doc.lineWidth(0.5).moveTo(50, y).lineTo(550, y).stroke()
    doc.moveDown()
    
    doc.text(`Total: Rp ${order.total.toLocaleString()}`, 450, doc.y, { align: 'right' })
    doc.moveDown()

    // Footer
    doc.fontSize(8)
    doc.text('Terima kasih telah berbelanja di Xlbk Customwear', { align: 'center' })
    doc.text('Pesanan akan diproses setelah pembayaran dikonfirmasi', { align: 'center' })

    doc.end()

    // Return PDF
    const buffer = Buffer.concat(chunks)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${order.invoiceNumber}.pdf`
      }
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}