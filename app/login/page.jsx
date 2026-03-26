'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        // Pembersihan cache lama
        localStorage.clear()

        // Simpan data baru
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Sinkronisasi Cookie untuk Middleware
        document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`
        
        toast.success('Berhasil masuk! Selamat datang kembali. 🎉')

        // Gunakan window.location agar state Layout Dashboard ter-reset total
        window.location.href = redirectTo 
      } else {
        toast.error(data.error || 'Email atau password salah')
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error('Terjadi kesalahan sistem, coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">
      
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Login Card */}
      <div className="bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
            <LockClosedIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Selamat Datang di <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">XLBK</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Masuk untuk mengelola Dashboard Admin.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Alamat Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="admin@xlbk.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-500 disabled:bg-slate-800 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 mt-8"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Memverifikasi...
              </div>
            ) : (
              <>
                Masuk ke Dashboard <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="absolute bottom-6 inset-x-0 text-center pointer-events-none">
        <p className="text-xs text-slate-600 font-medium tracking-widest uppercase">XLBK Customwear © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}