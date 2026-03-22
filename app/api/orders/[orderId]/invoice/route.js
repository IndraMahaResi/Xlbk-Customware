import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
// Menggunakan versi standalone agar terhindar dari error ENOENT Helvetica.afm
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js'

export async function GET(request, { params }) {
  try {
    // Unwrap params untuk Next.js 15
    const resolvedParams = await params;
    const { orderId } = resolvedParams;
    
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

    // Bungkus proses PDFKit ke dalam Promise
    const pdfBuffer = await new Promise((resolve, reject) => {
      // Create PDF document
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        layout: 'portrait'
      })
      
      const chunks = []
      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', err => reject(err))

      // --- PALET WARNA DIBUAT LEBIH GELAP & TEGAS ---
      const textDark = '#000000';   // Hitam Pekat
      const textGray = '#333333';   // Abu-abu Gelap (sebelumnya pudar)
      const textLight = '#555555';  // Abu-abu Medium
      const accentBlue = '#1d4ed8'; // Biru Tua
      const lineGray = '#cbd5e1';   // Garis Pemisah

      // Garis Aksen Atas
      doc.rect(0, 0, doc.page.width, 8).fill(textDark);

      // --- HEADER KOP SURAT ---
      // Logo text
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor(textDark)
         .text('XLBK', 50, 50, { continued: true })
         .fillColor(accentBlue)
         .text('.');
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(textLight)
         .text('CUSTOMWEAR & PRINTING', 50, 85);
      
      // Alamat & Kontak (Ditebalkan)
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(textGray)
         .text('Jl. Contoh Perusahaan No. 123', 50, 105)
         .text('Jakarta Selatan, 12345, Indonesia', 50, 120)
         .fillColor(textDark)
         .text('hello@xlbkcustom.com | +62 812 3456 7890', 50, 135);

      // --- JUDUL INVOICE (Kanan Atas) ---
      doc.fontSize(32)
         .font('Helvetica-Bold')
         .fillColor(textDark)
         .text('INVOICE', 0, 50, { align: 'right', width: doc.page.width - 50 });
      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor(textDark)
         .text(`#${order.invoiceNumber}`, 0, 85, { align: 'right', width: doc.page.width - 50 });

      // Tanggal & Status
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(textLight)
         .text('TANGGAL TERBIT', 0, 115, { align: 'right', width: doc.page.width - 50 });
      
      doc.font('Helvetica-Bold')
         .fillColor(textDark)
         .text(new Date(order.createdAt).toLocaleDateString('id-ID'), 0, 130, { align: 'right', width: doc.page.width - 50 });

      // --- GARIS PEMISAH ---
      doc.moveTo(50, 170)
         .lineTo(doc.page.width - 50, 170)
         .lineWidth(1.5) // Garis lebih tebal
         .stroke(lineGray);

      // --- INFO PELANGGAN & PEMBAYARAN ---
      const isPaid = order.paymentStatus === 'PAID' || order.paymentStatus === 'VERIFIED';
      
      // Kolom Kiri: Pelanggan
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(textLight)
         .text('DITAGIHKAN KEPADA:', 50, 190);
      
      doc.fontSize(13)
         .font('Helvetica-Bold')
         .fillColor(textDark)
         .text(order.customerName, 50, 205);
      
      // Info kontak dibold
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(textGray)
         .text(order.customerEmail, 50, 225)
         .text(order.customerPhone, 50, 240);
      
      if (order.address) {
        doc.text(order.address, 50, 255, { width: 250, lineGap: 3 });
      }

      // Kolom Kanan: Pembayaran
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(textLight)
         .text('STATUS PEMBAYARAN:', doc.page.width / 2 + 50, 190);
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(isPaid ? '#059669' : '#dc2626') // Hijau gelap / Merah gelap
         .text(isPaid ? 'LUNAS' : 'BELUM DIBAYAR', doc.page.width / 2 + 50, 205);
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(textGray)
         .text(`Metode: ${order.paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' : order.paymentMethod}`, doc.page.width / 2 + 50, 225)
         .text(`Status Pesanan: ${order.status}`, doc.page.width / 2 + 50, 240);
      
      if (order.paidAt) {
        doc.text(`Tgl Bayar: ${new Date(order.paidAt).toLocaleDateString('id-ID')}`, doc.page.width / 2 + 50, 255);
      }

      // --- TABEL ITEM PESANAN ---
      let yPos = 320;
      
      // Header Tabel 
      doc.rect(50, yPos, doc.page.width - 100, 25).fill('#f1f5f9'); // Background abu-abu agar header menonjol
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(textDark)
         .text('DESKRIPSI ITEM', 60, yPos + 8)
         .text('QTY', 300, yPos + 8, { align: 'center', width: 40 })
         .text('HARGA', 360, yPos + 8, { align: 'right', width: 80 })
         .text('SUBTOTAL', 460, yPos + 8, { align: 'right', width: 80 });

      yPos += 35;

      // Isi Tabel (Semua di-Bold)
      order.items.forEach((item) => {
        // Nama Produk
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(textDark)
           .text(item.product.name.substring(0, 45), 60, yPos);
        
        // Notes Item
        if (item.notes) {
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor(textLight)
             .text(`Catatan: ${item.notes}`, 60, yPos + 15, { width: 230 });
        }

        // Qty, Harga, Subtotal
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(textDark)
           .text(item.quantity.toString(), 300, yPos, { align: 'center', width: 40 })
           .text(`Rp ${item.price.toLocaleString('id-ID')}`, 360, yPos, { align: 'right', width: 80 })
           .text(`Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`, 460, yPos, { align: 'right', width: 80 });
        
        yPos += 35; // Spasi antar baris diperlebar
      });

      // Garis Bawah Tabel
      yPos += 10;
      doc.moveTo(50, yPos)
         .lineTo(doc.page.width - 50, yPos)
         .lineWidth(1.5) // Garis ditebalkan
         .stroke(lineGray);

      // --- KALKULASI TOTAL ---
      yPos += 20;
      const calcYPosStart = yPos; 

      // Kolom Kiri: Catatan Pesanan & Link Desain
      if (order.notes) {
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(textDark)
           .text('CATATAN PESANAN', 50, yPos);
        doc.fontSize(10)
           .font('Helvetica-Bold') // Ditebalkan
           .fillColor(textGray)
           .text(`"${order.notes}"`, 50, yPos + 15, { width: 250, lineGap: 2 });
        yPos += 40;
      }

      if (order.designFile) {
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(textDark)
           .text('LAMPIRAN DESAIN', 50, yPos);
        doc.fontSize(10)
           .font('Helvetica-Bold') // Ditebalkan
           .fillColor(accentBlue)
           .text('Tautan File Desain Tersedia', 50, yPos + 15, { link: order.designFile, underline: true });
      }

      // Kolom Kanan: Rincian Angka 
      yPos = calcYPosStart;
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(textDark)
         .text('Subtotal', 360, yPos, { align: 'left', width: 80 })
         .text(`Rp ${order.subtotal?.toLocaleString('id-ID')}`, 460, yPos, { align: 'right', width: 80 });

      yPos += 20;
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(textDark)
         .text('Biaya Pengiriman', 360, yPos, { align: 'left', width: 110 })
         .text(`Rp ${order.shippingFee?.toLocaleString('id-ID') || 0}`, 460, yPos, { align: 'right', width: 80 });

      yPos += 20;
      
      // Kotak Total Akhir
      doc.rect(340, yPos, doc.page.width - 390, 35).fill('#f1f5f9');
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(textDark)
         .text('TOTAL AKHIR', 350, yPos + 12, { align: 'left', width: 100 })
         .fontSize(14)
         .text(`Rp ${order.total?.toLocaleString('id-ID')}`, 440, yPos + 10, { align: 'right', width: 100 });

      // --- FOOTER ---
      const footerY = doc.page.height - 80;
      
      doc.moveTo(50, footerY - 20)
         .lineTo(doc.page.width - 50, footerY - 20)
         .lineWidth(1.5)
         .stroke(lineGray);
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(textDark)
         .text('Terima kasih atas kepercayaan Anda.', 50, footerY, { align: 'center' });
      
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor(textLight)
         .text('Invoice ini sah dan diproses oleh sistem komputer, tidak memerlukan tanda tangan basah.', 50, footerY + 15, { align: 'center' });

      doc.end()
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=INVOICE-XLBK-${order.invoiceNumber}.pdf`
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