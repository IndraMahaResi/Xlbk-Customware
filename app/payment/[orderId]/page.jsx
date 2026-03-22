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
  XCircleIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'
import { QRCodeCanvas } from 'qrcode.react'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // 🔥 STATE BARU: Untuk menyimpan kurs live crypto
  const [cryptoRates, setCryptoRates] = useState({ BTC: 0, USDT: 0 })
  const [isCalculating, setIsCalculating] = useState(true)

  // Konfigurasi Alamat Wallet
  const WALLET_ADDRESSES = {
    BTC: 'bc1qar9fgrkghr6v58qelc3cdjkptyw8j3gh95w24s', // Alamat BTC Anda
    USDT: '0xb1bFa84d196aB9F32D07F770F3c5712501d5903c'  // Alamat BEP20 Anda
  }

  // 🔥 EFFECT BARU: Fetch live exchange rate saat halaman dimuat
  useEffect(() => {
    const fetchCryptoRates = async () => {
      try {
        setIsCalculating(true)
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=idr')
        const data = await res.json()
        
        setCryptoRates({
          BTC: data.bitcoin.idr,
          USDT: data.tether.idr
        })
      } catch (error) {
        console.error('Gagal mengambil kurs crypto:', error)
        // Fallback jika API sedang limit/error (Harga estimasi)
        setCryptoRates({ 
          BTC: 1100000000, // Estimasi 1 BTC = Rp 1,1 Miliar
          USDT: 16200      // Estimasi 1 USDT = Rp 16.200
        })
      } finally {
        setIsCalculating(false)
      }
    }

    fetchCryptoRates()
  }, [])

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
      setLoading(true)
      const res = await fetch(`/api/orders/${params.orderId}`)
      const data = await res.json()
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
      const res = await fetch(`/api/orders/${params.orderId}/invoice`)
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

  // 🔥 FUNGSI REVISI: Hitung nilai IDR ke Crypto berdasarkan kurs live
  const calculateLiveCrypto = (amountIdr, method) => {
    if (!amountIdr || isNaN(amountIdr)) return '0'
    
    if (method === 'BTC' && cryptoRates.BTC > 0) {
      const btcValue = amountIdr / cryptoRates.BTC
      return btcValue.toFixed(8) 
    } 
    
    if (method === 'USDT' && cryptoRates.USDT > 0) {
      const usdtValue = amountIdr / cryptoRates.USDT
      return usdtValue.toFixed(2) 
    }
    
    return '0'
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mb-4"></div>
        <p className="text-slate-400 animate-pulse">Menghubungkan ke sistem pembayaran...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-6 bg-slate-950">
        <div className="text-center bg-slate-900 border border-slate-700 p-10 rounded-3xl max-w-md w-full">
          <XCircleIcon className="w-20 h-20 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4 text-white">Pesanan Tidak Ditemukan</h2>
          <button onClick={() => router.push('/products')} className="bg-blue-600 text-white w-full py-3 rounded-xl font-bold">Kembali Belanja</button>
        </div>
      </div>
    )
  }

  const rawMethod = payment?.method || order?.paymentMethod || 'BANK_TRANSFER'
  const payMethod = rawMethod.toUpperCase() 
  
  const grandTotal = payment?.amount || order?.total || 0
  const payStatus = (payment?.status || order?.paymentStatus || 'UNPAID').toUpperCase()
  const isPaid = payStatus === 'PAID' || payStatus === 'VERIFIED'

  // 🔥 Terapkan perhitungan di sini
  const formattedCryptoDisplay = calculateLiveCrypto(grandTotal, payMethod);

  return (
    <>
      <Navbar />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-950">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="pt-28 pb-20 min-h-screen relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          
          {!isPaid ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 mb-4 tracking-tight">Selesaikan Pembayaran</h1>
                <p className="text-slate-400 text-lg">
                  Invoice <span className="font-mono text-blue-400 font-bold">#{order?.invoiceNumber || params?.orderId?.slice(0,8).toUpperCase()}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Kolom Kiri: Instruksi */}
                <div className="lg:col-span-7 space-y-6">
                  {countdown !== 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
                       <div className="absolute inset-0 bg-amber-500/5 animate-pulse"></div>
                      <p className="text-amber-400/80 font-medium mb-2 text-sm uppercase tracking-wider relative z-10">Batas Waktu Pembayaran</p>
                      <div className="flex justify-center items-center gap-3 text-3xl font-extrabold text-amber-400 font-mono relative z-10">
                        <div className="bg-amber-950/50 px-3 py-2 rounded-lg border border-amber-500/30">{countdown?.hours?.toString().padStart(2, '0')}</div>:
                        <div className="bg-amber-950/50 px-3 py-2 rounded-lg border border-amber-500/30">{countdown?.minutes?.toString().padStart(2, '0')}</div>:
                        <div className="bg-amber-950/50 px-3 py-2 rounded-lg border border-amber-500/30">{countdown?.seconds?.toString().padStart(2, '0')}</div>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                    
                    <h2 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-3">
                      <BanknotesIcon className="w-6 h-6 text-emerald-400" />
                      Instruksi Transfer ({payMethod.replace('_', ' ')})
                    </h2>
                    
                    {payMethod === 'QRIS' ? (
                      <div className="text-center animate-in fade-in duration-500">
                        <div className="bg-white p-4 rounded-2xl inline-block mb-6 border-4 border-slate-200 shadow-xl">
                          <Image src="/images/qris.png" alt="Scan QRIS" width={250} height={250} className="mx-auto rounded-lg" onError={(e) => e.target.style.display='none'}/>
                          <div className="text-slate-900 font-bold mt-2">Scan QRIS</div>
                        </div>
                        <ul className="text-left text-slate-400 space-y-3 text-sm max-w-sm mx-auto bg-slate-800/50 p-5 rounded-xl border border-slate-700">
                          <li className="flex gap-3"><span className="text-blue-400 font-bold">1.</span> Buka aplikasi M-Banking atau E-Wallet Anda.</li>
                          <li className="flex gap-3"><span className="text-blue-400 font-bold">2.</span> Scan gambar QRIS di atas.</li>
                          <li className="flex gap-3"><span className="text-blue-400 font-bold">3.</span> Pastikan nominal pembayaran sesuai tagihan.</li>
                        </ul>
                      </div>
                    ) : payMethod === 'BTC' ? (
                      /* =================== BLOK BTC =================== */
                      <div className="animate-in fade-in duration-500 space-y-6 text-center flex flex-col items-center">
                        <div className="bg-white p-5 rounded-3xl inline-block shadow-2xl border-4 border-slate-200">
                          {/* QR Code hanya dirender saat perhitungan selesai agar amount tidak 0 */}
                          {!isCalculating && (
                            <QRCodeCanvas 
                              value={`bitcoin:${WALLET_ADDRESSES.BTC}?amount=${formattedCryptoDisplay}`}
                              size={200}
                              bgColor={"#ffffff"}
                              fgColor={"#000000"}
                              level={"H"}
                              includeMargin={false}
                            />
                          )}
                          <div className="text-slate-900 font-bold mt-3 text-sm flex items-center justify-center gap-2">
                             Scan QR untuk Alamat & Nominal
                          </div>
                        </div>

                        <div className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center relative group hover:border-amber-500/50 transition-colors">
                           <div className="absolute top-3 right-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                             Jaringan: BTC (Bitcoin)
                           </div>
                          <p className="text-xs text-slate-400 uppercase font-bold mb-3 tracking-wider mt-4">Alamat Wallet Bitcoin</p>
                          <p className="font-mono text-amber-400 break-all mb-5 text-sm sm:text-base bg-slate-950 p-4 rounded-lg border border-slate-700">{WALLET_ADDRESSES.BTC}</p>
                          <button onClick={() => copyToClipboard(WALLET_ADDRESSES.BTC, 'Alamat BTC')} className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-5 py-2.5 rounded-xl text-sm font-bold border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-all shadow-md group-hover:shadow-amber-500/20">
                             <DocumentDuplicateIcon className="w-5 h-5"/>
                            Salin Alamat Wallet
                          </button>
                        </div>

                        <div className="w-full bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50 text-center">
                           <p className="text-slate-400 text-sm mb-1">Kirim tepat senilai:</p>
                           {/* 🔥 Loading state untuk teks konversi */}
                           <span className="text-amber-400 font-mono font-black text-2xl sm:text-3xl tracking-tight">
                              {isCalculating ? <span className="animate-pulse opacity-70">Menghitung Kurs...</span> : `${formattedCryptoDisplay} BTC`}
                           </span>
                           <p className="text-xs text-amber-500 font-bold mt-2">PENTING: Pastikan Anda menggunakan Jaringan BTC (Bitcoin Network).</p>
                           <p className="text-xs text-slate-500 mt-1 leading-relaxed">Perhitungkan biaya transaksi (gas fee) bursa/wallet Anda agar nominal yang kami terima pas.</p>
                        </div>
                      </div>
                    ) : payMethod === 'USDT' ? (
                      /* =================== BLOK USDT (BEP20) =================== */
                      <div className="animate-in fade-in duration-500 space-y-6 text-center flex flex-col items-center">
                        <div className="bg-white p-5 rounded-3xl inline-block shadow-2xl border-4 border-slate-200">
                          <QRCodeCanvas 
                            value={WALLET_ADDRESSES.USDT} 
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"H"}
                            includeMargin={false}
                          />
                          <div className="text-slate-900 font-bold mt-3 text-sm flex items-center justify-center gap-2">
                             Scan QR untuk Alamat Wallet
                          </div>
                        </div>

                        <div className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center relative group hover:border-emerald-500/50 transition-colors">
                           <div className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                             Jaringan: BNB Smart Chain (BEP 20)
                           </div>
                          <p className="text-xs text-slate-400 uppercase font-bold mb-3 tracking-wider mt-4">Alamat Wallet Tether (USDT)</p>
                          <p className="font-mono text-emerald-400 break-all mb-5 text-sm sm:text-base bg-slate-950 p-4 rounded-lg border border-slate-700">{WALLET_ADDRESSES.USDT}</p>
                          <button onClick={() => copyToClipboard(WALLET_ADDRESSES.USDT, 'Alamat USDT')} className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-xl text-sm font-bold border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all shadow-md group-hover:shadow-emerald-500/20">
                             <DocumentDuplicateIcon className="w-5 h-5"/>
                            Salin Alamat Wallet
                          </button>
                        </div>

                        <div className="w-full bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50 text-center">
                           <p className="text-slate-400 text-sm mb-1">Kirim tepat senilai:</p>
                           {/* 🔥 Loading state untuk teks konversi */}
                           <span className="text-emerald-400 font-mono font-black text-3xl tracking-tight">
                              {isCalculating ? <span className="animate-pulse opacity-70">Menghitung Kurs...</span> : `${formattedCryptoDisplay} USDT`}
                           </span>
                           <p className="text-xs text-emerald-500 font-bold mt-2">PENTING: Gunakan jaringan BNB Smart Chain (BEP 20). Menggunakan jaringan lain (seperti ERC20 atau TRC20) akan menyebabkan dana hilang.</p>
                        </div>
                      </div>
                    ) : (
                      /* =================== BLOK BANK TRANSFER =================== */
                      <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-500/50 transition-colors">
                          <div>
                            <p className="font-bold text-slate-200 text-lg">Bank BCA</p>
                            <p className="text-slate-400 text-xs">a.n. PT Xlbk Customwear</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-mono text-xl font-bold text-blue-400 tracking-wider">1234567890</p>
                            <button onClick={() => copyToClipboard('1234567890', 'No. Rekening BCA')} className="p-2.5 bg-slate-900 rounded-lg border border-slate-700 hover:border-blue-500 transition-all"><DocumentDuplicateIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-400" /></button>
                          </div>
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-amber-500/50 transition-colors">
                          <div>
                            <p className="font-bold text-slate-200 text-lg">Bank Mandiri</p>
                            <p className="text-slate-400 text-xs">a.n. PT Xlbk Customwear</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-mono text-xl font-bold text-amber-400 tracking-wider">0987654321</p>
                            <button onClick={() => copyToClipboard('0987654321', 'No. Rekening Mandiri')} className="p-2.5 bg-slate-900 rounded-lg border border-slate-700 hover:border-amber-500 transition-all"><DocumentDuplicateIcon className="w-5 h-5 text-slate-400 group-hover:text-amber-400" /></button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kolom Kanan: Ringkasan & Upload */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/80 border border-blue-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                     <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 relative z-10">Total Tagihan (IDR)</h3>
                    <div className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight relative z-10">
                      Rp {Number(grandTotal).toLocaleString('id-ID')}
                    </div>
                    <div className="border-t border-slate-700/50 pt-6 space-y-3 relative z-10">
                      {order?.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-slate-400 gap-4">
                          <span className="truncate">{item.quantity}x {item.product?.name || 'Produk Customwear'}</span>
                          <span className="text-slate-200 font-medium whitespace-nowrap">Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                      {(!order?.items || order?.items.length === 0) && (
                         <div className="text-sm text-slate-400 gap-4">Pembayaran Produk Customwear</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-lg font-bold mb-2 text-white flex items-center gap-2">
                       <DocumentArrowDownIcon className="w-5 h-5 text-blue-400"/>
                       Upload Bukti Transfer
                    </h2>
                    <p className="text-slate-400 text-xs mb-6 leading-relaxed">Pesanan diproses setelah verifikasi manual oleh tim kami (max 1x24 jam).</p>
                    
                    <div className="relative">
                      <input type="file" accept="image/*,.pdf" onChange={handlePaymentProof} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" />
                      <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[160px]
                        ${uploading ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-800/50 hover:border-blue-400 hover:bg-slate-800'}`}>
                        {uploading ? (
                          <div className="flex flex-col items-center"><ArrowPathIcon className="w-10 h-10 text-blue-400 animate-spin mb-4" /><p className="text-sm font-bold text-blue-400">Mengunggah file bukti...</p></div>
                        ) : (
                          <div className="flex flex-col items-center">
                             <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4 border border-slate-600 group-hover:border-blue-500 transition-colors">
                                <QrCodeIcon className="w-8 h-8 text-slate-300 group-hover:text-blue-400" />
                             </div>
                             <p className="text-sm font-bold text-slate-200 mb-1">Klik atau Seret File</p>
                             <p className="text-xs text-slate-500">PNG, JPG, atau PDF (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-3xl mx-auto">
              <div className="bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-10 md:p-14 text-center shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                 <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
                
                <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/10 rounded-full mb-8 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] relative z-10">
                  <CheckCircleIcon className="w-14 h-14 text-emerald-400" />
                </div>
                
                <h1 className="text-4xl font-black text-white mb-4 tracking-tight relative z-10">Pembayaran Berhasil!</h1>
                <p className="text-slate-400 mb-12 max-w-lg mx-auto relative z-10">Terima kasih. Pesanan Anda <span className="font-mono text-emerald-400 font-bold">#{order?.invoiceNumber || params?.orderId?.slice(0,8).toUpperCase()}</span> telah diverifikasi dan masuk antrean produksi.</p>
                
                <div className="flex flex-col sm:flex-row gap-5 relative z-10 max-w-md mx-auto">
                  <button onClick={generateInvoice} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold border border-slate-600 transition-all flex justify-center items-center gap-2.5 shadow-md">
                    <DocumentArrowDownIcon className="w-5 h-5" /> Unduh Invoice PDF
                  </button>
                  <button onClick={() => router.push('/')} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-glow">
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