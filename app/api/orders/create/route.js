import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function generateInvoiceNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV/${year}${month}${day}/${random}`
}

export async function POST(request) {
  try {
    const data = await request.json()
    
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

    // 🔥 PERBAIKAN UTAMA: Paksa semua nominal menjadi format Angka (Number)
    const subtotalFixed = Number(data.subtotal) || 0;
    const totalFixed = Number(data.total) || 0;

    // 🟢 Hitung nominal yang harus dibayar saat ini (Full atau DP 50%)
    const paymentType = data.paymentType || 'FULL'
    const amountToPay = paymentType === 'DP' ? (totalFixed / 2) : totalFixed
    
    // Create order with invoice number
    const order = await prisma.order.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        address: data.address,
        
        // Menangkap data Asal Negara dan Status Khusus dari Frontend
        countryOrigin: data.countryOrigin || 'Indonesia', 
        status: data.status || 'PENDING',
        
        // 🟢 Simpan tipe pembayaran ke database
        paymentType: paymentType,
        
        designFile: data.designFile,
        designNotes: data.designNotes,
        notes: data.notes,
        
        // 🔥 Gunakan nilai Angka yang sudah dikonversi
        subtotal: subtotalFixed,
        total: totalFixed,
        
        paymentMethod: data.paymentMethod,
        paymentStatus: 'UNPAID',
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: Number(item.quantity) || 1, // 🔥 Paksa jadi angka
            price: Number(item.price) || 0,       // 🔥 Paksa jadi angka
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
      amount: amountToPay, // Tagihan awal menggunakan amountToPay (50% atau 100%)
      method: order.paymentMethod,
      status: 'PENDING',
      expiresAt: order.expiredAt
    }

    // Generate crypto payment details if needed
    if (order.paymentMethod === 'BTC') {
      paymentData.walletAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      paymentData.cryptoAmount = parseFloat((amountToPay / 1000000).toFixed(6)) 
      paymentData.cryptoCurrency = 'BTC'
    } else if (order.paymentMethod === 'USDT') {
      paymentData.walletAddress = 'TXLq3Yh4Kv9XqVqQZ8qVqQZ8qVqQZ8qVqQZ8qV'
      paymentData.cryptoAmount = parseFloat((amountToPay / 15000).toFixed(2)) 
      paymentData.cryptoCurrency = 'USDT'
    } else if (order.paymentMethod === 'QRIS') {
      // Generate QR code
      paymentData.qrCode = '/images/qris-placeholder.png'
    }

    await prisma.paymentTransaction.create({
      data: paymentData
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
      total: order.total,
      amountToPay: amountToPay // Kirim nominal yang harus dibayar saat ini ke frontend
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order: ' + error.message },
      { status: 500 }
    )
  }
}