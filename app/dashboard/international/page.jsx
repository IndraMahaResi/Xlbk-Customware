'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  GlobeAltIcon, 
  EyeIcon, 
  XCircleIcon,
  CheckBadgeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline'

export default function InternationalOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    fetchInternationalOrders()
    const interval = setInterval(() => {
      fetchInternationalOrders()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchInternationalOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' })
      if (res.ok) {
          const data = await res.json()
          const intlOrders = data.filter(o => 
            o.status === 'NEED_VERIFICATION' || 
            (o.countryOrigin && o.countryOrigin !== 'Indonesia')
          )
          setOrders(intlOrders)
      } else {
          setOrders([])
      }
    } catch (error) {
      console.error('Gagal memuat data pesanan internasional', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // 🔥 REVISI: Fungsi verifikasi disederhanakan tanpa mengirim shippingFee
  const handleVerifyOnly = async () => {
    setIsVerifying(true)
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/verify`, {
        method: 'PUT' // Tidak butuh body/JSON lagi
      })

      if (res.ok) {
        toast.success('Pesanan diverifikasi! Akses pembayaran pelanggan kini terbuka.')
        fetchInternationalOrders() 
        setSelectedOrder(null) 
      } else {
        toast.error('Gagal memverifikasi pesanan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem saat memverifikasi')
    } finally {
      setIsVerifying(false)
    }
  }

  const pendingVerifications = orders.filter(o => o.status === 'NEED_VERIFICATION').length
  const verifiedOrders = orders.filter(o => o.status !== 'NEED_VERIFICATION').length

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
          <GlobeAltIcon className="w-8 h-8 text-blue-400" />
          Verifikasi Internasional
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Halaman khusus untuk menyetujui pesanan dari luar negeri setelah bernegosiasi ongkos kirim via WhatsApp.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-amber-400 font-bold uppercase tracking-wider text-xs mb-1">Menunggu Konfirmasi</p>
            <p className="text-3xl font-black text-white">{pendingVerifications}</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400">
             <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1">Sudah Diberi Akses</p>
            <p className="text-3xl font-black text-white">{verifiedOrders}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
             <CheckBadgeIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TABEL */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-400 font-medium animate-pulse">Memuat data internasional...</p>
        </div>
      ) : (
        <div className="bg-slate-800/30 border border-slate-700/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700/80">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">ID / Invoice</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Pelanggan & Negara</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Barang</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Status Akses</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                        Tidak ada pesanan dari luar negeri saat ini.
                      </td>
                    </tr>
                ) : orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-700/20 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-200">
                      <div className="text-blue-400">{order.invoiceNumber}</div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(order.createdAt).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-100">{order.customerName}</div>
                      <div className="inline-flex items-center gap-1 mt-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        <GlobeAltIcon className="w-3 h-3" /> {order.countryOrigin || 'International'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200">
                      Rp {Number(order.subtotal).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      {order.status === 'NEED_VERIFICATION' ? (
                         <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold animate-pulse">
                           🔒 Terkunci
                         </span>
                      ) : (
                         <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                           🔓 Akses Dibuka
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className={`${order.status === 'NEED_VERIFICATION' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'} px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md`}
                      >
                        {order.status === 'NEED_VERIFICATION' ? 'Tinjau & Buka' : 'Lihat Detail'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETAIL & VERIFIKASI */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-sky-400"></div>
            
            <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
              <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <GlobeAltIcon className="w-6 h-6 text-blue-400" />
                      Detail Pengiriman Internasional
                  </h2>
                  <p className="text-slate-400 text-sm mt-1 font-mono">Invoice: {selectedOrder.invoiceNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-rose-400 bg-slate-800 p-2 rounded-full transition-all">
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* KOTAK VERIFIKASI (TAMPIL JIKA TERKUNCI) */}
            {selectedOrder.status === 'NEED_VERIFICATION' && (
              <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl p-6 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-400 mb-2">Buka Akses Pembayaran</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Saat ini pelanggan melihat layar <strong>Terkunci</strong>. Jika Anda sudah sepakat mengenai total harga (termasuk ongkir) dengan pelanggan via WhatsApp, klik tombol di samping agar mereka bisa segera mentransfer dan mengunggah bukti.
                    </p>
                  </div>
                  <button 
                    onClick={handleVerifyOnly}
                    disabled={isVerifying}
                    className="w-full md:w-auto px-6 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 shrink-0"
                  >
                    {isVerifying ? 'Memproses...' : (
                      <>
                        <LockOpenIcon className="w-5 h-5" />
                        Izinkan Pembayaran
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Info Pelanggan & Barang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-emerald-400"/>
                    Tujuan Pengiriman
                </h3>
                <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-slate-400">Nama:</span> <span className="font-bold text-slate-200">{selectedOrder.customerName}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">WA:</span> <span className="font-medium text-slate-200">{selectedOrder.customerPhone}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Negara:</span> <span className="font-bold text-emerald-400">{selectedOrder.countryOrigin}</span></p>
                </div>
              </div>
              
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Item Pesanan</h3>
                <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
                          <span className="text-slate-300">{item.quantity}x {item.product?.name || 'Produk'}</span>
                          <span className="text-slate-400 font-mono">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between font-bold text-slate-200">
                      <span>Subtotal</span>
                      <span>Rp {Number(selectedOrder.subtotal).toLocaleString('id-ID')}</span>
                    </div>
                </div>
              </div>
            </div>

            {selectedOrder.address && (
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
                <span className="text-slate-400 text-xs uppercase font-bold block mb-2">Alamat Lengkap</span>
                <p className="text-slate-200 text-sm leading-relaxed">{selectedOrder.address}</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}