import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js'

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { orderId } = resolvedParams;
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } }
      }
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'portrait' })
      
      const chunks = []
      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', err => reject(err))

      const textDark = '#000000';   
      const textGray = '#333333';   
      const textLight = '#555555';  
      const accentBlue = '#1d4ed8'; 
      const lineGray = '#cbd5e1';   
      const greenSuccess = '#059669'; // Hijau Sukses

      doc.rect(0, 0, doc.page.width, 8).fill(textDark);

      // --- HEADER KOP SURAT ---
      doc.fontSize(28).font('Helvetica-Bold').fillColor(textDark)
         .text('XLBK', 50, 50, { continued: true })
         .fillColor(textLight).text('.');
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor(textLight)
         .text('CUSTOMWEAR & PRINTING', 50, 85);
      
      doc.fontSize(9).font('Helvetica-Bold').fillColor(textGray)
         .text('Jl. Albasia 3 Perum Papan Indah No 29 Rt 09/RW 09', 50, 105)
         .text('Mangunjaya, Tambun Selatan, Kab. Bekasi, Jawa Barat', 50, 120)
         .fillColor(textDark)
         .text('+6281283433771 | xlbk.customwear@gmail.com', 50, 135);

      // --- JUDUL INVOICE ---
      doc.fontSize(32).font('Helvetica-Bold').fillColor(textDark)
         .text('INVOICE', 0, 50, { align: 'right', width: doc.page.width - 50 });
      
      doc.fontSize(16).font('Helvetica-Bold').fillColor(textDark)
         .text(`#${order.invoiceNumber}`, 0, 85, { align: 'right', width: doc.page.width - 50 });

      doc.fontSize(10).font('Helvetica-Bold').fillColor(textLight)
         .text('TANGGAL TERBIT', 0, 115, { align: 'right', width: doc.page.width - 50 });
      
      doc.font('Helvetica-Bold').fillColor(textDark)
         .text(new Date(order.createdAt).toLocaleDateString('id-ID'), 0, 130, { align: 'right', width: doc.page.width - 50 });

      doc.moveTo(50, 170).lineTo(doc.page.width - 50, 170).lineWidth(1.5).stroke(lineGray);

      // --- STEMPEL ---
      let stampText = 'BELUM DIBAYAR';
      let stampColor = '#dc2626';

      if (order.paymentStatus === 'PAID') {
        stampText = 'LUNAS';
        stampColor = '#059669'; 
      } else if (order.paymentType === 'DP' && order.paymentStatus === 'VERIFIED') {
        stampText = 'DP DIBAYAR (50%)';
        stampColor = '#1d4ed8'; 
      }
      
      // INFO PELANGGAN
      doc.fontSize(10).font('Helvetica-Bold').fillColor(textLight).text('DITAGIHKAN KEPADA:', 50, 190);
      doc.fontSize(13).font('Helvetica-Bold').fillColor(textDark).text(order.customerName, 50, 205);
      doc.fontSize(11).font('Helvetica-Bold').fillColor(textGray)
         .text(order.customerEmail, 50, 225)
         .text(order.customerPhone, 50, 240);
      if (order.address) doc.text(order.address, 50, 255, { width: 250, lineGap: 3 });

      // INFO PEMBAYARAN
      doc.fontSize(10).font('Helvetica-Bold').fillColor(textLight).text('STATUS PEMBAYARAN:', doc.page.width / 2 + 50, 190);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(stampColor).text(stampText, doc.page.width / 2 + 50, 205);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(textGray)
         .text(`Sistem: ${order.paymentType === 'DP' ? 'Uang Muka (DP 50%)' : 'Pembayaran Penuh'}`, doc.page.width / 2 + 50, 225)
         .text(`Metode: ${order.paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' : order.paymentMethod}`, doc.page.width / 2 + 50, 240);

      // --- TABEL ---
      let yPos = 300;
      
      doc.rect(50, yPos, doc.page.width - 100, 25).fill('#f1f5f9');
      doc.fontSize(10).font('Helvetica-Bold').fillColor(textDark)
         .text('DESKRIPSI ITEM', 60, yPos + 8)
         .text('QTY', 300, yPos + 8, { align: 'center', width: 40 })
         .text('HARGA', 360, yPos + 8, { align: 'right', width: 80 })
         .text('SUBTOTAL', 460, yPos + 8, { align: 'right', width: 80 });

      yPos += 35;

      order.items.forEach((item) => {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(textDark)
           .text(item.product.name.substring(0, 45), 60, yPos);
        if (item.notes) {
          doc.fontSize(9).font('Helvetica-Bold').fillColor(textLight)
             .text(`Catatan: ${item.notes}`, 60, yPos + 15, { width: 230 });
        }
        doc.fontSize(11).font('Helvetica-Bold').fillColor(textDark)
           .text(item.quantity.toString(), 300, yPos, { align: 'center', width: 40 })
           .text(`Rp ${item.price.toLocaleString('id-ID')}`, 360, yPos, { align: 'right', width: 80 })
           .text(`Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`, 460, yPos, { align: 'right', width: 80 });
        yPos += 35; 
      });

      yPos += 10;
      doc.moveTo(50, yPos).lineTo(doc.page.width - 50, yPos).lineWidth(1.5).stroke(lineGray);

      // --- KALKULASI BERSIH ---
      yPos += 20;
      const calcYPosStart = yPos; 

      if (order.notes) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor(textDark).text('CATATAN PESANAN', 50, yPos);
        doc.fontSize(10).font('Helvetica-Bold').fillColor(textGray).text(`"${order.notes}"`, 50, yPos + 15, { width: 250, lineGap: 2 });
      }

      yPos = calcYPosStart;
      
      const isDP = order.paymentType === 'DP';
      const totalBiaya = order.total || 0;
      const uangMuka = isDP ? totalBiaya / 2 : totalBiaya;

      // Subtotal & Ongkir
      doc.fontSize(10).font('Helvetica-Bold').fillColor(textDark)
         .text('Subtotal Barang', 310, yPos, { align: 'left', width: 130 })
         .text(`Rp ${order.subtotal?.toLocaleString('id-ID')}`, 440, yPos, { align: 'right', width: 100 });
      yPos += 18;

      if (order.shippingFee > 0) {
        doc.text('Biaya Pengiriman', 310, yPos, { align: 'left', width: 130 })
           .text(`Rp ${order.shippingFee?.toLocaleString('id-ID')}`, 440, yPos, { align: 'right', width: 100 });
        yPos += 18;
      }

      doc.moveTo(310, yPos - 5).lineTo(540, yPos - 5).lineWidth(1).stroke(lineGray);
      
      // Total Keseluruhan
      doc.fontSize(12).fillColor(textDark)
         .text('Total Keseluruhan', 310, yPos, { align: 'left', width: 130 })
         .text(`Rp ${totalBiaya.toLocaleString('id-ID')}`, 440, yPos, { align: 'right', width: 100 });
      yPos += 30;

      // 🟢 REVISI PENTING: Pembagian Termin yang Informatif dengan Teks Diperbesar
      doc.fontSize(10).font('Helvetica-Bold').fillColor(textDark)
         .text('RINCIAN TERMIN PEMBAYARAN:', 310, yPos, { align: 'left', width: 200 });
      yPos += 18;

      if (isDP) {
        // --- Termin 1: DP ---
        let dpStatus = 'Belum Dibayar';
        let dpColor = textLight;
        
        if (order.paymentStatus === 'VERIFIED' || order.paymentStatus === 'PAID') {
          // Gunakan updatedAt sebagai tgl DP jika masih VERIFIED, atau createdAt jika tidak valid
          const dpDate = order.paymentStatus === 'VERIFIED' ? order.updatedAt : order.createdAt;
          dpStatus = `Telah Dibayar (Tgl: ${new Date(dpDate).toLocaleDateString('id-ID')})`;
          dpColor = greenSuccess;
        }

        doc.fontSize(11).font('Helvetica-Bold').fillColor(textDark)
           .text('Uang Muka (DP 50%)', 310, yPos, { align: 'left', width: 130 })
           .text(`Rp ${uangMuka.toLocaleString('id-ID')}`, 440, yPos, { align: 'right', width: 100 });
        yPos += 14;
        
        // Tulisan Status Dibesarkan dan Diberi Warna
        doc.fontSize(9.5).font('Helvetica-Oblique').fillColor(dpColor)
           .text(`(${dpStatus})`, 310, yPos, { align: 'left', width: 200 });
        yPos += 22;

        // --- Termin 2: Pelunasan ---
        let pelunasanStatus = 'Belum Dibayar';
        let pelunasanColor = textLight;

        if (order.paymentStatus === 'PAID' && order.paidAt) {
          pelunasanStatus = `Lunas (Tgl: ${new Date(order.paidAt).toLocaleDateString('id-ID')})`;
          pelunasanColor = greenSuccess;
        }

        doc.fontSize(11).font('Helvetica-Bold').fillColor(textDark)
           .text('Pelunasan (50%)', 310, yPos, { align: 'left', width: 130 })
           .text(`Rp ${(totalBiaya - uangMuka).toLocaleString('id-ID')}`, 440, yPos, { align: 'right', width: 100 });
        yPos += 14;
        
        // Tulisan Status Dibesarkan dan Diberi Warna
        doc.fontSize(9.5).font('Helvetica-Oblique').fillColor(pelunasanColor)
           .text(`(${pelunasanStatus})`, 310, yPos, { align: 'left', width: 200 });

      } else {
        // --- Pembayaran Penuh ---
        let fullStatus = 'Belum Dibayar';
        let fullColor = textLight;

        if (order.paymentStatus === 'PAID' && order.paidAt) {
          fullStatus = `Lunas (Tgl: ${new Date(order.paidAt).toLocaleDateString('id-ID')})`;
          fullColor = greenSuccess;
        }

        doc.fontSize(11).font('Helvetica-Bold').fillColor(textDark)
           .text('Pembayaran Penuh', 310, yPos, { align: 'left', width: 130 })
           .text(`Rp ${totalBiaya.toLocaleString('id-ID')}`, 440, yPos, { align: 'right', width: 100 });
        yPos += 14;
        
        // Tulisan Status Dibesarkan dan Diberi Warna
        doc.fontSize(9.5).font('Helvetica-Oblique').fillColor(fullColor)
           .text(`(${fullStatus})`, 310, yPos, { align: 'left', width: 200 });
      }

      // --- FOOTER ---
      const footerY = doc.page.height - 80;
      
      doc.moveTo(50, footerY - 20).lineTo(doc.page.width - 50, footerY - 20).lineWidth(1.5).stroke(lineGray);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(textDark)
         .text('Terima kasih atas pesanan Anda.', 50, footerY, { align: 'center' });
      doc.fontSize(9).font('Helvetica-Bold').fillColor(textLight)
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
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}