'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { MegaphoneIcon, CloudArrowUpIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function PromoDashboard() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '', badge: '' })

  useEffect(() => { fetchPromos() }, [])

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/promo')
      setPromos(await res.json())
    } catch (err) { toast.error('Gagal mengambil data') } finally { setLoading(false) }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    try {
      const uploadForm = new FormData(); uploadForm.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: uploadForm })
      const data = await res.json()
      if (data.url) { setFormData({ ...formData, imageUrl: data.url }); toast.success('Gambar diunggah!') }
    } catch (err) { toast.error('Gagal upload') } finally { setUploading(false) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.imageUrl) return toast.error('Judul dan Gambar wajib diisi!')
    try {
      const res = await fetch('/api/promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success('Promo ditambahkan!')
        setFormData({ title: '', description: '', imageUrl: '', badge: '' })
        fetchPromos()
      }
    } catch (err) { toast.error('Terjadi kesalahan') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus promo ini?')) return
    try {
      await fetch(`/api/promo/${id}`, { method: 'DELETE' }); toast.success('Dihapus!'); fetchPromos()
    } catch (err) { toast.error('Gagal menghapus') }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <MegaphoneIcon className="w-8 h-8 text-rose-500" /> Event & Diskon
        </h1>
        <p className="text-slate-400 mt-2">Atur banner promosi, diskon, atau event toko di sini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah */}
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-white mb-6">Tambah Promo Baru</h2>
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="relative group cursor-pointer border-2 border-dashed border-slate-700 rounded-xl overflow-hidden bg-slate-800/50 aspect-video flex flex-col items-center justify-center hover:border-rose-500 transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" disabled={uploading} />
              {formData.imageUrl ? (
                <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
              ) : uploading ? (
                <div className="text-rose-500 flex flex-col items-center"><ArrowPathIcon className="w-8 h-8 animate-spin mb-2" /> Uploading...</div>
              ) : (
                <div className="text-slate-400 flex flex-col items-center group-hover:text-rose-400"><CloudArrowUpIcon className="w-10 h-10 mb-2" /> <span className="text-sm">Upload Banner (16:9)</span></div>
              )}
            </div>

            <div><label className="text-sm text-slate-300">Judul Promo</label><input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-rose-500" required /></div>
            <div><label className="text-sm text-slate-300">Label / Badge</label><input type="text" value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-rose-500" placeholder="Cth: DISKON 50%" /></div>
            <div><label className="text-sm text-slate-300">Deskripsi Singkat</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-rose-500 resize-none" rows="3" /></div>
            
            <button type="submit" disabled={uploading || !formData.imageUrl} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all shadow-glow disabled:opacity-50">Simpan Promo</button>
          </form>
        </div>

        {/* Daftar Promo */}
        <div className="lg:col-span-2">
          {loading ? <ArrowPathIcon className="w-8 h-8 mx-auto text-slate-500 animate-spin"/> : promos.length === 0 ? <div className="p-12 text-center text-slate-500 border border-slate-800 border-dashed rounded-2xl">Belum ada promo aktif.</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promos.map((item) => (
                <div key={item.id} className="group relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="aspect-video relative">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    {item.badge && <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">{item.badge}</span>}
                    <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500 transition-all"><TrashIcon className="w-4 h-4"/></button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                    {item.description && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{item.description}</p>}
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