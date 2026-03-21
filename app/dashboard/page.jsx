'use client'
import { useState, useEffect } from 'react'
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  ClockIcon, // Mengganti UserGroupIcon dengan Clock untuk merepresentasikan "Pending"
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Nantinya ini akan mengambil data dari database Anda melalui API
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders').catch(() => ({ json: () => [] })),
        fetch('/api/products').catch(() => ({ json: () => [] }))
      ])

      const orders = await ordersRes.json() || []
      const products = await productsRes.json() || []

      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
      const pendingOrders = orders.filter(o => o.status === 'PENDING').length

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        pendingOrders,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
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

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Ringkasan Dashboard</h1>
        <p className="text-slate-400 mt-2">Pantau performa bisnis customwear Anda hari ini.</p>
      </div>

      {/* Stats Grid - Glassmorphism Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <div 
            key={card.name} 
            className={`group bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 ${card.glowClass} hover:-translate-y-1`}
          >
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-xl border ${card.colorClass} transition-colors`}>
                <card.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">{card.name}</p>
                {loading ? (
                  <div className="h-8 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-slate-100 tracking-tight">{card.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-slate-800/30 border border-slate-700/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-100">Pesanan Terbaru</h2>
          <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-500/10">
            Lihat Semua
          </button>
        </div>
        
        <div className="p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-400 font-medium animate-pulse">Memuat pesanan terbaru...</p>
            </div>
          ) : (
            // Placeholder sebelum ada data orders
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center border border-slate-700 mb-4">
                <ShoppingCartIcon className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300 mb-1">Belum ada pesanan masuk</h3>
              <p className="text-slate-500 text-sm">Pesanan baru akan muncul di sini secara otomatis.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}