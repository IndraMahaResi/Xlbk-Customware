'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const invoiceRef = useRef(null)

  useEffect(() => {
    if (params.orderId) {
      fetchOrder()
    }
  }, [params.orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.orderId}`)
      const data = await res.json()
      setOrder(data)
    } catch (error) {
      console.error('Failed to fetch order:', error)
      toast.error('Gagal memuat invoice')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    try {
      toast.loading('Menyiapkan dokumen...', { id: 'pdf-dl' })
      const res = await fetch(`/api/orders/${params.orderId}/invoice`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `INVOICE-${order?.invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Invoice berhasil diunduh', { id: 'pdf-dl' })
    } catch (error) {
      toast.error('Gagal mengunduh invoice', { id: 'pdf-dl' })
    }
  }

  const printInvoice = () => {
    window.print()
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusStamp = (status) => {
    const isPaid = status === 'PAID' || status === 'VERIFIED'
    if (isPaid) {
      return (
        <div className="inline-block border-2 border-emerald-600 text-emerald-600 px-4 py-1.5 rounded-sm text-sm font-black uppercase tracking-widest transform -rotate-2">
          LUNAS
        </div>
      )
    }
    return (
      <div className="inline-block border-2 border-rose-500 text-rose-500 px-4 py-1.5 rounded-sm text-sm font-black uppercase tracking-widest transform -rotate-2">
        BELUM DIBAYAR
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
          <p className="text-slate-500 font-medium tracking-wide">Membuka dokumen...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white p-10 rounded-xl shadow-sm border border-slate-200">
          <DocumentTextIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Dokumen Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-8">Invoice yang Anda cari mungkin telah dihapus atau ID tidak valid.</p>
          <button
            onClick={() => router.push('/products')}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto">
        
        {/* --- CONTROL BAR (Sembunyi saat dicetak) --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 print:hidden">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all w-full sm:w-auto justify-center"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Kembali
          </button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={printInvoice}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
            >
              <PrinterIcon className="h-4 w-4" /> Cetak Dokumen
            </button>
            <button
              onClick={downloadPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg shadow-md hover:bg-slate-800 transition-all"
            >
              <DocumentArrowDownIcon className="h-4 w-4" /> Unduh PDF
            </button>
          </div>
        </div>

        {/* --- KERTAS INVOICE UTAMA --- */}
        <div 
          ref={invoiceRef} 
          className="bg-white shadow-2xl print:shadow-none print:border-none border border-slate-200 relative overflow-hidden"
        >
          {/* Aksen warna minimalis di atas */}
          <div className="h-2 w-full bg-slate-900 print:bg-black"></div>

          {/* Watermark Logo (Opsional, sangat transparan di background) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[200px] font-black text-slate-50 opacity-50 pointer-events-none select-none z-0 print:opacity-30">
            X
          </div>

          <div className="p-10 sm:p-16 relative z-10">
            
            {/* HEADER: KOP SURAT */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
              <div className="flex-1">
                <div className="text-4xl font-black tracking-tighter text-slate-900 mb-1">
                  XLBK<span className="text-blue-600">.</span>
                </div>
                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Customwear & Printing</p>
                <div className="text-sm text-slate-600 leading-relaxed space-y-1">
                  <p>Jl. Contoh Perusahaan No. 123</p>
                  <p>Jakarta Selatan, 12345, Indonesia</p>
                  <p className="mt-2 text-slate-800 font-medium">hello@xlbkcustom.com | +62 812 3456 7890</p>
                </div>
              </div>

              <div className="md:text-right flex flex-col md:items-end">
                <h1 className="text-5xl font-light tracking-widest text-slate-300 uppercase mb-2">Invoice</h1>
                <p className="text-lg font-bold text-slate-900 font-mono tracking-tight mb-6">#{order.invoiceNumber}</p>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-left md:text-right">
                  <div className="text-slate-500">Tanggal Terbit:</div>
                  <div className="font-semibold text-slate-900">{formatDate(order.createdAt)}</div>
                  
                  <div className="text-slate-500">Jatuh Tempo:</div>
                  <div className="font-semibold text-slate-900">
                    {order.payment?.expiresAt ? formatDate(order.payment.expiresAt) : 'Saat Diterima'}
                  </div>
                </div>
              </div>
            </div>

            {/* SEPARATOR */}
            <div className="border-t-2 border-slate-100 mb-10"></div>

            {/* INFO PELANGGAN & STATUS */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
              <div className="flex-1">
                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Ditagihkan Kepada:</p>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{order.customerName}</h3>
                <div className="text-sm text-slate-600 leading-relaxed space-y-1">
                  <p>{order.customerEmail}</p>
                  <p>{order.customerPhone}</p>
                  {order.address && <p className="pt-2 max-w-sm">{order.address}</p>}
                </div>
              </div>

              <div className="flex-1 md:text-right">
                <div className="mb-4">
                  {getStatusStamp(order.paymentStatus)}
                </div>
                <div className="text-sm">
                  <p className="text-slate-500 mb-1">Metode Pembayaran:</p>
                  <p className="font-bold text-slate-900">
                    {order.paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' : order.paymentMethod}
                  </p>
                  {order.paidAt && (
                    <p className="text-slate-500 mt-2 text-xs">
                      Telah dibayar pada {formatDate(order.paidAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* TABEL RINCIAN BIAYA */}
            <div className="mb-10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-900">
                    <th className="py-3 px-2 font-bold uppercase tracking-wider text-xs">Deskripsi</th>
                    <th className="py-3 px-2 font-bold uppercase tracking-wider text-xs text-center w-24">Qty</th>
                    <th className="py-3 px-2 font-bold uppercase tracking-wider text-xs text-right w-36">Harga Satuan</th>
                    <th className="py-3 px-2 font-bold uppercase tracking-wider text-xs text-right w-40">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items?.map((item, index) => (
                    <tr key={index} className="text-slate-700">
                      <td className="py-4 px-2">
                        <p className="font-bold text-slate-900">{item.product.name}</p>
                        {item.notes && (
                          <p className="text-xs text-slate-500 mt-1">Note: {item.notes}</p>
                        )}
                      </td>
                      <td className="py-4 px-2 text-center">{item.quantity}</td>
                      <td className="py-4 px-2 text-right text-slate-500">
                        Rp {item.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-2 text-right font-semibold text-slate-900">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* KALKULASI TOTAL */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-10">
              
              {/* Kolom Kiri: Catatan Tambahan & Lampiran */}
              <div className="w-full md:w-1/2 space-y-6">
                {order.notes && (
                  <div>
                    <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Catatan Pesanan</p>
                    <p className="text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3 py-1">
                      "{order.notes}"
                    </p>
                  </div>
                )}

                {order.designFile && (
                  <div className="print:hidden">
                    <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Lampiran File Desain</p>
                    <a 
                      href={order.designFile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded transition-colors"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-500" /> Buka Desain
                    </a>
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Rincian Angka */}
              <div className="w-full md:w-1/3 min-w-[280px]">
                <div className="space-y-3 text-sm text-slate-600 mb-4 px-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">Rp {order.subtotal?.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Pengiriman</span>
                    <span className="font-semibold text-slate-900">Rp {order.shippingFee?.toLocaleString('id-ID') || 0}</span>
                  </div>
                </div>
                
                <div className="border-t-2 border-slate-900 pt-4 px-2 flex justify-between items-center bg-slate-50 rounded-b-lg">
                  <span className="font-bold text-slate-900 uppercase tracking-widest text-xs">Total Tagihan</span>
                  <span className="text-2xl font-black text-slate-900">
                    Rp {order.total?.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-20 pt-8 border-t border-slate-200 text-center">
              <p className="text-sm font-bold text-slate-800 mb-1">Terima kasih atas kepercayaan Anda.</p>
              <p className="text-xs text-slate-500">
                Invoice ini sah dan diproses oleh sistem komputer, tidak memerlukan tanda tangan basah.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* --- CSS KHUSUS CETAK --- */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0; /* Menghilangkan header/footer default browser */
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
            margin: 0;
            padding: 0;
          }
          /* Pengaturan margin internal khusus untuk kertas */
          .print\\:px-0 {
            padding: 0 !important;
          }
          .print\\:py-0 {
            padding: 0 !important;
          }
          /* Pastikan warna teks tajam saat dicetak */
          .text-slate-900 { color: #0f172a !important; }
          .text-slate-600 { color: #475569 !important; }
          .text-slate-400 { color: #94a3b8 !important; }
          .border-slate-900 { border-color: #0f172a !important; }
        }
      `}</style>
    </div>
  )
}