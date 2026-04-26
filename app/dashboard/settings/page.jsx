'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import {
  Cog6ToothIcon, MapPinIcon, BanknotesIcon, QrCodeIcon, DevicePhoneMobileIcon, CurrencyDollarIcon,
  CloudArrowUpIcon, ArrowPathIcon, CheckCircleIcon, PlusIcon, TrashIcon, MegaphoneIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    whatsapp: '', email: '', gmapsEmbed: '', qrisImage: '', cryptoBtc: '', cryptoUsdt: '',
    socials: [], marketplaces: [], banks: [],
    // 🟢 STATE BARU UNTUK PROMO
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
            gmapsEmbed: data.gmapsEmbed || '',
            qrisImage: data.qrisImage || '',
            cryptoBtc: data.cryptoBtc || '',
            cryptoUsdt: data.cryptoUsdt || '',
            socials: data.socials || [],
            marketplaces: data.marketplaces || [],
            banks: data.banks || [],
            // 🟢 LOAD DATA PROMO
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
          <p className="text-slate-400 mt-2">Kelola kontak, promo, rekening, dan sosmed secara dinamis.</p>
        </div>
        <button onClick={handleSubmit} disabled={saving || uploading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-glow flex items-center gap-2">
          {saving ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="space-y-8">
        
        {/* 🟢 FITUR BARU: PAPAN PROMO */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800/50 border border-indigo-500/30 rounded-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><MegaphoneIcon className="w-6 h-6 text-indigo-400" /> Papan Pengumuman / Promo</h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="promoActive" checked={formData.promoActive} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              <span className="ml-3 text-sm font-bold text-slate-300">{formData.promoActive ? 'Aktif' : 'Nonaktif'}</span>
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

        {/* DATA UTAMA */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm text-slate-300 mb-2">WhatsApp Utama</label><input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100" /></div>
          <div><label className="block text-sm text-slate-300 mb-2">Email Utama</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100" /></div>
          <div className="md:col-span-2"><label className="block text-sm text-slate-300 mb-2">Google Maps Embed (src)</label><textarea name="gmapsEmbed" value={formData.gmapsEmbed} onChange={handleChange} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs" rows="3"/></div>
        </div>

        {/* DAFTAR BANK */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><BanknotesIcon className="w-6 h-6 text-blue-400" /> Rekening Bank</h2>
            <button onClick={() => addArrayItem('banks', { bank: '', number: '', owner: '' })} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><PlusIcon className="w-4 h-4"/> Tambah Bank</button>
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
                  <input placeholder="Platform (Instagram/TikTok)" value={item.name} onChange={(e) => handleArrayChange('socials', index, 'name', e.target.value)} className="w-1/3 px-3 py-2 bg-slate-800 rounded-lg text-sm text-white" />
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
                  <input placeholder="Platform (Shopee/Tokopedia)" value={item.name} onChange={(e) => handleArrayChange('marketplaces', index, 'name', e.target.value)} className="w-1/3 px-3 py-2 bg-slate-800 rounded-lg text-sm text-white" />
                  <input placeholder="URL Link" value={item.url} onChange={(e) => handleArrayChange('marketplaces', index, 'url', e.target.value)} className="flex-1 px-3 py-2 bg-slate-800 rounded-lg text-sm text-white" />
                  <button onClick={() => removeArrayItem('marketplaces', index)} className="p-2 text-rose-400"><TrashIcon className="w-5 h-5"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QRIS & CRYPTO */}
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
             <h2 className="font-bold text-slate-100 flex items-center gap-2"><CurrencyDollarIcon className="w-5 h-5 text-amber-400"/> Wallet Crypto</h2>
             <input placeholder="Alamat BTC" value={formData.cryptoBtc} onChange={handleChange} name="cryptoBtc" className="w-full px-4 py-2.5 bg-slate-900 rounded-lg text-sm text-amber-400 font-mono" />
             <input placeholder="Alamat USDT (BEP20)" value={formData.cryptoUsdt} onChange={handleChange} name="cryptoUsdt" className="w-full px-4 py-2.5 bg-slate-900 rounded-lg text-sm text-emerald-400 font-mono" />
          </div>
        </div>

      </div>
    </div>
  )
}