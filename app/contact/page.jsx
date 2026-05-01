'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { toast } from 'react-hot-toast'
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

export default function Contact() {
  const [settings, setSettings] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error(err))
  }, [])

  const waNumber = settings?.whatsapp || '6281283433771'
  const emailAddress = settings?.email || 'xlbk.customwear@gmail.com'
  const gmapsLink = settings?.gmapsEmbed || "https://maps.google.com/maps?q=Perum%20Papan%20Indah%20Tambun&t=&z=13&ie=UTF8&iwloc=&output=embed"
  const socials = settings?.socials || []
  const marketplaces = settings?.marketplaces || []
  
  // 🟢 VARIABEL ALAMAT DINAMIS
  const address = settings?.address || 'Perum Papan Indah No 29,\nMangunjaya, Tambun Selatan,\nKab. Bekasi, Jawa Barat'

  const renderIcon = (name) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('instagram')) return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
    if (lowerName.includes('shopee')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
    if (lowerName.includes('tokopedia')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
    if (lowerName.includes('tiktok')) return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
    return <span className="font-bold text-sm">{name.charAt(0)}</span>
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) {
        toast.success('Pesan terkirim!')
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      } else toast.error('Gagal mengirim')
    } catch (err) { toast.error('Terjadi kesalahan') } finally { setLoading(false) }
  }

  return (
    <>
      <Navbar />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>
      
      <section className="pt-32 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-blue-100 to-blue-400">Hubungi Kami</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Ada pertanyaan tentang custom order, pengadaan B2B, atau hal lainnya? Kami siap membantu mewujudkan ide Anda.</p>
        </div>
      </section>

      <section className="relative z-10 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-6 hover:-translate-y-1 transition-all"><div className="text-emerald-400 bg-emerald-500/10 border-emerald-500/20 w-14 h-14 rounded-xl flex items-center justify-center border mb-5"><PhoneIcon className="h-7 w-7" /></div><h3 className="text-lg font-bold text-slate-100 mb-3">WhatsApp / Telepon</h3><p className="text-slate-300 text-sm">+{waNumber}</p></div>
            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-6 hover:-translate-y-1 transition-all"><div className="text-blue-400 bg-blue-500/10 border-blue-500/20 w-14 h-14 rounded-xl flex items-center justify-center border mb-5"><EnvelopeIcon className="h-7 w-7" /></div><h3 className="text-lg font-bold text-slate-100 mb-3">Email</h3><p className="text-slate-300 text-sm break-all">{emailAddress}</p></div>
            
            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-6 hover:-translate-y-1 transition-all">
              <div className="text-rose-400 bg-rose-500/10 border-rose-500/20 w-14 h-14 rounded-xl flex items-center justify-center border mb-5">
                <MapPinIcon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">Alamat</h3>
              {/* 🟢 TAMPILAN ALAMAT */}
              <p className="text-slate-300 text-sm whitespace-pre-line">{address}</p>
            </div>
            
            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-6 hover:-translate-y-1 transition-all"><div className="text-purple-400 bg-purple-500/10 border-purple-500/20 w-14 h-14 rounded-xl flex items-center justify-center border mb-5"><ClockIcon className="h-7 w-7" /></div><h3 className="text-lg font-bold text-slate-100 mb-3">Jam Operasional</h3><p className="text-slate-300 text-sm">Senin-Sabtu: 09:00 - 18:00</p></div>
          </div>
        </div>
      </section>

      <section className="relative z-10 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-slate-900/60 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
               <h2 className="text-2xl font-bold text-slate-100 mb-6">Kirim Pesan Langsung</h2>
               <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div><input type="text" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100" placeholder="Nama" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                   <div><input type="email" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div><input type="tel" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100" placeholder="WA" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
                   <div><input type="text" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100" placeholder="Subjek" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required /></div>
                 </div>
                 <div><textarea rows="5" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 resize-none" placeholder="Pesan..." value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required /></div>
                 <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl">{loading ? 'Mengirim...' : 'Kirim Pesan'}</button>
               </form>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-3xl p-6 h-[300px] overflow-hidden relative">
                <iframe src={gmapsLink} width="100%" height="100%" style={{ border: 0 }} className="rounded-xl opacity-70 hover:opacity-100 transition-all duration-500"></iframe>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-3xl p-8">
                <h3 className="text-xl font-bold text-slate-100 mb-6">Temukan Kami</h3>
                <div className="flex flex-wrap gap-4">
                  {[...socials, ...marketplaces].map((item, idx) => (
                    <a key={idx} href={item.url} target="_blank" rel="noreferrer" title={item.name} className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                      {renderIcon(item.name)}
                    </a>
                  ))}
                  <a href={`mailto:${emailAddress}`} title="Email" className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                    <EnvelopeIcon className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 relative z-10 px-6">
        <div className="max-w-4xl mx-auto bg-[#25D366]/10 border border-[#25D366]/30 p-10 text-center rounded-3xl backdrop-blur-md">
          <h2 className="text-2xl font-bold text-slate-100 mb-3">Butuh Respons Lebih Cepat?</h2>
          <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-[#25D366] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#20b858]">
            <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2" /> Chat Admin
          </a>
        </div>
      </section>
    </>
  )
}