'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { toast } from 'react-hot-toast'
import { 
  MagnifyingGlassIcon, 
  DocumentTextIcon, 
  PhoneIcon,
  CheckCircleIcon,
  BanknotesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function PelunasanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchData, setSearchData] = useState({
    invoiceNumber: '',
    customerPhone: ''
  })
  const [foundOrder, setFoundOrder] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchData.invoiceNumber || !searchData.customerPhone) {
      toast.error('Mohon isi Nomor Invoice dan WhatsApp Anda')
      return
    }

    setLoading(true)
    setFoundOrder(null) 
    
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData)
      })

      const data = await res.json()

      if (res.ok) {
        setFoundOrder(data.order)
        toast.success('Pesanan ditemukan!')
      } else {
        toast.error(data.error || 'Pesanan tidak ditemukan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem, silakan coba lagi')
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToPayment = async () => {
    router.push(`/payment/${foundOrder.id}?type=pelunasan`)
  }

  return (
    <>
      <Navbar />
      
      <div className="pt-28 pb-20 min-h-screen relative z-10 overflow-hidden bg-slate-950">
        
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="max-w-3xl mx-auto px-6">
          
          <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(37,99,235,0.15)]">
               <BanknotesIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 tracking-tight mb-4">
              Cek & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">Pelunasan</span> Tagihan
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Masukkan Nomor Invoice dan Nomor WhatsApp yang Anda gunakan saat memesan untuk melihat sisa tagihan Anda.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

            {/* FORM PENCARIAN */}
            <form onSubmit={handleSearch} className="space-y-5 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nomor Invoice</label>
                  <div className="absolute inset-y-0 left-0 pt-7 pl-4 flex items-center pointer-events-none">
                    <DocumentTextIcon className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={searchData.invoiceNumber}
                    onChange={(e) => setSearchData({...searchData, invoiceNumber: e.target.value})}
                    placeholder="Contoh: INV/2026..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nomor WhatsApp</label>
                  <div className="absolute inset-y-0 left-0 pt-7 pl-4 flex items-center pointer-events-none">
                    <PhoneIcon className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="tel"
                    value={searchData.customerPhone}
                    onChange={(e) => setSearchData({...searchData, customerPhone: e.target.value})}
                    placeholder="0812..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><ArrowPathIcon className="w-5 h-5 animate-spin" /> Mencari Data...</>
                ) : (
                  <><MagnifyingGlassIcon className="w-5 h-5" /> Cek Tagihan Saya</>
                )}
              </button>
            </form>

            {/* HASIL PENCARIAN */}
            {foundOrder && (
              <div className="mt-8 border-t border-slate-700/50 pt-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 mb-1">Detail Pesanan</h3>
                    <p className="text-slate-400 text-sm">A.n <span className="font-bold text-slate-200">{foundOrder.customerName}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      {foundOrder.paymentType} PAYMENT
                    </span>
                    <br/>
                    {/* 🟢 REVISI: Badge Status lebih pintar */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        foundOrder.paymentStatus === 'PAID' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : foundOrder.paymentStatus === 'VERIFIED'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {foundOrder.paymentStatus === 'PAID' && <CheckCircleIcon className="w-3 h-3"/>}
                      {foundOrder.paymentStatus === 'VERIFIED' ? 'DP DITERIMA' : foundOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 mb-6">
                  <div className="space-y-3 text-sm">
                    {foundOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300 border-b border-slate-700/30 pb-2 last:border-0 last:pb-0">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span className="text-slate-400">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Total Harga Barang</span>
                      <span>Rp {foundOrder.total.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* 🟢 REVISI UTAMA: KONDISI JIKA DP DAN BELUM LUNAS ('PAID') */}
                {foundOrder.paymentType === 'DP' && foundOrder.paymentStatus !== 'PAID' ? (
                  <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-left">
                        <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Sisa Tagihan (Pelunasan)</p>
                        <p className="text-3xl font-black text-white">Rp {foundOrder.outstandingAmount.toLocaleString('id-ID')}</p>
                        <p className="text-slate-400 text-xs mt-2">*Termasuk sisa DP 50% dan ongkos kirim (jika ada)</p>
                      </div>
                      <button
                        onClick={handleProceedToPayment}
                        className="w-full md:w-auto px-8 py-4 bg-amber-500 text-slate-950 font-black rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 shrink-0"
                      >
                        Bayar Pelunasan
                      </button>
                    </div>
                  </div>
                ) : (
                  /* KONDISI: SUDAH LUNAS ('PAID') ATAU BUKAN DP */
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                    <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-emerald-400 mb-1">Tagihan Sudah Lunas</h3>
                    <p className="text-slate-400 text-sm">Pesanan ini tidak memiliki sisa tagihan yang harus dibayarkan.</p>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}