'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
// 🔥 REVISI: Tambahkan CheckCircleIcon di import ini
import { InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function OrderPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState([])
  const [uploadedFile, setUploadedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    countryOrigin: 'Indonesia', 
    address: '',
    designNotes: '',
    notes: '',
    paymentMethod: 'BANK_TRANSFER', 
    paymentType: 'FULL', // 🟢 REVISI: Tambahkan state default untuk tipe pembayaran
  })

  useEffect(() => {
    fetchProducts()
    const productId = searchParams.get('product')
    if (productId) {
      setTimeout(() => {
        addToCart(productId)
      }, 500)
    }
  }, [searchParams])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const addToCart = (productId) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      const existingItem = cart.find(item => item.productId === productId)
      if (existingItem) {
        setCart(cart.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
        toast.success(`Kuantitas ${product.name} ditambah`)
      } else {
        setCart([...cart, {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          notes: ''
        }])
        toast.success(`${product.name} masuk keranjang`)
      }
    }
  }

  const updateCartItem = (index, field, value) => {
    const newCart = [...cart]
    newCart[index][field] = value
    setCart(newCart)
  }

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal()
  }

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          setFilePreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
      
      toast.success('File desain berhasil dipilih')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/postscript': ['.ai', '.eps'],
      'image/vnd.adobe.photoshop': ['.psd']
    },
    maxSize: 10 * 1024 * 1024
  })

  // ======================================================================
  // 🔥 FUNGSI 1: SUBMIT ORDER LOKAL (INDONESIA)
  // ======================================================================
  const handleSubmitOrder = async () => {
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error('Mohon lengkapi data diri Anda')
      setCurrentStep(3)
      return
    }

    if (cart.length === 0) {
      toast.error('Silakan tambahkan produk ke keranjang')
      setCurrentStep(1)
      return
    }

    setIsSubmitting(true)

    try {
      let designFileUrl = null
      if (uploadedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', uploadedFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
        const uploadData = await uploadRes.json()
        designFileUrl = uploadData.url
      }

      const orderData = {
        ...formData, // 🟢 data paymentType otomatis ikut terkirim di sini
        designFile: designFileUrl,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        })),
        subtotal: calculateSubtotal(),
        total: calculateTotal()
      }

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Order berhasil dibuat! 🎉')
        router.push(`/payment/${data.orderId}?total=${orderData.total}&payType=${formData.paymentType}`)
      } else {
        toast.error(data.error || 'Gagal membuat pesanan')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      toast.error('Terjadi kesalahan sistem, silakan coba lagi')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ======================================================================
  // 🔥 FUNGSI 2: SUBMIT ORDER LUAR NEGERI (SIMPAN DB -> BUKA WA -> REDIRECT)
  // ======================================================================
  const submitInternationalOrder = async () => {
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error('Mohon lengkapi Data Diri di Step 3')
      setCurrentStep(3)
      return
    }

    if (cart.length === 0) {
      toast.error('Silakan tambahkan produk ke keranjang')
      setCurrentStep(1)
      return
    }

    setIsSubmitting(true)

    try {
      let designFileUrl = null
      if (uploadedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', uploadedFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
        const uploadData = await uploadRes.json()
        designFileUrl = uploadData.url
      }

      const orderData = {
        ...formData,
        paymentMethod: 'BANK_TRANSFER', 
        status: 'NEED_VERIFICATION', 
        designFile: designFileUrl,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        })),
        subtotal: calculateSubtotal(),
        total: calculateTotal()
      }

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Pesanan dicatat! Mengalihkan ke WhatsApp...')
        
        const adminWaNumber = "6281283433771";
        let itemsText = cart.map(item => `- ${item.quantity}x ${item.productName}`).join('%0A');
        
        const message = `Halo Admin XLBK, saya membuat pesanan *Luar Negeri* (International Order) dengan sistem pembayaran *${formData.paymentType}*.%0A%0A*No. Invoice:* ${data.invoiceNumber}%0A*Nama:* ${formData.customerName}%0A*Negara:* ${formData.countryOrigin}%0A%0A*Detail:*%0A${itemsText}%0A%0AMohon bantuan untuk kalkulasi ongkos kirim ke negara saya. Terima kasih!`;
        
        window.open(`https://wa.me/${adminWaNumber}?text=${message}`, '_blank');
        
        router.push(`/payment/${data.orderId}`)
      } else {
        toast.error(data.error || 'Gagal membuat pesanan internasional')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem, silakan coba lagi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: 'Produk', icon: '🛍️' },
    { number: 2, title: 'Desain', icon: '🎨' },
    { number: 3, title: 'Data Diri', icon: '📝' },
    { number: 4, title: 'Pembayaran', icon: '💳' },
  ]

  return (
    <>
      <Navbar />
      
      <div className="pt-28 pb-20 min-h-screen relative z-10 overflow-hidden">
        
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 tracking-tight mb-4">
              Buat <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">Pesanan</span> Baru
            </h1>
          </div>

          <div className="mb-12 relative">
            <div className="flex justify-between items-center max-w-3xl mx-auto relative z-10">
              {steps.map((step, index) => (
                <div key={step.number} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold mb-3 transition-all duration-500 relative z-10
                      ${currentStep === step.number ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-110' : 
                        currentStep > step.number ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                        'bg-slate-800/50 text-slate-500 border border-slate-700'}
                    `}>
                      {currentStep > step.number ? '✓' : step.icon}
                    </div>
                    <div className="text-xs sm:text-sm text-center font-medium">
                      <span className={currentStep === step.number ? 'text-blue-400' : currentStep > step.number ? 'text-slate-300' : 'text-slate-500'}>
                        {step.title}
                      </span>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-[24px] left-[50%] w-full h-[2px] -z-10">
                      <div className={`h-full transition-all duration-500 ${currentStep > step.number ? 'bg-blue-500/50' : 'bg-slate-700/50'}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

            {/* STEP 1: PRODUCT */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Pilih Base Produk</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {products.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-slate-500 animate-pulse">Memuat produk...</div>
                  ) : products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product.id)}
                      className="flex flex-col text-left bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300 group shadow-lg"
                    >
                      <div className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors text-lg mb-1">{product.name}</div>
                      <div className="text-xs font-medium px-2 py-1 bg-slate-700/50 text-slate-300 rounded-md w-fit mb-3">{product.category}</div>
                      <div className="text-slate-100 font-bold mt-auto pt-2 border-t border-slate-700/50 w-full">
                        Rp {product.price.toLocaleString('id-ID')}
                      </div>
                    </button>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div className="border border-slate-700/50 bg-slate-800/30 rounded-2xl p-6 mb-8 shadow-inner">
                    <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Keranjang Belanja
                    </h3>
                    <div className="space-y-4">
                      {cart.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700 gap-4">
                          <div className="flex-1">
                            <p className="font-bold text-slate-200">{item.productName}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              <div className="flex items-center bg-slate-900 border border-slate-600 rounded-lg overflow-hidden">
                                <span className="px-3 text-sm text-slate-400 bg-slate-800 border-r border-slate-600">Qty</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateCartItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                  className="w-16 px-3 py-1.5 bg-transparent text-slate-100 focus:outline-none text-center"
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Catatan (Size, Warna, dll)"
                                value={item.notes}
                                onChange={(e) => updateCartItem(index, 'notes', e.target.value)}
                                className="flex-1 min-w-[150px] px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="text-right flex flex-row sm:flex-col justify-between items-center sm:items-end">
                            <p className="font-bold text-blue-400">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-rose-400 text-sm hover:text-rose-300 font-medium px-2 py-1 rounded hover:bg-rose-400/10 transition-colors mt-2"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Estimasi Subtotal</span>
                      <span className="text-2xl font-bold text-slate-100">Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={cart.length === 0}
                    className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] disabled:shadow-none flex items-center gap-2"
                  >
                    Selanjutnya ke Desain <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DESIGN */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Upload Desain Anda</h2>
                <p className="text-slate-400 mb-6 text-sm">Unggah file resolusi tinggi untuk hasil cetak maksimal (Maks 10MB).</p>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 bg-slate-800/30
                    ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-blue-400 hover:bg-slate-800/60'}`}
                >
                  <input {...getInputProps()} />
                  {uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      </div>
                      <p className="text-emerald-400 font-bold mb-1">File Siap: {uploadedFile.name}</p>
                      <p className="text-slate-400 text-xs mb-6">Klik atau drag untuk mengganti file</p>
                      
                      {filePreview && (
                        <div className="mt-2 p-2 border border-slate-700 bg-slate-900 rounded-xl">
                          <Image src={filePreview} alt="Preview Desain" width={200} height={200} className="mx-auto rounded-lg object-contain max-h-[200px]" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-6">
                      <div className="text-5xl mb-4">📁</div>
                      <p className="text-slate-300 font-bold mb-2">Tarik & Lepas File di Sini</p>
                      <p className="text-sm text-slate-500">Atau klik untuk menelusuri file perangkat Anda</p>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Instruksi Desain / Detail Posisi (Opsional)</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                    placeholder="Contoh: Logo tolong ditaruh di dada kiri ukuran 8cm..."
                    value={formData.designNotes}
                    onChange={(e) => setFormData({...formData, designNotes: e.target.value})}
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between mt-10 gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-3.5 border border-slate-600 text-slate-300 rounded-xl font-bold hover:bg-slate-800 transition-all text-center"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                  >
                    Lanjut ke Data Diri <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CUSTOMER INFO */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Informasi Pemesan</h2>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Nama Lengkap <span className="text-rose-400">*</span></label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Aktif <span className="text-rose-400">*</span></label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                        placeholder="nama@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Nomor WhatsApp <span className="text-rose-400">*</span></label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                        placeholder="0812-3456-7890"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Asal Negara <span className="text-rose-400">*</span></label>
                      <select
                        value={formData.countryOrigin}
                        onChange={(e) => setFormData({...formData, countryOrigin: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="Indonesia">🇮🇩 Indonesia (Kirim Domestik)</option>
                        <option value="Luar Negeri">🌍 Luar Negeri (International Order)</option>
                      </select>
                      {formData.countryOrigin === 'Luar Negeri' && (
                        <p className="text-xs text-amber-400 mt-2 flex items-start gap-1">
                          <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                          <span>Pengiriman luar negeri memerlukan verifikasi via WhatsApp untuk kalkulasi ongkos kirim.</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Alamat Pengiriman (Opsional)</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder={formData.countryOrigin === 'Indonesia' ? "Alamat lengkap beserta kodepos" : "Full International Address (including Zip/Postal Code)"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Pesan Tambahan</label>
                    <textarea
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Informasi tambahan pengiriman/pesanan"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between mt-10 gap-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-8 py-3.5 border border-slate-600 text-slate-300 rounded-xl font-bold hover:bg-slate-800 transition-all text-center"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => {
                      if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
                        toast.error('Mohon lengkapi Nama, Email, dan No WhatsApp')
                        return
                      }
                      setCurrentStep(4)
                    }}
                    className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                  >
                    Lanjut ke Pembayaran <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CHECKOUT */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Metode Pembayaran</h2>
                
                {/* 🟢 FITUR BARU: PILIHAN FULL PAYMENT / DP 50% */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-300 mb-3">Tipe Pembayaran</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormData({...formData, paymentType: 'FULL'})}
                      className={`flex flex-col items-start p-4 border rounded-2xl transition-all ${
                        formData.paymentType === 'FULL' 
                          ? 'border-blue-500 bg-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                          : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`font-bold ${formData.paymentType === 'FULL' ? 'text-blue-400' : 'text-slate-200'}`}>Full Payment</span>
                        {formData.paymentType === 'FULL' && <CheckCircleIcon className="w-5 h-5 text-blue-400" />}
                      </div>
                      <span className="text-xs text-slate-400">Bayar lunas 100% di awal</span>
                    </button>

                    <button
                      onClick={() => setFormData({...formData, paymentType: 'DP'})}
                      className={`flex flex-col items-start p-4 border rounded-2xl transition-all ${
                        formData.paymentType === 'DP' 
                          ? 'border-amber-500 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                          : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`font-bold ${formData.paymentType === 'DP' ? 'text-amber-400' : 'text-slate-200'}`}>Down Payment (DP) 50%</span>
                        {formData.paymentType === 'DP' && <CheckCircleIcon className="w-5 h-5 text-amber-400" />}
                      </div>
                      <span className="text-xs text-slate-400">Bayar setengahnya, sisanya saat barang jadi</span>
                    </button>
                  </div>
                </div>
                {/* ------------------------------------------- */}

                {formData.countryOrigin === 'Indonesia' ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { method: 'QRIS', icon: '📱', label: 'QRIS' },
                        { method: 'BANK_TRANSFER', icon: '🏦', label: 'Transfer Bank' },
                        { method: 'USDT', icon: '💎', label: 'USDT (BEP20)' },
                        { method: 'BTC', icon: '₿', label: 'Bitcoin' },
                      ].map((payment) => (
                        <button
                          key={payment.method}
                          onClick={() => setFormData({...formData, paymentMethod: payment.method})}
                          className={`border flex flex-col items-center justify-center rounded-2xl p-5 transition-all duration-300 ${
                            formData.paymentMethod === payment.method
                              ? 'border-blue-500 bg-blue-600/10 shadow-[0_0_20px_rgba(37,99,235,0.2)] scale-105 z-10'
                              : 'border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          <span className="text-3xl block mb-3 filter drop-shadow-md">{payment.icon}</span>
                          <span className={`font-bold text-sm ${formData.paymentMethod === payment.method ? 'text-blue-400' : 'text-slate-300'}`}>
                            {payment.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 mb-10 shadow-inner">
                      <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                        <InformationCircleIcon className="w-5 h-5" /> Informasi Pembayaran
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">Instruksi transfer dan detail nomor rekening / dompet kripto akan diberikan setelah pesanan berhasil dibuat.</p>
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-10 text-center">
                    <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-amber-400 mb-2">International Shipping (Luar Negeri)</h3>
                    <p className="text-slate-300 text-sm max-w-lg mx-auto">
                      Because you are ordering from outside Indonesia, we need to calculate the international shipping fee manually. Please proceed to verify your order via WhatsApp.
                    </p>
                  </div>
                )}

                {/* Final Order Summary */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 mb-6 shadow-lg">
                  <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700 pb-3">Ringkasan Checkout</h3>
                  <div className="space-y-3 mb-4">
                    {cart.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm text-slate-300">
                        <span>{item.quantity}x {item.productName}</span>
                        <span className="font-medium">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* 🟢 REVISI: Penyesuaian teks dan nominal berdasarkan tipe pembayaran */}
                  <div className="border-t border-slate-700 border-dashed pt-4 flex justify-between items-center">
                    <span className="font-bold text-slate-200">
                      {formData.paymentType === 'DP' ? 'Tagihan DP (50%)' : 'Estimasi Total Barang'}
                    </span>
                    <span className="text-2xl font-extrabold text-blue-400">
                      Rp {formData.paymentType === 'DP' 
                            ? (calculateTotal() / 2).toLocaleString('id-ID') 
                            : calculateTotal().toLocaleString('id-ID')}
                    </span>
                  </div>
                  {formData.paymentType === 'DP' && (
                    <p className="text-xs text-amber-400 mt-2 text-right">Sisa tagihan (50%) akan dibayarkan sebelum pengiriman.</p>
                  )}
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-10 text-center">
                  <p className="text-xs text-blue-300 leading-relaxed font-medium">
                    * Harga yang tertera di atas belum termasuk biaya pengiriman dan PPN 11%. Rincian lengkap akan dikalkulasikan pada invoice akhir Anda.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-8 py-3.5 border border-slate-600 text-slate-300 rounded-xl font-bold hover:bg-slate-800 transition-all text-center"
                  >
                    Kembali
                  </button>

                  {formData.countryOrigin === 'Indonesia' ? (
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Memproses Pesanan...
                        </>
                      ) : 'Buat Pesanan Sekarang 🚀'}
                    </button>
                  ) : (
                    <button
                      onClick={submitInternationalOrder}
                      disabled={isSubmitting}
                      className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Menyimpan Data...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                          Buat Pesanan & Buka WA
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </>
  )
}