'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon
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
      setOrder(data.order || data) 
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
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // LOGIKA STEMPEL KORPORAT
  const getCorporateStamp = (status, paymentType) => {
    if (status === 'PAID') {
      return (
        <div className="inline-block border-4 border-emerald-700 text-emerald-700 px-5 py-2 text-2xl font-black uppercase tracking-[0.2em] transform -rotate-6 opacity-90 rounded">
          LUNAS
        </div>
      )
    }
    
    if (paymentType === 'DP' && status === 'VERIFIED') {
      return (
        <div className="inline-block border-4 border-blue-700 text-blue-700 px-5 py-2 text-xl font-black uppercase tracking-[0.1em] transform -rotate-6 opacity-90 rounded">
          DP DITERIMA (50%)
        </div>
      )
    }

    return (
      <div className="inline-block border-4 border-rose-700 text-rose-700 px-5 py-2 text-xl font-black uppercase tracking-[0.1em] transform -rotate-6 opacity-90 rounded">
        BELUM DIBAYAR
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white p-10 rounded-lg shadow border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Dokumen Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">Invoice yang Anda cari tidak tersedia.</p>
          <button onClick={() => router.push('/')} className="bg-slate-900 text-white px-6 py-2.5 rounded font-medium hover:bg-slate-800 transition-colors">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  // 🟢 LOGIKA CERDAS: KALKULASI UANG MASUK & SISA TAGIHAN
  const isDP = order.paymentType === 'DP';
  const totalBiaya = order.total || 0;
  const uangMuka = isDP ? totalBiaya / 2 : totalBiaya;
  
  let totalPembayaranMasuk = 0;
  if (order.paymentStatus === 'PAID') {
    totalPembayaranMasuk = totalBiaya;
  } else if (order.paymentStatus === 'VERIFIED' && isDP) {
    totalPembayaranMasuk = uangMuka;
  }
  
  const sisaTagihan = totalBiaya - totalPembayaranMasuk;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 print:bg-transparent print:py-0 print:px-0 flex flex-col items-center">
      
      {/* --- CONTROL BAR --- */}
      <div className="w-full max-w-[850px] flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 transition-all w-full sm:w-auto justify-center"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Kembali
        </button>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={printInvoice}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 transition-all"
          >
            <PrinterIcon className="h-4 w-4" /> Cetak
          </button>
          <button
            onClick={downloadPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded shadow hover:bg-slate-800 transition-all"
          >
            <DocumentArrowDownIcon className="h-4 w-4" /> Unduh PDF
          </button>
        </div>
      </div>

      {/* --- KERTAS INVOICE UTAMA --- */}
      <div 
        ref={invoiceRef} 
        className="w-full max-w-[850px] min-h-[1100px] bg-white shadow-2xl print:shadow-none print:w-full relative mx-auto"
      >
        {/* Garis Aksen Kop Surat */}
        <div className="h-3 w-full bg-slate-900"></div>

        <div className="p-12 sm:p-16">
          
          {/* HEADER: KOP SURAT */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
            <div className="flex-1">
              <div className="text-4xl font-black tracking-tighter text-slate-900 mb-1">
                XLBK<span className="text-slate-400">.</span>
              </div>
              <p className="text-[11px] font-bold tracking-[0.25em] text-slate-500 uppercase mb-4">Customwear & Printing</p>
              
              <div className="text-sm text-slate-600 leading-relaxed font-medium">
                <p>Jl. Albasia 3 Perum Papan Indah No. 29</p>
                <p>RT 09/RW 09, Mangunjaya, Tambun Selatan</p>
                <p>Kab. Bekasi, Jawa Barat</p>
                <p className="mt-2 text-slate-900">+62 812 8343 3771 &nbsp;|&nbsp; xlbk.customwear@gmail.com</p>
              </div>
            </div>

            <div className="md:text-right flex flex-col md:items-end">
              <h1 className="text-5xl font-light tracking-widest text-slate-300 uppercase mb-2">Invoice</h1>
              <p className="text-xl font-semibold text-slate-900 tracking-tight mb-8">#{order.invoiceNumber}</p>
              
              <table className="text-sm text-left md:text-right">
                <tbody>
                  <tr>
                    <td className="text-slate-500 pr-6 py-1 font-medium">Tanggal Terbit</td>
                    <td className="font-bold text-slate-900">{formatDate(order.createdAt)}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 pr-6 py-1 font-medium">Jatuh Tempo</td>
                    <td className="font-bold text-slate-900">
                      {order.payment?.expiresAt ? formatDate(order.payment.expiresAt) : 'Saat Diterima'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t-2 border-slate-900 mb-12"></div>

          {/* INFO TAGIHAN & STEMPEL */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12 relative">
            
            <div className="absolute right-0 md:right-10 top-10 md:-top-5 z-0 pointer-events-none opacity-90 print:opacity-100 mix-blend-multiply">
               {getCorporateStamp(order.paymentStatus, order.paymentType)}
            </div>

            <div className="flex-1 relative z-10">
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Ditagihkan Kepada:</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{order.customerName}</h3>
              <div className="text-sm text-slate-600 font-medium leading-relaxed">
                <p>{order.customerEmail}</p>
                <p>{order.customerPhone}</p>
                {order.address && <p className="mt-2 max-w-sm text-slate-500">{order.address}</p>}
              </div>
            </div>

            <div className="flex-1 md:text-right relative z-10 mt-6 md:mt-0">
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Informasi Pembayaran:</p>
              <div className="text-sm text-slate-600 font-medium space-y-1">
                <p>Metode: <span className="font-bold text-slate-900">{order.paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' : order.paymentMethod}</span></p>
                <p>Sistem: <span className="font-bold text-slate-900">{isDP ? 'Uang Muka (DP 50%)' : 'Pembayaran Penuh'}</span></p>
              </div>
            </div>
          </div>

          {/* TABEL RINCIAN BIAYA */}
          <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-y-2 border-slate-900 bg-slate-50/50">
                  <th className="py-4 px-6 font-bold text-slate-900 uppercase tracking-wider text-xs">Deskripsi Item</th>
                  <th className="py-4 px-6 font-bold text-slate-900 uppercase tracking-wider text-xs text-center w-24">Qty</th>
                  <th className="py-4 px-6 font-bold text-slate-900 uppercase tracking-wider text-xs text-right w-36">Harga Satuan</th>
                  <th className="py-4 px-6 font-bold text-slate-900 uppercase tracking-wider text-xs text-right w-40">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items?.map((item, index) => (
                  <tr key={index} className="text-slate-700 bg-white">
                    <td className="py-5 px-6">
                      <p className="font-bold text-slate-900 text-base">{item.product.name}</p>
                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">Note: {item.notes}</p>
                      )}
                    </td>
                    <td className="py-5 px-6 text-center font-medium bg-slate-50/50">{item.quantity}</td>
                    <td className="py-5 px-6 text-right text-slate-500">
                      {item.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-5 px-6 text-right font-bold text-slate-900 bg-slate-50/50">
                      {(item.price * item.quantity).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* KALKULASI TOTAL */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            
            <div className="w-full md:w-1/2 space-y-8">
              {order.notes && (
                <div>
                  <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Catatan Tambahan</p>
                  <p className="text-sm text-slate-600 italic leading-relaxed border-l-4 border-slate-200 pl-4 py-1">
                    "{order.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* 🟢 REVISI: RINCIAN TAGIHAN & RIWAYAT PEMBAYARAN */}
            <div className="w-full md:w-5/12 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal Barang</span>
                  <span className="font-semibold text-slate-900">Rp {order.subtotal?.toLocaleString('id-ID')}</span>
                </div>
                
                {order.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span>Biaya Pengiriman</span>
                    <span className="font-semibold text-slate-900">Rp {order.shippingFee.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="flex justify-between pt-3 mt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Total Keseluruhan</span>
                  <span className="font-bold text-slate-900">Rp {totalBiaya.toLocaleString('id-ID')}</span>
                </div>

                {/* RIWAYAT TRANSAKSI (DP & PELUNASAN) */}
                <div className="pt-3 mt-3 border-t border-slate-200 space-y-3">
                  {isDP ? (
                    <>
                      <div className="flex justify-between items-start text-blue-700">
                        <div>
                          <span className="block font-medium">Uang Muka (DP 50%)</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                            {totalPembayaranMasuk >= uangMuka ? 'Telah Dibayar' : 'Belum Dibayar'}
                          </span>
                        </div>
                        <span className="font-bold">
                          {totalPembayaranMasuk >= uangMuka ? '-' : ''} Rp {uangMuka.toLocaleString('id-ID')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-start text-emerald-700">
                        <div>
                          <span className="block font-medium">Pelunasan (50%)</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                            {order.paymentStatus === 'PAID' && order.paidAt ? `Lunas: ${formatDate(order.paidAt)}` : 'Belum Dibayar'}
                          </span>
                        </div>
                        <span className="font-bold">
                          {order.paymentStatus === 'PAID' ? '-' : ''} Rp {(totalBiaya - uangMuka).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-start text-emerald-700">
                      <div>
                        <span className="block font-medium">Pembayaran Penuh</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                          {order.paymentStatus === 'PAID' && order.paidAt ? `Lunas: ${formatDate(order.paidAt)}` : 'Belum Dibayar'}
                        </span>
                      </div>
                      <span className="font-bold">
                        {order.paymentStatus === 'PAID' ? '-' : ''} Rp {totalBiaya.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* TOTAL PEMBAYARAN MASUK & SISA TAGIHAN */}
              <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Pembayaran Masuk</span>
                <span className="text-sm font-black text-slate-900">Rp {totalPembayaranMasuk.toLocaleString('id-ID')}</span>
              </div>
              
              <div className={`p-5 flex justify-between items-end ${
                sisaTagihan === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
              } print:border-t print:border-slate-900 print:-webkit-print-color-adjust-exact`}>
                <span className="font-bold uppercase tracking-widest text-xs opacity-90 pb-1">
                  Sisa Tagihan
                </span>
                <span className="text-2xl font-black tracking-tight">
                  Rp {sisaTagihan.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-24 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-semibold text-slate-800">
              Terima kasih atas pesanan Anda.
            </p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider text-center md:text-right">
              Dokumen ini diterbitkan oleh sistem komputer<br className="hidden md:block"/> dan sah tanpa tanda tangan.
            </p>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 0.5cm; }
          body { background-color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .bg-slate-900 { background-color: #0f172a !important; color: white !important; }
          .border-slate-900 { border-color: #0f172a !important; }
          .mix-blend-multiply { mix-blend-mode: multiply !important; }
        }
      `}</style>
    </div>
  )
}