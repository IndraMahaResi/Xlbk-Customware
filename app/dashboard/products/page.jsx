'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false) // 🟢 State loading upload
  
  // 1. STATE FORM DENGAN FIELD BARU
  const [formData, setFormData] = useState({
    name: '',
    category: 'KAOS',
    description: '',
    price: '',
    image: '',
    stock: true,
    minOrder: 'Bisa Satuan', 
    rating: '5.0',           
    sold: '0',               
  })

  const categories = ['SOUVENIR', 'MUG', 'TUMBLER', 'TOTEBAG', 'KAOS', 'BAJU', 'LAINNYA']

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      toast.error('Gagal memuat data produk')
    } finally {
      setLoading(false)
    }
  }

  // 🟢 FUNGSI BARU: Handle Upload Gambar
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm
      })
      const data = await res.json()
      if (data.url) {
        setFormData({ ...formData, image: data.url })
        toast.success('Gambar produk berhasil diunggah!')
      } else {
        toast.error('Gagal mendapatkan link gambar')
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat mengunggah gambar')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      // Pastikan tipe data sesuai (price dan rating jadi Number)
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        rating: parseFloat(formData.rating),
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(editingProduct ? 'Produk diperbarui' : 'Produk ditambahkan')
        setShowForm(false)
        setEditingProduct(null)
        setFormData({ name: '', category: 'KAOS', description: '', price: '', image: '', stock: true, minOrder: 'Bisa Satuan', rating: '5.0', sold: '0' })
        fetchProducts()
      } else {
        toast.error('Gagal menyimpan produk')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || '',
      price: product.price,
      image: product.image || '',
      stock: product.stock,
      minOrder: product.minOrder || 'Bisa Satuan',
      rating: product.rating || '5.0',
      sold: product.sold || '0',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Produk dihapus')
        fetchProducts()
      }
    } catch (error) {
      toast.error('Gagal menghapus produk')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Manajemen Produk</h1>
          <p className="text-slate-400 mt-1">Kelola inventaris dan lengkapi detail product card Anda.</p>
        </div>
        <button onClick={() => { setEditingProduct(null); setFormData({ name: '', category: 'KAOS', description: '', price: '', image: '', stock: true, minOrder: 'Bisa Satuan', rating: '5.0', sold: '0' }); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all font-bold text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Tambah Produk
        </button>
      </div>

      {/* MODAL FORM PRODUK (DIREVISI) */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-6 text-slate-100 border-b border-slate-700 pb-4">
              {editingProduct ? 'Edit Informasi Produk' : 'Input Produk Baru'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* KOLOM KIRI: INPUT FORM */}
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Nama Produk</label>
                    <input type="text" className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Kategori</label>
                      <select className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        {categories.map(cat => ( <option key={cat} value={cat} className="bg-slate-800">{cat}</option> ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Minimal Order</label>
                      <input type="text" className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Misal: Bisa Satuan" value={formData.minOrder} onChange={(e) => setFormData({...formData, minOrder: e.target.value})} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Harga (Rp)</label>
                      <input type="number" className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Rating</label>
                      <input type="number" step="0.1" min="0" max="5" className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Terjual</label>
                      <input type="text" className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Misal: 1.2k+" value={formData.sold} onChange={(e) => setFormData({...formData, sold: e.target.value})} required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Deskripsi Detail</label>
                    <textarea className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.checked})} className="w-5 h-5 rounded accent-blue-600 bg-slate-800 border-slate-600" />
                      <span className="text-sm font-medium text-slate-300">Produk Tersedia (In Stock)</span>
                    </label>
                  </div>
                </div>

                {/* KOLOM KANAN: PREVIEW PRODUCT CARD */}
                <div className="lg:col-span-5 flex flex-col space-y-5 border-t lg:border-t-0 lg:border-l border-slate-700/50 pt-6 lg:pt-0 lg:pl-8">
                  
                  {/* 🟢 REVISI AREA GAMBAR (URL & UPLOAD) */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Gambar Produk</label>
                    <div className="flex flex-col gap-3">
                      <input type="text" className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Masukkan URL gambar..." value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                      
                      <div className="flex items-center justify-center w-full">
                        <label className={`w-full flex flex-col items-center px-4 py-4 bg-slate-800/50 text-slate-300 rounded-xl border-2 border-dashed border-slate-600 cursor-pointer hover:bg-slate-800 hover:border-blue-500 transition-all ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {uploadingImage ? (
                            <span className="text-sm font-medium animate-pulse">⏳ Mengunggah gambar...</span>
                          ) : (
                            <div className="flex flex-col items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                              </svg>
                              <span className="text-sm font-medium">Unggah File dari Perangkat</span>
                              <span className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG</span>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-slate-300">Pratinjau Product Card</label>
                    {/* Miniatur ProductCard */}
                    <div className="w-full max-w-[250px] mx-auto rounded-2xl bg-slate-800/40 border border-slate-700/50 overflow-hidden flex flex-col relative">
                      <div className="relative w-full aspect-square bg-slate-900 overflow-hidden">
                        {formData.image ? (
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover opacity-90" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                            <span className="text-xs">No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute top-2 left-2 z-10"><span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{formData.category}</span></div>
                        <div className="absolute top-2 right-2 z-10"><span className="bg-slate-900/80 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-md">{formData.minOrder || 'Bisa Satuan'}</span></div>
                      </div>
                      <div className="p-4 flex flex-col z-10">
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                          <span className="text-amber-400">★ {formData.rating || '0.0'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                          <span>Terjual {formData.sold || '0'}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-100 line-clamp-1">{formData.name || 'Nama Produk'}</h3>
                        <p className="text-blue-400 font-bold mt-1 text-sm">Rp {Number(formData.price || 0).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-700/50 mt-8">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all">Batal</button>
                <button type="submit" disabled={uploadingImage} className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] ${uploadingImage ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}>
                  {editingProduct ? 'Simpan Perubahan' : 'Tambahkan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE DATA PRODUK */}
      <div className="bg-slate-800/30 border border-slate-700/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700/80">
                <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase">Produk</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase">Kategori</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase">Harga</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {products.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">Belum ada produk.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden">
                          {product.image && <img src={product.image} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{product.name}</div>
                          <div className="text-xs text-slate-400 flex gap-2">
                            <span>★ {product.rating}</span> • <span>Terjual {product.sold}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-xs px-3 py-1 rounded-full bg-blue-600/90 text-white">{product.category}</span></td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-200">Rp {product.price.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(product)} className="text-blue-400 hover:text-blue-300 mr-4 font-medium text-sm">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300 font-medium text-sm">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}