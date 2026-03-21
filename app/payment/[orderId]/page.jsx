'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import {
  DocumentArrowDownIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  BanknotesIcon,
  ArrowPathIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (params.orderId) {
      fetchOrderData()
    }
  }, [params.orderId])

  useEffect(() => {
    if (payment?.expiresAt) {
      const expireTime = new Date(payment.expiresAt).getTime()
      const timer = setInterval(() => {
        const now = new Date().getTime()
        const distance = expireTime - now
        
        if (distance < 0) {
          clearInterval(timer)
          setCountdown(0)
          toast.error('Waktu pembayaran telah kadaluarsa')
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)
          setCountdown({ hours, minutes, seconds })
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [payment])

  const fetchOrderData = async () => {
    try {
      const res = await fetch(`/api/orders/${params.orderId}`)
      const data = await res.json()
      // Fallback object order
      setOrder(data.order || data)
      
      const paymentRes = await fetch(`/api/payments/${params.orderId}`)
      if (paymentRes.ok) {
        const paymentData = await paymentRes.json()
        setPayment(paymentData.payment || paymentData)
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
      toast.error('Gagal memuat data pesanan')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentProof = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const uploadData = await uploadRes.json()
      
      const proofRes = await fetch(`/api/payments/${params.orderId}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofUrl: uploadData.url })
      })
      
      if (proofRes.ok) {
        toast.success('Bukti pembayaran berhasil diunggah! 🎉')
        fetchOrderData()
      } else {
        toast.error('Gagal memvalidasi bukti pembayaran')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengunggah file')
    } finally {
      setUploading(false)
    }
  }

  const generateInvoice = async () => {
    try {
      const res = await fetch(`/api/orders/${params.orderId}/invoice`, {
        method: 'GET'
      })
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice_XLBK_${order?.invoiceNumber || params.orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Invoice berhasil diunduh')
    } catch (error) {
      toast.error('Gagal mengunduh invoice')
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} berhasil disalin!`)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-20 min-h-screen flex flex-col items-center justify-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-400 font-medium animate-pulse">Menyiapkan gerbang pembayaran...</p>
        </div>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="pt-20 min-h-screen flex items-center justify-center relative z-10 px-6">
          <div className="text-center bg-slate-900/60 border border-slate-700 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-md w-full">
            <XCircleIcon className="w-20 h-20 text-rose-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-slate-100">Pesanan Tidak Ditemukan</h2>
            <p className="text-slate-400 mb-8">Maaf, kami tidak dapat menemukan data pesanan untuk ID tersebut.</p>
            <button onClick={() => router.push('/products')} className="bg-blue-600 text-white w-full py-3 rounded-xl font-bold hover:bg-blue-500 shadow-glow transition-all">
              Kembali Belanja
            </button>
          </div>
        </div>
      </>
    )
  }

  // 🔥 SOLUSI UTAMA TUNTAS:
  // Kita BACA dari payment?.method DULU, baru order?.paymentMethod. Ini fix masalah QRIS selalu muncul.
  const payMethod = payment?.method || order?.paymentMethod || 'BANK_TRANSFER'
  const grandTotal = payment?.amount || order?.total || 0
  const payStatus = payment?.status || order?.paymentStatus || 'UNPAID'
  const cryptoAmount = payment?.cryptoAmount || '0'
  
  const isPaid = payStatus === 'PAID' || payStatus === 'VERIFIED'

  return (
    <>
      <Navbar />
      
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="pt-28 pb-20 min-h-screen relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          
          {!isPaid ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              {/* Header Tagihan */}
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 mb-4 tracking-tight">Selesaikan Pembayaran</h1>
                <p className="text-slate-400 text-lg">
                  Invoice <span className="font-mono text-blue-400 font-bold">#{order?.invoiceNumber || params?.orderId?.slice(0,8).toUpperCase()}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Kolom Kiri: Instruksi & Upload */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {countdown !== 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                      <p className="text-amber-400/80 font-medium mb-2 text-sm uppercase tracking-wider">Batas Waktu Pembayaran</p>
                      <div className="flex justify-center items-center gap-3 text-3xl font-extrabold text-amber-400 font-mono tracking-widest">
                        <div className="bg-amber-500/20 px-3 py-2 rounded-lg">{countdown?.hours?.toString().padStart(2, '0') || '00'}</div>:
                        <div className="bg-amber-500/20 px-3 py-2 rounded-lg">{countdown?.minutes?.toString().padStart(2, '0') || '00'}</div>:
                        <div className="bg-amber-500/20 px-3 py-2 rounded-lg">{countdown?.seconds?.toString().padStart(2, '0') || '00'}</div>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                    
                    <h2 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-3">
                      <BanknotesIcon className="w-6 h-6 text-emerald-400" />
                      Instruksi Transfer ({payMethod})
                    </h2>
                    
                    {/* QRIS METHOD */}
                    {payMethod === 'QRIS' && (
                      <div className="text-center">
                        <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] border-4 border-slate-200">
                          <Image src="/images/qris-placeholder.png" alt="Scan QRIS XLBK" width={250} height={250} className="mx-auto rounded-lg" />
                        </div>
                        <ul className="text-left text-slate-400 space-y-3 text-sm max-w-sm mx-auto bg-slate-800/50 p-5 rounded-xl border border-slate-700">
                          <li className="flex gap-3"><span className="text-blue-400 font-bold">1.</span> Buka aplikasi M-Banking / E-Wallet.</li>
                          <li className="flex gap-3"><span className="text-blue-400 font-bold">2.</span> Scan QRIS di atas.</li>
                          <li className="flex gap-3"><span className="text-blue-400 font-bold">3.</span> Bayar sesuai nominal tagihan.</li>
                          <li className="flex gap-3"><span className="text-blue-400 font-bold">4.</span> Upload bukti sukses di menu sebelah.</li>
                        </ul>
                      </div>
                    )}

                    {/* BTC METHOD */}
                    {payMethod === 'BTC' && (
                      <div className="animate-in fade-in duration-300">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6 text-center relative group">
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">Alamat Dompet Bitcoin (BTC)</p>
                          <p className="font-mono text-sm sm:text-base text-amber-400 break-all mb-4">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
                          <button onClick={() => copyToClipboard('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'Alamat BTC')} className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-amber-500/30">
                            <DocumentDuplicateIcon className="w-4 h-4" /> Salin Alamat
                          </button>
                        </div>
                        <p className="text-slate-400 text-sm text-center bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                          Kirim tepat <strong className="text-amber-400 font-mono text-base">{cryptoAmount} BTC</strong> (Network: Bitcoin).
                        </p>
                      </div>
                    )}

                    {/* USDT METHOD */}
                    {payMethod === 'USDT' && (
                      <div className="animate-in fade-in duration-300">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6 text-center">
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">Alamat Tether (USDT - TRC20)</p>
                          <p className="font-mono text-sm sm:text-base text-emerald-400 break-all mb-4">TXLq3Yh4Kv9XqVqQZ8qVqQZ8qVqQZ8qVqQZ8qV</p>
                          <button onClick={() => copyToClipboard('TXLq3Yh4Kv9XqVqQZ8qVqQZ8qVqQZ8qVqQZ8qV', 'Alamat USDT')} className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-emerald-500/30">
                            <DocumentDuplicateIcon className="w-4 h-4" /> Salin Alamat
                          </button>
                        </div>
                        <p className="text-slate-400 text-sm text-center bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                          Kirim tepat <strong className="text-emerald-400 font-mono text-base">{cryptoAmount} USDT</strong> menggunakan jaringan TRON (TRC20).
                        </p>
                      </div>
                    )}

                    {/* BANK TRANSFER METHOD */}
                    {(payMethod === 'BANK_TRANSFER' || payMethod === 'BANK') && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-500/50 transition-colors">
                          <div>
                            <p className="font-bold text-slate-200 text-lg">Bank BCA</p>
                            <p className="text-slate-400 text-sm mt-1">a.n. PT Xlbk Customwear</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-mono text-xl font-bold text-blue-400 tracking-wider">123 456 7890</p>
                            <button onClick={() => copyToClipboard('1234567890', 'No. Rekening BCA')} className="text-slate-400 hover:text-blue-400 p-2 rounded-lg bg-slate-900 transition-colors"><DocumentDuplicateIcon className="w-5 h-5" /></button>
                          </div>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-amber-500/50 transition-colors">
                          <div>
                            <p className="font-bold text-slate-200 text-lg">Bank Mandiri</p>
                            <p className="text-slate-400 text-sm mt-1">a.n. PT Xlbk Customwear</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-mono text-xl font-bold text-amber-400 tracking-wider">098 765 4321</p>
                            <button onClick={() => copyToClipboard('0987654321', 'No. Rekening Mandiri')} className="text-slate-400 hover:text-amber-400 p-2 rounded-lg bg-slate-900 transition-colors"><DocumentDuplicateIcon className="w-5 h-5" /></button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kolom Kanan: Rincian & Upload Bukti */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Tagihan Card */}
                  <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/80 border border-blue-500/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Total Tagihan</h3>
                    <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-blue-400 mb-6">
                      Rp {Number(grandTotal).toLocaleString('id-ID')}
                    </div>
                    
                    <div className="border-t border-slate-700/50 pt-6 space-y-3">
                      {order?.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-400 truncate pr-4">{item.quantity}x {item.product?.name || 'Produk Custom'}</span>
                          <span className="text-slate-200 font-medium whitespace-nowrap">Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                      {(!order?.items || order?.items.length === 0) && (
                        <div className="text-slate-400 text-sm">Pembayaran Produk Customwear</div>
                      )}
                    </div>
                  </div>

                  {/* Upload Bukti Pembayaran */}
                  <div className="bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative">
                    <h2 className="text-lg font-bold mb-2 text-slate-100">Upload Bukti Transfer</h2>
                    <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                      Pesanan Anda baru akan diproses <strong className="text-slate-200">setelah</strong> bukti pembayaran divalidasi.
                    </p>
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handlePaymentProof}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                      />
                      <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center
                        ${uploading ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-800/50 hover:border-blue-400 hover:bg-slate-800'}
                      `}>
                        {uploading ? (
                          <>
                            <ArrowPathIcon className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                            <p className="text-sm font-bold text-blue-400">Mengunggah file...</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-3">
                              <DocumentArrowDownIcon className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-200 mb-1">Pilih File Bukti</p>
                            <p className="text-xs text-slate-500">Klik atau seret file ke sini</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            /* =====================================
               INVOICE SUKSES (PAID / VERIFIED)
               ===================================== */
            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-3xl mx-auto">
              <div className="bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>

                <div className="text-center mb-10 relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircleIcon className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-100 mb-3 tracking-tight">Pembayaran Diterima!</h1>
                  <p className="text-slate-400">Pesanan Anda telah diverifikasi dan masuk antrean produksi kami.</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 relative z-10 mb-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-700 border-dashed gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">No. Invoice</p>
                      <p className="text-xl font-mono font-bold text-slate-200">#{order?.invoiceNumber || params?.orderId?.slice(0,8).toUpperCase()}</p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Tanggal</p>
                      <p className="text-sm font-medium text-slate-300">{new Date(order?.createdAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Info Pelanggan</p>
                      <div className="text-sm text-slate-300 space-y-1">
                        <p className="font-bold text-slate-200">{order?.customerName || 'Pelanggan'}</p>
                        <p>{order?.customerEmail}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Rincian Pembayaran</p>
                      <div className="text-sm text-slate-300 space-y-2">
                        <p className="flex justify-between"><span className="text-slate-500">Metode:</span> <span className="font-medium text-slate-200">{payMethod}</span></p>
                        <p className="flex justify-between items-center"><span className="text-slate-500">Status:</span> <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-bold uppercase">{payStatus}</span></p>
                        <div className="pt-2 mt-2 border-t border-slate-700 flex justify-between items-center">
                          <span className="font-bold text-slate-400">Total:</span>
                          <span className="font-bold text-blue-400 text-lg">Rp {Number(grandTotal).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                  <button onClick={generateInvoice} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3.5 rounded-xl font-bold border border-slate-600 transition-all flex justify-center items-center gap-2">
                    <DocumentArrowDownIcon className="w-5 h-5" /> Unduh Invoice PDF
                  </button>
                  <button onClick={() => router.push('/')} className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-500 shadow-glow transition-all">
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}