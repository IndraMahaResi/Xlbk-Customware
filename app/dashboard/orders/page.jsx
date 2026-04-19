'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  EyeIcon, 
  XCircleIcon,
  DocumentArrowDownIcon,
  CheckBadgeIcon,
  MapPinIcon,
  BanknotesIcon,
  Cog8ToothIcon,
  CheckCircleIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filter, setFilter] = useState('ALL')

  const [shippingInput, setShippingInput] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
          const data = await res.json()
          setOrders(data)
      } else {
          setOrders([])
      }
    } catch (error) {
      toast.error('Gagal memuat data pesanan')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSingleOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedOrder(data.order || data)
      }
    } catch (error) {
      console.error("Gagal merefresh detail pesanan", error)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        toast.success('Status pesanan diperbarui')
        fetchOrders()
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status })
        }
      }
    } catch (error) {
      toast.error('Gagal memperbarui status')
    }
  }

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus })
      })

      if (res.ok) {
        toast.success('Status pembayaran diperbarui')
        fetchOrders()
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, paymentStatus })
        }
      }
    } catch (error) {
      toast.error('Gagal memperbarui pembayaran')
    }
  }

  const handleQuickAction = async (orderId, updateData, successMessage) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (res.ok) {
        toast.success(successMessage)
        fetchOrders() 
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, ...updateData })
        }
      } else {
        toast.error('Gagal memproses aksi cepat')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan pada server')
    }
  }

  const generateInvoice = async (orderId, invoiceNumber) => {
    try {
      toast.loading('Menyiapkan Invoice...', { id: 'invoice-toast' })
      const res = await fetch(`/api/orders/${orderId}/invoice`)
      
      if (!res.ok) throw new Error('Gagal dari server')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice_XLBK_${invoiceNumber || orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Invoice berhasil diunduh', { id: 'invoice-toast' })
    } catch (error) {
      toast.error('Gagal mengunduh invoice', { id: 'invoice-toast' })
    }
  }

  const handleVerifyShipping = async () => {
    if (!shippingInput || isNaN(shippingInput)) {
      return toast.error('Masukkan nominal ongkos kirim yang valid (angka saja)')
    }

    setIsVerifying(true)
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingFee: shippingInput })
      })

      if (res.ok) {
        toast.success('Ongkos kirim berhasil ditambahkan! Akses pembayaran pelanggan telah dibuka.')
        setShippingInput('') 
        fetchOrders() 
        fetchSingleOrder(selectedOrder.id) 
      } else {
        toast.error('Gagal memverifikasi pesanan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem saat memverifikasi')
    } finally {
      setIsVerifying(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      case 'NEED_VERIFICATION': return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'UNPAID': return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      case 'PAID': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'VERIFIED': return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'FAILED': return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    }
  }

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filter)

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Manajemen Pesanan</h1>
          <p className="text-slate-400 mt-1">Pantau dan kelola seluruh pesanan pelanggan yang masuk.</p>
        </div>
        <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-lg p-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            <select
              className="appearance-none bg-transparent text-slate-200 font-medium pl-10 pr-8 py-2 focus:outline-none cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL" className="bg-slate-800">Semua Pesanan</option>
              <option value="NEED_VERIFICATION" className="bg-slate-800 text-orange-400">⚠️ Butuh Verifikasi</option>
              <option value="PENDING" className="bg-slate-800">Menunggu (Pending)</option>
              <option value="PROCESSING" className="bg-slate-800">Diproses</option>
              <option value="COMPLETED" className="bg-slate-800">Selesai</option>
              <option value="CANCELLED" className="bg-slate-800">Dibatalkan</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-slate-400">
                ▼
            </div>
        </div>
      </div>

      {/* TABEL DATA PESANAN */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-400 font-medium animate-pulse">Memuat data pesanan...</p>
        </div>
      ) : (
        <div className="bg-slate-800/30 border border-slate-700/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700/80">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">ID Pesanan</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Pelanggan</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Biaya</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Status Order</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Pembayaran</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                        Belum ada pesanan ditemukan.
                      </td>
                    </tr>
                ) : filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-700/20 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-200">
                      <span className="text-blue-400">#</span>{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{order.customerName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{order.customerPhone}</div>
                      {order.countryOrigin && order.countryOrigin !== 'Indonesia' && (
                        <div className="inline-block mt-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {order.countryOrigin}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200">
                        Rp {Number(order.total).toLocaleString('id-ID')}
                      </div>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded border font-bold tracking-wider ${
                        order.paymentType === 'DP' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {order.paymentType === 'DP' ? 'SISTEM DP (50%)' : 'FULL PAYMENT'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-3 py-1.5 border appearance-none cursor-pointer outline-none transition-all ${getStatusColor(order.status)}`}
                      >
                        <option value="NEED_VERIFICATION" className="bg-slate-800 text-slate-200" disabled>Need Verif</option>
                        <option value="PENDING" className="bg-slate-800 text-slate-200">Pending</option>
                        <option value="PROCESSING" className="bg-slate-800 text-slate-200">Processing</option>
                        <option value="SHIPPED" className="bg-slate-800 text-slate-200">Shipped</option>
                        <option value="COMPLETED" className="bg-slate-800 text-slate-200">Completed</option>
                        <option value="CANCELLED" className="bg-slate-800 text-slate-200">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-3 py-1.5 border appearance-none cursor-pointer outline-none transition-all ${getPaymentStatusColor(order.paymentStatus)}`}
                      >
                        <option value="UNPAID" className="bg-slate-800 text-slate-200">Unpaid</option>
                        <option value="VERIFIED" className="bg-slate-800 text-slate-200">Verified (DP Masuk)</option>
                        <option value="PAID" className="bg-slate-800 text-slate-200">Paid (Lunas)</option>
                        <option value="FAILED" className="bg-slate-800 text-slate-200">Failed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-2 rounded-lg transition-colors"
                        title="Lihat Detail Pesanan"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETAIL PESANAN */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <div>
                  <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                      <span>Detail Pesanan</span>
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-1 rounded-md font-mono">
                          #{selectedOrder.id.slice(0,8).toUpperCase()}
                      </span>
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Tanggal Order: {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/10 p-2 rounded-full transition-all"
              >
                <XCircleIcon className="h-7 w-7" />
              </button>
            </div>

            <div className="space-y-6">

              {selectedOrder?.status === 'NEED_VERIFICATION' && (
                <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6 mb-8 shadow-[0_0_30px_rgba(245,158,11,0.1)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex flex-col sm:flex-row items-start gap-5 relative z-10">
                    <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/30">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div className="w-full">
                      <h3 className="text-lg sm:text-xl font-bold text-amber-400 mb-1">Verifikasi Ongkir Internasional</h3>
                      <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                        Pesanan dari <span className="font-bold text-white px-2 py-0.5 bg-slate-800 rounded">{selectedOrder.countryOrigin}</span>. Halaman pembayaran pelanggan saat ini sedang <strong className="text-rose-400">Terkunci</strong>. Masukkan total ongkos kirim (dalam Rupiah) untuk membuka akses pembayarannya.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-bold">Rp</span>
                          </div>
                          <input 
                            type="number" 
                            value={shippingInput}
                            onChange={(e) => setShippingInput(e.target.value)}
                            placeholder="Contoh: 350000"
                            className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                          />
                        </div>
                        <button 
                          onClick={handleVerifyShipping}
                          disabled={isVerifying}
                          className="px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                        >
                          {isVerifying ? 'Menyimpan...' : 'Simpan & Buka Akses'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BLOK QUICK ACTIONS */}
              <div className="bg-slate-800/80 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-lg">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider">
                  <span>⚡ Aksi Cepat (Admin)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleQuickAction(selectedOrder.id, { paymentStatus: 'VERIFIED' }, 'Pesanan ditandai DP MASUK!')}
                    className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    <BanknotesIcon className="w-4 h-4" /> DP Masuk
                  </button>
                  <button 
                    onClick={() => handleQuickAction(selectedOrder.id, { paymentStatus: 'PAID', status: 'PROCESSING' }, 'Pesanan ditandai LUNAS & DIPROSES!')}
                    className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    <CheckBadgeIcon className="w-4 h-4" /> Set Lunas
                  </button>
                </div>
              </div>

              {/* 🔥 BLOK RINCIAN TAGIHAN & PEMBAYARAN 🔥 */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg mb-6">
                <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                   <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Status Finansial</h3>
                   <span className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedOrder.paymentType === 'DP' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                     {selectedOrder.paymentType === 'DP' ? 'SISTEM UANG MUKA (DP 50%)' : 'SISTEM FULL PAYMENT'}
                   </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Total Keseluruhan</p>
                    <p className="text-lg font-bold text-white">Rp {Number(selectedOrder.total).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Status Pembayaran</p>
                    <p className={`text-lg font-bold ${
                      selectedOrder.paymentStatus === 'PAID' ? 'text-emerald-400' : 
                      selectedOrder.paymentStatus === 'VERIFIED' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {selectedOrder.paymentStatus === 'PAID' ? 'LUNAS' : 
                       selectedOrder.paymentStatus === 'VERIFIED' ? 'DP MASUK' : 'BELUM BAYAR'}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Sisa Tagihan (Pelunasan)</p>
                    <p className="text-lg font-bold text-rose-400">
                      {selectedOrder.paymentStatus === 'PAID' ? 'Rp 0' : 
                       selectedOrder.paymentType === 'DP' ? `Rp ${(selectedOrder.total / 2).toLocaleString('id-ID')}` : 
                       `Rp ${selectedOrder.total.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
                        Info Pelanggan
                    </h3>
                    <div className="space-y-2 text-sm">
                        <p className="flex justify-between"><span className="text-slate-400">Nama:</span> <span className="font-bold text-slate-200">{selectedOrder.customerName}</span></p>
                        <p className="flex justify-between"><span className="text-slate-400">Email:</span> <span className="font-medium text-slate-200">{selectedOrder.customerEmail}</span></p>
                        <p className="flex justify-between"><span className="text-slate-400">Telepon:</span> <span className="font-medium text-slate-200">{selectedOrder.customerPhone}</span></p>
                        <p className="flex justify-between"><span className="text-slate-400">Negara:</span> <span className="font-medium text-slate-200">{selectedOrder.countryOrigin || 'Indonesia'}</span></p>
                    </div>
                  </div>

                  {/* Payment Info & Bukti Transfer */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
                        <CheckBadgeIcon className="w-4 h-4 text-emerald-400"/>
                        Metode & Bukti Transfer
                    </h3>
                    <div className="space-y-3 text-sm">
                        <p className="flex justify-between items-center"><span className="text-slate-400">Pilihan:</span> <span className="font-bold text-slate-200">{selectedOrder.paymentMethod}</span></p>

                        {(selectedOrder.paymentProof || selectedOrder.paymentDetails?.proofUrl) && (
                          <div className="pt-3 mt-3 border-t border-slate-700/50 flex justify-between items-center">
                            <span className="text-slate-400">Bukti Transfer Terbaru:</span>
                            <a 
                              href={selectedOrder.paymentProof || selectedOrder.paymentDetails?.proofUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-blue-500/20"
                            >
                              <PhotoIcon className="w-4 h-4" /> Cek File
                            </a>
                          </div>
                        )}
                    </div>
                  </div>
              </div>

              {selectedOrder.address && (
                <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Alamat Pengiriman</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedOrder.address}</p>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="bg-slate-800/80 px-5 py-3 border-b border-slate-700">
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Item Pesanan</h3>
                </div>
                <div className="p-5 space-y-4">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start pb-4 border-b border-slate-700/50 last:border-0 last:pb-0">
                        <div>
                        <p className="font-bold text-slate-200 text-lg">{item.product?.name || 'Produk'}</p>
                        <p className="text-sm text-slate-400 mt-1">Kuantitas: <span className="text-slate-200 font-medium">{item.quantity}</span> pcs</p>
                        {item.notes && (
                            <div className="mt-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                                <p className="text-xs text-slate-400"><span className="font-semibold text-blue-400">Catatan:</span> {item.notes}</p>
                            </div>
                        )}
                        </div>
                        <p className="font-bold text-blue-400">
                        Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                    </div>
                    )) : (
                        <p className="text-slate-400 text-sm italic">Detail item tidak tersedia (Order Lama)</p>
                    )}
                </div>
              </div>

              {/* Design File & Additional Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedOrder.designFile && (
                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-center items-start">
                        <h3 className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-2">File Desain</h3>
                        <a
                            href={selectedOrder.designFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 px-4 rounded-xl transition-colors shadow-glow"
                        >
                            <DocumentArrowDownIcon className="w-5 h-5"/>
                            Lihat / Unduh Desain
                        </a>
                    </div>
                  )}

                  {selectedOrder.notes && (
                    <div className="bg-amber-900/10 border border-amber-500/20 rounded-2xl p-5">
                        <h3 className="text-xs uppercase tracking-wider text-amber-500 font-bold mb-2">Catatan Tambahan Order</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{selectedOrder.notes}</p>
                    </div>
                  )}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => generateInvoice(selectedOrder.id, selectedOrder.invoiceNumber)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white border border-slate-600 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" /> Cetak Invoice / Resi
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}