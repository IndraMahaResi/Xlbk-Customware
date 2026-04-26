'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { PhotoIcon, CloudArrowUpIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function HasilKaryaPage() {
  const [karyaList, setKaryaList] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '' })

  useEffect(() => {
    fetchKarya()
  }, [])

  const fetchKarya = async () => {
    try {
      const res = await fetch('/api/hasil-karya')
      const data = await res.json()
      setKaryaList(data)
    } catch (error) {
      toast.error('Gagal mengambil data karya')
    } finally {
      setLoading(false)
    }
  }

  // Handle Upload Image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      
      const res = await fetch('/api/upload', { method: 'POST', body: uploadForm })
      const data = await res.json()
      
      if (data.url) {
        setFormData({ ...formData, imageUrl: data.url })
        toast.success('Gambar berhasil diunggah')
      }
    } catch (error) {
      toast.error('Gagal mengunggah gambar')
    } finally {
      setUploading(false)
    }
  }

  // Handle Save New Karya
  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.imageUrl) {
      return toast.error('Judul dan Gambar wajib diisi!')
    }

    try {
      const res = await fetch('/api/hasil-karya', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success('Hasil Karya berhasil ditambahkan!')
        setFormData({ title: '', description: '', imageUrl: '' })
        fetchKarya()
      } else {
        toast.error('Gagal menyimpan karya')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  // Handle Delete Karya
  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus karya ini?')) return

    try {
      const res = await fetch(`/api/hasil-karya/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Karya berhasil dihapus')
        fetchKarya()
      }
    } catch (error) {
      toast.error('Gagal menghapus karya')
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <PhotoIcon className="w-8 h-8 text-emerald-500" /> Hasil Karya (Portfolio)
        </h1>
        <p className="text-slate-400 mt-2">Upload foto-foto hasil produksi terbaik Anda untuk ditampilkan di beranda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Form Upload */}
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-white mb-6">Tambah Karya Baru</h2>
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Image Preview / Upload */}
            <div className="relative group cursor-pointer border-2 border-dashed border-slate-700 rounded-xl overflow-hidden bg-slate-800/50 aspect-square flex flex-col items-center justify-center hover:border-emerald-500 transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" disabled={uploading} />
              
              {formData.imageUrl ? (
                <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
              ) : uploading ? (
                <div className="flex flex-col items-center text-emerald-500"><ArrowPathIcon className="w-8 h-8 animate-spin mb-2" /> Uploading...</div>
              ) : (
                <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-400">
                  <CloudArrowUpIcon className="w-10 h-10 mb-2" />
                  <span className="text-sm font-medium">Klik untuk Upload Foto</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Judul Karya / Proyek</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none" placeholder="Cth: Sablon Kaos Reuni Akbar" required />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Deskripsi Singkat (Opsional)</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none resize-none" rows="3" placeholder="Bahan cotton combed 30s..."></textarea>
            </div>

            <button type="submit" disabled={uploading || !formData.imageUrl} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-glow disabled:opacity-50">
              Simpan Karya
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Daftar Karya */}
        <div className="lg:col-span-2">
          {loading ? (
             <div className="flex justify-center py-20"><ArrowPathIcon className="w-8 h-8 text-slate-500 animate-spin"/></div>
          ) : karyaList.length === 0 ? (
             <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500">
               Belum ada karya yang diupload.
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {karyaList.map((karya) => (
                <div key={karya.id} className="group relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden aspect-[4/3]">
                  <Image src={karya.imageUrl} alt={karya.title} fill className="object-cover" />
                  
                  {/* Overlay Delete */}
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                    <div className="text-right">
                      <button onClick={() => handleDelete(karya.id)} className="bg-rose-600 text-white p-2 rounded-lg hover:bg-rose-500 transition-colors shadow-lg">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{karya.title}</h3>
                      {karya.description && <p className="text-slate-400 text-sm line-clamp-2 mt-1">{karya.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}