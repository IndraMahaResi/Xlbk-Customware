'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'

export default function Products() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'ALL'

  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      
      // FALLBACK: Hapus ini nanti jika API/Database sudah berjalan normal
      // Ini hanya agar desain tetap bisa dilihat meski database kosong
      const displayData = data.length > 0 ? data : [
        { id: '1', category: 'KAOS' }, { id: '2', category: 'MUG' },
        { id: '3', category: 'TUMBLER' }, { id: '4', category: 'TOTEBAG' }
      ];

      setProducts(displayData)
      
      // Extract unique categories
      const uniqueCategories = ['ALL', ...new Set(displayData.map(p => p.category))]
      setCategories(uniqueCategories)

      // Apply filter based on URL parameter or 'ALL'
      if (initialCategory === 'ALL') {
        setFilteredProducts(displayData)
      } else {
        setFilteredProducts(displayData.filter(p => p.category === initialCategory))
      }

    } catch (error) {
      console.error('Failed to fetch products:', error)
      // Fallback on error
      const fallbackData = [{ id: '1', category: 'KAOS' }, { id: '2', category: 'MUG' }];
      setProducts(fallbackData);
      setFilteredProducts(fallbackData);
      setCategories(['ALL', 'KAOS', 'MUG']);
    } finally {
      setLoading(false)
    }
  }

  const filterByCategory = (category) => {
    setSelectedCategory(category)
    if (category === 'ALL') {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(products.filter(p => p.category === category))
    }
  }

  return (
    <>
      <Navbar />
      
      {/* Container utama tanpa bg terang, karena background global sudah di RootLayout */}
      <div className="pt-32 pb-24 min-h-screen relative z-10 overflow-hidden">
        
        {/* Efek Glow Dekoratif */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-60 -left-32 w-[400px] h-[400px] bg-sky-400/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center md:text-left mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight mb-4">
              Katalog <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">Produk</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Temukan base produk terbaik untuk mewujudkan desain merchandise Anda. Bebas minimum order, kualitas premium.
            </p>
          </div>

          {/* Category Filter - Pill Style */}
          <div className="mb-12 flex flex-wrap gap-3 justify-center md:justify-start">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => filterByCategory(category)}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 border ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                    : 'bg-slate-800/40 text-slate-300 border-slate-700/50 hover:bg-slate-700 hover:text-white hover:border-slate-600 backdrop-blur-sm'
                }`}
              >
                {category === 'ALL' ? 'SEMUA PRODUK' : category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-400 font-medium animate-pulse">Memuat katalog produk...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/20 border border-slate-700/50 rounded-3xl backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-slate-500 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-200 mb-2">Produk Tidak Ditemukan</h3>
              <p className="text-slate-400">Belum ada produk yang tersedia di kategori ini.</p>
              <button 
                onClick={() => filterByCategory('ALL')}
                className="mt-6 px-6 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors border border-blue-500/30 font-medium"
              >
                Lihat Semua Produk
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
        </div>
      </div>
    </>
  )
}