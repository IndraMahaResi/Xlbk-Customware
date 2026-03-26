'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { toast } from 'react-hot-toast'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

export default function SubmitTestimonial() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    productName: '',
    message: '',
    rating: 5
  })
  const [hoverRating, setHoverRating] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.message) {
      toast.error('Mohon isi nama dan pesan testimoni')
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Testimoni berhasil dikirim! Menunggu persetujuan admin.')
        router.push('/')
      } else {
        toast.error(data.error || 'Gagal mengirim testimoni')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = () => {
    return [...Array(5)].map((_, i) => {
      const ratingValue = i + 1
      return (
        <button
          key={i}
          type="button"
          onClick={() => setFormData({...formData, rating: ratingValue})}
          onMouseEnter={() => setHoverRating(ratingValue)}
          onMouseLeave={() => setHoverRating(0)}
          className="focus:outline-none"
        >
          {ratingValue <= (hoverRating || formData.rating) ? (
            <StarIcon className="h-8 w-8 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="h-8 w-8 text-gray-500" />
          )}
        </button>
      )
    })
  }

  return (
    <>
      <Navbar />
      <div className="pt-28 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">⭐</div>
              <h1 className="text-2xl font-bold text-slate-100 mb-2">
                Bagikan Pengalaman Anda
              </h1>
              <p className="text-slate-400">
                Ceritakan pengalaman Anda menggunakan layanan Xlbk Customwear
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {renderStars()}
                </div>
              </div>
              
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:border-blue-500 focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:border-blue-500 focus:outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              {/* Posisi/Role */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Posisi / Jabatan (Opsional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:border-blue-500 focus:outline-none"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  placeholder="Contoh: CEO Startup, Owner Brand, dll"
                />
              </div>
              
              {/* Nama Produk */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Produk yang Dibeli (Opsional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:border-blue-500 focus:outline-none"
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  placeholder="Contoh: Kaos Custom, Mug Premium, dll"
                />
              </div>
              
              {/* Pesan */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Pesan Testimoni *
                </label>
                <textarea
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 focus:border-blue-500 focus:outline-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Ceritakan pengalaman Anda..."
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition disabled:bg-slate-600"
              >
                {loading ? 'Mengirim...' : 'Kirim Testimoni'}
              </button>
            </form>
            
            <p className="text-xs text-slate-500 text-center mt-6">
              Testimoni akan ditampilkan setelah disetujui oleh admin
            </p>
          </div>
        </div>
      </div>
    </>
  )
}