import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// =================================================================
// 🟢 FUNGSI BANTUAN: MENGIRIM WA OTOMATIS (MENGGUNAKAN FONNTE)
// =================================================================
async function sendWhatsAppNotification(phone, name, invoice, status, trackingNumber = null) {
  // Token Fonnte Anda
  const FONNTE_TOKEN = 'dn5ZzvVBzcTwuQiPbmHS' 
  
  // Format nomor HP (pastikan diawali 62)
  let formattedPhone = phone || '';
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.substring(1);
  }

  // Terjemahan Status agar lebih enak dibaca pelanggan
  const statusText = {
    'PENDING': '⏳ Menunggu Pembayaran',
    'NEED_VERIFICATION': '🔍 Sedang Diverifikasi Admin',
    'VERIFIED': '💳 Pembayaran Diterima / Terverifikasi',
    'PAID': '💸 Pembayaran Lunas',
    'PROCESSING': '🏭 Sedang Diproduksi / Dicetak',
    'SHIPPED': '🚚 Sedang Dikirim ke Alamat Anda',
    'COMPLETED': '✅ Selesai / Sudah Diterima',
    'CANCELLED': '❌ Dibatalkan'
  }

  const translatedStatus = statusText[status] || status;

  let message = `Halo Kak *${name}*, 👋\n\n`;
  message += `Pesanan Anda dengan nomor Invoice *${invoice}* saat ini telah diupdate menjadi:\n\n`;
  message += `👉 *${translatedStatus}*\n\n`;

  // Tampilkan Resi jika status dikirim
  if (status === 'SHIPPED' && trackingNumber) {
    message += `📦 *Nomor Resi Pengiriman:* ${trackingNumber}\n\n`;
  }

  message += `Terima kasih telah mempercayakan pesanan Anda kepada XLBK Customwear! 🙏`;

  try {
    // 🔥 REVISI: Ubah format pengiriman menggunakan URLSearchParams (Wajib untuk API Fonnte terbaru)
    const urlencodedParams = new URLSearchParams();
    urlencodedParams.append('target', formattedPhone);
    urlencodedParams.append('message', message);
    urlencodedParams.append('countryCode', '62');

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/x-www-form-urlencoded' // Bukan application/json
      },
      body: urlencodedParams.toString()
    });

    // 🔥 REVISI: Tangkap sebagai Text terlebih dahulu untuk menghindari Crash "Unexpected token <"
    const responseText = await response.text();

    try {
      const result = JSON.parse(responseText);
      console.log('✅ WA Notification sent:', result);
    } catch (parseError) {
      console.warn('⚠️ Fonnte membalas dengan format bukan JSON (Aman, diabaikan):', responseText);
    }
  } catch (error) {
    console.error('❌ Failed to send WA notification:', error);
  }
}

// =================================================================
// 🟢 GET ORDER DETAIL
// =================================================================
export async function GET(request, { params }) {
  try {
    const { orderId } = await params;
    
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Fetch order error:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// =================================================================
// 🟢 PATCH: UPDATE ORDER DARI DASHBOARD (DAN KIRIM WA)
// =================================================================
export async function PATCH(request, { params }) {
  try {
    const { orderId } = await params;
    const data = await request.json()
    
    // 1. Cari data order yang lama dulu untuk perbandingan
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    // 2. Update order di Database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data,
      include: {
        items: true
      }
    })

    // 3. 🚀 TRIGGER NOTIFIKASI WA JIKA STATUS BERUBAH
    // Mengecek apakah status dikirim dari dashboard dan apakah statusnya berbeda dengan yang lama
    if (data.status && data.status !== existingOrder.status) {
      // Panggil fungsi kirim WA tanpa menghentikan proses response
      sendWhatsAppNotification(
        updatedOrder.customerPhone, 
        updatedOrder.customerName, 
        updatedOrder.invoiceNumber, 
        updatedOrder.status,
        updatedOrder.trackingNumber // Tambahkan jika ada resi
      );
    }

    // Trigger juga jika yang diubah adalah status pembayaran (paymentStatus)
    if (data.paymentStatus && data.paymentStatus !== existingOrder.paymentStatus) {
       sendWhatsAppNotification(
        updatedOrder.customerPhone, 
        updatedOrder.customerName, 
        updatedOrder.invoiceNumber, 
        data.paymentStatus
      );
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// =================================================================
// 🟢 DELETE ORDER
// =================================================================
export async function DELETE(request, { params }) {
  try {
    const { orderId } = await params;
    
    await prisma.orderItem.deleteMany({
      where: { orderId }
    })

    await prisma.order.delete({
      where: { id: orderId }
    })

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}