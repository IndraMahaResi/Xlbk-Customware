'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { StarIcon } from '@heroicons/react/24/solid'
import { CheckIcon, XMarkIcon, EyeIcon, TrashIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTestimonial, setSelectedTestimonial] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, approved

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials?all=true')
      const data = await res.json()
      setTestimonials(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Gagal memuat data testimoni')
      setTestimonials([])
    } finally {
      setLoading(false)
    }
  }

  const updateTestimonial = async (id, updates) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (res.ok) {
        toast.success('Status testimoni diperbarui')
        fetchTestimonials()
      } else {
        toast.error('Gagal memperbarui status')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan')
    }
  }

  const deleteTestimonial = async (id) => {
    if (!confirm('Yakin ingin menghapus testimoni ini secara permanen?')) return
    
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        toast.success('Testimoni berhasil dihapus')
        fetchTestimonials()
      } else {
        toast.error('Gagal menghapus testimoni')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan')
    }
  }

  const toggleApprove = (testimonial) => {
    updateTestimonial(testimonial.id, { isApproved: !testimonial.isApproved })
  }

  const toggleFeatured = (testimonial) => {
    updateTestimonial(testimonial.id, { featured: !testimonial.featured }) // Pastikan ini 'featured', bukan 'isFeatured' sesuai skema
  }

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'pending') return !t.isApproved
    if (filter === 'approved') return t.isApproved
    return true
  })

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon key={i} className={`h-4 w-4 ${i < rating ? 'text-amber-400' : 'text-slate-600'}`} />
    ))
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Manajemen Testimoni</h1>
          <p className="text-slate-400 mt-1">Kurasi ulasan pelanggan untuk ditampilkan di halaman utama.</p>
        </div>
        
        {/* Dropdown Filter */}
        <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-lg p-1 relative">
          <select
            className="appearance-none bg-transparent text-slate-200 font-medium pl-4 pr-10 py-2 focus:outline-none cursor-pointer text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all" className="bg-slate-800">Semua Testimoni</option>
            <option value="pending" className="bg-slate-800">Menunggu Persetujuan</option>
            <option value="approved" className="bg-slate-800">Telah Disetujui</option>
          </select>
          <div className="absolute right-3 pointer-events-none text-slate-400 text-xs">▼</div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-400 font-medium animate-pulse">Memuat testimoni...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTestimonials.length === 0 ? (
            <div className="col-span-full bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <p className="text-slate-400 font-medium">Tidak ada testimoni yang ditemukan untuk filter ini.</p>
            </div>
          ) : (
            filteredTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-slate-900/60 border border-slate-700/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col hover:border-blue-500/30 transition-colors group">
                
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600/20 to-sky-400/20 border border-blue-500/30 flex items-center justify-center">
                      <span className="font-bold text-blue-400 text-lg">
                        {testimonial.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{testimonial.name}</p>
                      <p className="text-xs text-slate-400">{testimonial.role || 'Pelanggan'}</p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col items-end gap-2">
                    {testimonial.isApproved ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                        <CheckBadgeIcon className="w-3 h-3"/> Disetujui
                      </span>
                    ) : (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                        <XMarkIcon className="w-3 h-3"/> Menunggu
                      </span>
                    )}
                    {testimonial.featured && (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        ⭐ Unggulan
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-3 bg-slate-800/50 w-fit px-3 py-1.5 rounded-lg border border-slate-700/50">
                  {renderStars(testimonial.rating)}
                  <span className="text-xs font-bold text-amber-400 ml-2">{testimonial.rating}/5</span>
                </div>
                
                {/* 🔥 PERBAIKAN: Menggunakan testimonial.content */}
                <p className="text-slate-300 italic mb-6 flex-1 text-sm leading-relaxed">
                  "{testimonial.content}" 
                </p>
                
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-700/50">
                  {/* Approve Toggle */}
                  <button
                    onClick={() => toggleApprove(testimonial)}
                    className={`p-2 rounded-lg transition-all border ${
                      testimonial.isApproved 
                        ? 'bg-slate-800 border-slate-600 text-slate-400 hover:text-rose-400 hover:border-rose-400/50'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                    }`}
                    title={testimonial.isApproved ? 'Batal Setujui' : 'Setujui & Tampilkan'}
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Featured Toggle */}
                  <button
                    onClick={() => toggleFeatured(testimonial)}
                    className={`p-2 rounded-lg transition-all border ${
                      testimonial.featured 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-amber-400 hover:border-amber-400/50'
                    }`}
                    title={testimonial.featured ? 'Hapus dari Unggulan' : 'Jadikan Testimoni Unggulan'}
                  >
                    <StarIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Detail Button */}
                  <button
                    onClick={() => setSelectedTestimonial(testimonial)}
                    className="p-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                    title="Lihat Detail"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTestimonial(testimonial.id)}
                    className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                    title="Hapus Permanen"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL DETAIL TESTIMONI */}
      {selectedTestimonial && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-100">Detail Testimoni</h3>
              <button onClick={() => setSelectedTestimonial(null)} className="text-slate-500 hover:text-rose-400 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Pengirim</p>
                <p className="font-bold text-slate-200 text-base">{selectedTestimonial.name}</p>
                {selectedTestimonial.email && <p className="text-slate-400">{selectedTestimonial.email}</p>}
                {selectedTestimonial.role && <p className="text-blue-400 mt-1">{selectedTestimonial.role}</p>}
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Penilaian</p>
                <div className="flex items-center gap-2">
                  <div className="flex">{renderStars(selectedTestimonial.rating)}</div>
                  <span className="font-bold text-amber-400">{selectedTestimonial.rating}/5.0</span>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Isi Testimoni</p>
                <p className="text-slate-300 italic leading-relaxed">"{selectedTestimonial.content}"</p>
              </div>

              <p className="text-xs text-slate-500 text-center pt-2">
                Dikirim pada: {new Date(selectedTestimonial.createdAt).toLocaleString('id-ID')}
              </p>
            </div>

            <button
              onClick={() => setSelectedTestimonial(null)}
              className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-600 transition-all"
            >
              Tutup Panel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}