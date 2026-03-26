'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Menggunakan try-catch individu untuk tiap fetch agar tidak saling menjatuhkan
      const fetchOrders = fetch('/api/orders').then(res => res.ok ? res.json() : []).catch(() => [])
      const fetchProducts = fetch('/api/products').then(res => res.ok ? res.json() : []).catch(() => [])

      const [ordersData, productsData] = await Promise.all([fetchOrders, fetchProducts])

      // Pastikan data selalu array
      const orders = Array.isArray(ordersData) ? ordersData : []
      const products = Array.isArray(productsData) ? productsData : []

      // Hitung statistik dengan aman
      const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
      const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.isApproved === false).length

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        pendingOrders,
      })

      setRecentOrders(orders.slice(0, 5))
    } catch (error) {
      console.error('Dashboard Data Error:', error)
    } finally {
      // PENTING: Loading HARUS dimatikan apa pun yang terjadi
      setLoading(false)
    }
  }

  const cards = [
    {
      name: 'Total Pesanan',
      value: stats.totalOrders,
      icon: ShoppingCartIcon,
      colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      glowClass: 'group-hover:shadow-[0_0_25px_rgba(37,99,235,0.2)]'
    },
    {
      name: 'Total Pendapatan',
      value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
      icon: CurrencyDollarIcon,
      colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      glowClass: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]'
    },
    {
      name: 'Total Produk',
      value: stats.totalProducts,
      icon: CubeIcon,
      colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      glowClass: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]'
    },
    {
      name: 'Pesanan Tertunda',
      value: stats.pendingOrders,
      icon: ClockIcon,
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      glowClass: 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]'
    },
  ]

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 w-fit"><ClockIcon className="w-3 h-3"/> PENDING</span>,
      COMPLETED: <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 w-fit"><CheckCircleIcon className="w-3 h-3"/> SELESAI</span>,
      CANCELLED: <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 w-fit"><XCircleIcon className="w-3 h-3"/> BATAL</span>
    }
    return badges[status] || badges.PENDING
  }

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Ringkasan Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">Selamat datang kembali! Berikut adalah ringkasan bisnis Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <div key={card.name} className="group bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${card.colorClass}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.name}</p>
                <p className="text-xl font-bold text-white mt-1">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
          <h2 className="text-lg font-bold text-white">Pesanan Terbaru</h2>
          <Link href="/dashboard/orders" className="text-xs font-bold text-blue-400 hover:text-blue-300">Lihat Semua</Link>
        </div>
        
        <div className="overflow-x-auto">
          {recentOrders.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-blue-400">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 font-medium text-slate-200">{order.customerName || 'Guest'}</td>
                    <td className="px-6 py-4 text-right text-slate-300 font-bold">Rp {Number(order.total).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 flex justify-center">{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center">
              <ShoppingCartIcon className="h-10 w-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Belum ada pesanan masuk hari ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}