'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  EyeIcon, 
  XCircleIcon,
  DocumentArrowDownIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  Cog8ToothIcon,
  CheckCircleIcon,
  PhotoIcon // Icon tambahan untuk cek bukti
} from '@heroicons/react/24/outline'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filter, setFilter] = useState('ALL')

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

  // FUNGSI Tombol Quick Actions (Auto Update)
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

  // 🔥 FUNGSI BARU: Unduh Invoice oleh Admin
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

  // Warna khusus Dark Mode untuk Status Pesanan
  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    }
  }

  // Warna khusus Dark Mode untuk Status Pembayaran
  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'UNPAID': return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      case 'PAID': return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'VERIFIED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
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
                      <div className="text-xs text-slate-400 mt-0.5">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200">
                      Rp {Number(order.total).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-3 py-1.5 border appearance-none cursor-pointer outline-none transition-all ${getStatusColor(order.status)}`}
                      >
                        <option value="PENDING" className="bg-slate-800 text-slate-200">Pending</option>
                        <option value="PROCESSING" className="bg-slate-800 text-slate-200">Processing</option>
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
                        <option value="PAID" className="bg-slate-800 text-slate-200">Paid</option>
                        <option value="VERIFIED" className="bg-slate-800 text-slate-200">Verified</option>
                        <option value="FAILED" className="bg-slate-800 text-slate-200">Failed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                      })}
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

              {/* BLOK QUICK ACTIONS (AUTO BUTTONS) */}
              <div className="bg-slate-800/80 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-lg">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider">
                  <span>⚡ Quick Actions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleQuickAction(selectedOrder.id, { paymentStatus: 'PAID' }, 'Pesanan ditandai LUNAS!')}
                    className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    <BanknotesIcon className="w-4 h-4" /> Auto Paid
                  </button>
                  <button 
                    onClick={() => handleQuickAction(selectedOrder.id, { status: 'PROCESSING' }, 'Pesanan masuk tahap PROSES!')}
                    className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    <Cog8ToothIcon className="w-4 h-4" /> Auto Process
                  </button>
                  <button 
                    onClick={() => handleQuickAction(selectedOrder.id, { status: 'COMPLETED', paymentStatus: 'VERIFIED' }, 'Pesanan SELESAI & LUNAS!')}
                    className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    <CheckCircleIcon className="w-4 h-4" /> Auto Complete
                  </button>
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
                    </div>
                  </div>

                  {/* Payment Info & Bukti Transfer */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
                        <CheckBadgeIcon className="w-4 h-4 text-emerald-400"/>
                        Info Pembayaran
                    </h3>
                    <div className="space-y-3 text-sm">
                        <p className="flex justify-between items-center"><span className="text-slate-400">Metode:</span> <span className="font-bold text-slate-200">{selectedOrder.paymentMethod}</span></p>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Status Bayar:</span> 
                          <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Status Order:</span> 
                          <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </div>

                        {/* 🔥 TOMBOL LIHAT BUKTI TRANSFER 🔥 */}
                        {/* Asumsi: URL bukti disimpan di tabel Order dengan field `paymentProof` atau direlasikan ke `paymentDetails.proofUrl` */}
                        {(selectedOrder.paymentProof || selectedOrder.paymentDetails?.proofUrl) && (
                          <div className="pt-3 mt-3 border-t border-slate-700/50 flex justify-between items-center">
                            <span className="text-slate-400">Bukti Transfer:</span>
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

              {/* Alamat Pengiriman */}
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

              {/* Total Tagihan & Cetak Invoice */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-800/80 border border-slate-700 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
                <div>
                  <span className="block text-lg font-bold text-slate-300 uppercase tracking-widest mb-1">Total Tagihan</span>
                  <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
                    Rp {Number(selectedOrder.total).toLocaleString('id-ID')}
                  </span>
                </div>
                
                {/* 🔥 TOMBOL UNDUH INVOICE 🔥 */}
                <button
                  onClick={() => generateInvoice(selectedOrder.id, selectedOrder.invoiceNumber)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white border border-slate-600 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" /> Cetak Invoice
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}