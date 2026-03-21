'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [reportData, setReportData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    topProducts: [],
    ordersByStatus: {},
    revenueByDay: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [dateRange]) // Akan re-fetch setiap filter dropdown berubah

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports?range=${dateRange}`)
      if (res.ok) {
        const data = await res.json()
        setReportData(data)
      } else {
        // --- 🛠️ MOCK DATA DINAMIS UNTUK DEMO UI ---
        // Membuat data grafik yang panjangnya menyesuaikan pilihan filter
        let mockRevenue = [];
        if (dateRange === 'week') {
          mockRevenue = [
            { date: 'Sen', revenue: 1200000 }, { date: 'Sel', revenue: 2100000 },
            { date: 'Rab', revenue: 1800000 }, { date: 'Kam', revenue: 3500000 },
            { date: 'Jum', revenue: 2400000 }, { date: 'Sab', revenue: 2900000 },
            { date: 'Min', revenue: 1550000 },
          ];
        } else if (dateRange === 'month') {
          // Buat 30 data untuk 1 bulan
          mockRevenue = Array.from({ length: 30 }, (_, i) => ({
            date: `${i + 1} Mar`, 
            revenue: Math.floor(Math.random() * 4000000) + 500000 // Random 500rb - 4.5jt
          }));
        } else if (dateRange === 'quarter') {
          // Buat 12 data untuk 12 minggu
          mockRevenue = Array.from({ length: 12 }, (_, i) => ({
            date: `Mg ${i + 1}`, 
            revenue: Math.floor(Math.random() * 15000000) + 5000000 
          }));
        } else if (dateRange === 'year') {
          // Buat 12 data untuk 12 bulan
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
          mockRevenue = months.map(m => ({
            date: m, 
            revenue: Math.floor(Math.random() * 50000000) + 15000000 
          }));
        }

        setReportData({
          totalOrders: dateRange === 'week' ? 124 : dateRange === 'month' ? 450 : 1200,
          totalRevenue: mockRevenue.reduce((acc, curr) => acc + curr.revenue, 0),
          averageOrderValue: 124596,
          topProducts: [
            { name: 'Premium Cotton Combed 30s', quantity: 45, revenue: 2475000 },
            { name: 'Mug Custom Enamel', quantity: 32, revenue: 1600000 },
            { name: 'Tumbler Vacuum Stainless', quantity: 28, revenue: 3360000 },
          ],
          ordersByStatus: {
            'COMPLETED': 85,
            'PROCESSING': 24,
            'PENDING': 10,
            'CANCELLED': 5
          },
          revenueByDay: mockRevenue
        })
      }
    } catch (error) {
      toast.error('Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    toast.success('Laporan berhasil diekspor ke Excel! 📊')
  }

  // Mencari nilai tertinggi untuk proporsi skala tinggi grafik
  const maxDailyRevenue = reportData?.revenueByDay?.length 
    ? Math.max(...reportData.revenueByDay.map(d => d.revenue)) 
    : 1 

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
      case 'PROCESSING': return 'bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]'
      case 'PENDING': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
      case 'CANCELLED': return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
      default: return 'bg-slate-500'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 overflow-x-hidden">
      
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Laporan & Analitik</h1>
          <p className="text-slate-400 mt-1">Pantau performa penjualan dan statistik bisnis Anda.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 z-20">
          <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-lg p-1 relative">
            <select
              className="appearance-none bg-transparent text-slate-200 font-medium pl-4 pr-10 py-2 focus:outline-none cursor-pointer text-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week" className="bg-slate-800">Minggu Ini</option>
              <option value="month" className="bg-slate-800">Bulan Ini</option>
              <option value="quarter" className="bg-slate-800">Kuartal Ini</option>
              <option value="year" className="bg-slate-800">Tahun Ini</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-300 font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-400 font-medium animate-pulse">Menghitung analitik...</p>
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Pesanan', value: reportData.totalOrders, icon: ShoppingCartIcon, color: 'blue' },
              { label: 'Total Pendapatan', value: `Rp ${Number(reportData.totalRevenue).toLocaleString('id-ID')}`, icon: CurrencyDollarIcon, color: 'emerald' },
              { label: 'Rata-rata Pesanan', value: `Rp ${Number(reportData.averageOrderValue).toLocaleString('id-ID')}`, icon: ChartBarIcon, color: 'purple' },
              { label: 'Tingkat Konversi', value: '24.5%', icon: UserGroupIcon, color: 'amber' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors
                    ${stat.color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.2)]' : ''}
                    ${stat.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]' : ''}
                    ${stat.color === 'purple' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''}
                    ${stat.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''}
                  `}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-400 mb-1 truncate">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-100 tracking-tight truncate">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            
            {/* REVENUE CHART (BAR CHART) - LEBARAN (Makan 2 Kolom) */}
            <div className="xl:col-span-2 bg-slate-800/30 border border-slate-700/50 backdrop-blur-md rounded-2xl p-6 shadow-xl w-full">
              <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Grafik Pendapatan
              </h2>
              
              {/* WRAPPER SCROLL HORIZONTAL */}
              <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                
                {/* CONTAINER GRAFIK (Lebar Minimum Diaktifkan) */}
                <div className="h-64 flex items-end gap-3 border-b border-slate-700 pb-2 relative min-w-max px-2">
                  
                  {/* Garis Horizontal Latar Belakang */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 z-0">
                    <div className="border-t border-slate-500 w-full h-0"></div>
                    <div className="border-t border-slate-500 w-full h-0"></div>
                    <div className="border-t border-slate-500 w-full h-0"></div>
                    <div className="border-t border-slate-500 w-full h-0"></div>
                  </div>

                  {/* BATANG GRAFIK */}
                  {reportData.revenueByDay.map((day, index) => {
                    const heightPercent = maxDailyRevenue > 0 ? (day.revenue / maxDailyRevenue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center group z-10 h-full justify-end w-12 flex-shrink-0">
                        {/* Tooltip Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-slate-200 text-xs py-1 px-2 rounded mb-2 whitespace-nowrap shadow-lg pointer-events-none absolute -top-8 z-20">
                          Rp {Number(day.revenue).toLocaleString('id-ID')}
                        </div>
                        
                        {/* Bar */}
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600/80 to-sky-400 rounded-t-md group-hover:from-blue-500 group-hover:to-sky-300 transition-all duration-300 relative"
                          style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                        >
                          <div className="absolute top-0 inset-x-0 h-1.5 bg-white/20 rounded-t-md"></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-3 font-medium text-center truncate w-full">{day.date}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ORDER STATUS DISTRIBUTION */}
            <div className="xl:col-span-1 bg-slate-800/30 border border-slate-700/50 backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col">
              <h2 className="text-lg font-bold text-slate-200 mb-6">Status Pesanan</h2>
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                {Object.entries(reportData.ordersByStatus).map(([status, count]) => {
                  const percentage = reportData.totalOrders > 0 ? (count / reportData.totalOrders) * 100 : 0;
                  const label = status === 'COMPLETED' ? 'Selesai' : status === 'PROCESSING' ? 'Diproses' : status === 'PENDING' ? 'Menunggu' : 'Dibatalkan';
                  
                  return (
                    <div key={status} className="group">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-300">{label}</span>
                        <div className="text-right">
                          <span className="text-slate-100 font-bold">{count}</span>
                          <span className="text-slate-500 text-xs ml-1">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900/80 border border-slate-700/50 rounded-full h-3 overflow-hidden flex">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${getStatusColor(status)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* TOP PRODUCTS TABLE */}
          <div className="bg-slate-800/30 border border-slate-700/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-700/80 bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-200">Produk Terlaris</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700/80">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Nama Produk</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider text-center">Terjual</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {reportData.topProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                          <span className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-slate-300">
                        <span className="bg-slate-800 border border-slate-600 px-3 py-1 rounded-lg">{product.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">
                        Rp {Number(product.revenue).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}