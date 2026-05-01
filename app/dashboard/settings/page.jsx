'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import {
  Cog6ToothIcon, MapPinIcon, BanknotesIcon, QrCodeIcon, CurrencyDollarIcon,
  ArrowPathIcon, CheckCircleIcon, PlusIcon, TrashIcon, MegaphoneIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    whatsapp: '', email: '', address: '', gmapsEmbed: '', qrisImage: '', cryptoBtc: '', cryptoUsdt: '',
    socials: [], marketplaces: [], banks: [],
    promoActive: false, promoMessage: '', promoLink: '', promoButtonText: ''
  })

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFormData({
            whatsapp: data.whatsapp || '',
            email: data.email || '',
            address: data.address || '',
            gmapsEmbed: data.gmapsEmbed || '',
            qrisImage: data.qrisImage || '',
            cryptoBtc: data.cryptoBtc || '',
            cryptoUsdt: data.cryptoUsdt || '',
            socials: data.socials || [],
            marketplaces: data.marketplaces || [],
            banks: data.banks || [],
            promoActive: data.promoActive || false,
            promoMessage: data.promoMessage || '',
            promoLink: data.promoLink || '',
            promoButtonText: data.promoButtonText || ''
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const addArrayItem = (field, defaultObj) => setFormData({ ...formData, [field]: [...formData[field], defaultObj] })
  const removeArrayItem = (field, index) => setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) })
  const handleArrayChange = (field, index, key, value) => {
    const newArray = [...formData[field]]; newArray[index][key] = value; setFormData({ ...formData, [field]: newArray })
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleQrisUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    try {
      const uploadForm = new FormData(); uploadForm.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: uploadForm })
      const data = await res.json()
      if (data.url) { setFormData({ ...formData, qrisImage: data.url }); toast.success('QRIS diunggah!') }
    } catch (err) { toast.error('Upload gagal') } finally { setUploading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      })
      if (res.ok) toast.success('Pengaturan disimpan! 🎉')
      else toast.error('Gagal menyimpan')
    } catch (err) { toast.error('Sistem error') } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><ArrowPathIcon className="w-8 h-8 animate-spin text-slate-400" /></div>

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Cog6ToothIcon className="w-8 h-8 text-blue-500" /> Pengaturan Toko
          </h1>
          <p className="text-slate-400 mt-2">
            Kelola kontak, promo, rekening, dan sosmed secara dinamis.
          </p>
        </div>
        <button onClick={handleSubmit} disabled={saving || uploading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-glow flex items-center gap-2">
          {saving ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="space-y-8">
        
        {/* PAPAN PROMO */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800/50 border border-indigo-500/30 rounded-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><MegaphoneIcon className="w-6 h-6 text-indigo-400" /> Papan Pengumuman / Promo</h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="promoActive" checked={formData.promoActive} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              <span className="ml-3 text-sm font-bold text-slate-300">
                {formData.promoActive ? "Aktif" : "Nonaktif"}
              </span>
            </label>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all ${formData.promoActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-2">Teks Pengumuman</label>
              <input type="text" name="promoMessage" value={formData.promoMessage} onChange={handleChange} placeholder="Contoh: Diskon 20% untuk pembelian Kaos hari ini!" className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Link Tombol (Opsional)</label>
              <input type="text" name="promoLink" value={formData.promoLink} onChange={handleChange} placeholder="/products atau https://..." className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Teks Tombol (Opsional)</label>
              <input type="text" name="promoButtonText" value={formData.promoButtonText} onChange={handleChange} placeholder="Beli Sekarang" className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 focus:border-indigo-500 outline-none" />
            </div>
          </div>
        </div>

        {/* KONTAK & ALAMAT */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
           <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-4"><MapPinIcon className="w-6 h-6 text-emerald-400" /> Kontak & Lokasi</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className="block text-sm text-slate-300 mb-2">WhatsApp Utama</label><input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100" /></div>
             <div><label className="block text-sm text-slate-300 mb-2">Email Utama</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100" /></div>
             <div className="md:col-span-2"><label className="block text-sm text-slate-300 mb-2">Alamat Lengkap</label><textarea name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 resize-none" rows="3" placeholder="Masukkan alamat lengkap dengan menekan Enter untuk baris baru..."/></div>
             <div className="md:col-span-2"><label className="block text-sm text-slate-300 mb-2">Link Embed Google Maps (src)</label><textarea name="gmapsEmbed" value={formData.gmapsEmbed} onChange={handleChange} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs resize-none" rows="2" placeholder="Contoh: https://www.google.com/maps/embed?pb=..." /></div>
           </div>
        </div>

        {/* DAFTAR BANK */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><BanknotesIcon className="w-6 h-6 text-blue-400" /> Rekening Bank</h2>
            <button onClick={() => addArrayItem('banks', { bank: '', number: '', owner: '' })} className="bg-slate-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 text-white"><PlusIcon className="w-4 h-4"/> Tambah</button>
          </div>
          <div className="space-y-4">
            {formData.banks.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 bg-slate-900/50 p-4 border border-slate-700 rounded-xl relative group">
                <input placeholder="Nama Bank (cth: BCA)" value={item.bank} onChange={(e) => handleArrayChange('banks', index, 'bank', e.target.value)} className="flex-1 px-3 py-2 bg-slate-800 rounded-lg text-sm text-white border border-slate-600" />
                <input placeholder="No. Rekening" value={item.number} onChange={(e) => handleArrayChange('banks', index, 'number', e.target.value)} className="flex-1 px-3 py-2 bg-slate-800 rounded-lg text-sm text-white border border-slate-600" />
                <input placeholder="Atas Nama" value={item.owner} onChange={(e) => handleArrayChange('banks', index, 'owner', e.target.value)} className="flex-1 px-3 py-2 bg-slate-800 rounded-lg text-sm text-white border border-slate-600" />
                <button onClick={() => removeArrayItem('banks', index)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-colors"><TrashIcon className="w-5 h-5"/></button>
              </div>
            ))}
            {formData.banks.length === 0 && <p className="text-slate-500 text-sm italic">Belum ada bank. Klik Tambah Bank.</p>}
          </div>
        </div>

        {/* SOSMED & E-COMMERCE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <h2 className="font-bold text-slate-100">Sosial Media</h2>
              <button onClick={() => addArrayItem('socials', { name: '', url: '' })} className="bg-slate-700 px-3 py-1 rounded-lg text-sm text-white flex items-center gap-1"><PlusIcon className="w-4 h-4"/></button>
            </div>
            <div className="space-y-3">
              {formData.socials.map((item, index) => (
                <div key={index} className="flex gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
                  <input placeholder="Platform" value={item.name} onChange={(e) => handleArrayChange('socials', index, 'name', e.target.value)} className="w-1/3 px-3 py-2 bg-slate-800 rounded-lg text-sm text-white" />
                  <input placeholder="URL Link" value={item.url} onChange={(e) => handleArrayChange('socials', index, 'url', e.target.value)} className="flex-1 px-3 py-2 bg-slate-800 rounded-lg text-sm text-white" />
                  <button onClick={() => removeArrayItem('socials', index)} className="p-2 text-rose-400"><TrashIcon className="w-5 h-5"/></button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <h2 className="font-bold text-slate-100">Marketplace</h2>
              <button onClick={() => addArrayItem('marketplaces', { name: '', url: '' })} className="bg-slate-700 px-3 py-1 rounded-lg text-sm text-white flex items-center gap-1"><PlusIcon className="w-4 h-4"/></button>
            </div>
            <div className="space-y-3">
              {formData.marketplaces.map((item, index) => (
                <div key={index} className="flex gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
                  <input placeholder="Platform" value={item.name} onChange={(e) => handleArrayChange('marketplaces', index, 'name', e.target.value)} className="w-1/3 px-3 py-2 bg-slate-800 rounded-lg text-sm text-white" />
                  <input placeholder="URL Link" value={item.url} onChange={(e) => handleArrayChange('marketplaces', index, 'url', e.target.value)} className="flex-1 px-3 py-2 bg-slate-800 rounded-lg text-sm text-white" />
                  <button onClick={() => removeArrayItem('marketplaces', index)} className="p-2 text-rose-400"><TrashIcon className="w-5 h-5"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QRIS & CRYPTO (DENGAN LOGO) */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
             <h2 className="font-bold text-slate-100 mb-4 flex items-center gap-2"><QrCodeIcon className="w-5 h-5 text-indigo-400"/> Upload QRIS</h2>
             <div className="flex items-center gap-4">
               <div className="w-24 h-24 bg-slate-900 border-2 border-slate-600 rounded-xl relative overflow-hidden">
                 {formData.qrisImage ? <Image src={formData.qrisImage} alt="QRIS" fill className="object-contain" /> : null}
               </div>
               <label className="cursor-pointer px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600">
                  {uploading ? 'Mengunggah...' : 'Ganti QRIS'}
                  <input type="file" accept="image/*" onChange={handleQrisUpload} className="hidden" />
               </label>
             </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="font-bold text-slate-100 flex items-center gap-2 mb-4">
              <CurrencyDollarIcon className="w-5 h-5 text-amber-400" /> Wallet Crypto
            </h2>
             
            {/* Input BTC dengan Logo */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[#F7931A]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.077 10.278c1.076-.23 1.884-.852 1.884-2.181 0-1.853-1.464-2.458-3.56-2.458H10.15V2h-1.87v3.639H6.942V2h-1.87v3.639H2v1.87h1.411c.883 0 1.25.437 1.25 1.118v7.243c0 .351-.122.846-1.01.846H2v1.87h3.082v3.744h1.87v-3.744h1.338v3.744h1.87v-3.744c2.616 0 4.316-.763 4.316-3.085 0-1.503-1.042-2.441-2.399-2.614zm-2.584-2.903h1.498c.845 0 1.543.344 1.543 1.157 0 .863-.787 1.178-1.543 1.178h-1.498V7.375zm1.751 7.424h-1.751v-2.348h1.751c.969 0 1.77.382 1.77 1.222 0 .839-.81 1.126-1.77 1.126z"/>
                </svg>
              </div>
              <input 
                placeholder="Alamat BTC" 
                value={formData.cryptoBtc} 
                onChange={handleChange} 
                name="cryptoBtc" 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-[#F7931A] outline-none rounded-lg text-sm text-amber-400 font-mono transition-colors" 
              />
            </div>

            {/* Input USDT dengan Logo */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[#26A17B]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zM13.682 10.42v6.23h-3.364v-6.23H6.077V7.124h11.846v3.296h-4.241z"/>
                </svg>
              </div>
              <input 
                placeholder="Alamat USDT (BEP20)" 
                value={formData.cryptoUsdt} 
                onChange={handleChange} 
                name="cryptoUsdt" 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-[#26A17B] outline-none rounded-lg text-sm text-emerald-400 font-mono transition-colors" 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}