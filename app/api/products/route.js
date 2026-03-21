import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// ================= GET =================
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('GET ERROR:', error.message)

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// ================= POST =================
export async function POST(request) {
  try {
    const body = await request.json()

    console.log('BODY MASUK:', body)

    // 🔥 Tambahkan destructuring untuk field baru
    let { 
      name, price, description, image, category, 
      stock, minOrder, rating, sold 
    } = body

    // 🔥 VALIDASI BASIC
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Field wajib (Nama, Harga, Kategori) belum lengkap' },
        { status: 400 }
      )
    }

    // 🔥 FIX ENUM (biar ga error Prisma)
    category = category.toUpperCase()

    // 🔥 VALIDASI ENUM (WAJIB BANGET)
    const allowedCategory = [
      'KAOS',
      'MUG',
      'TUMBLER',
      'TOTEBAG',
      'BAJU',
      'SOUVENIR',
      'LAINNYA' // <-- Jangan lupa tambahkan LAINNYA karena ada di frontend
    ]

    if (!allowedCategory.includes(category)) {
      return NextResponse.json(
        { error: 'Kategori tidak valid' },
        { status: 400 }
      )
    }

    // 🔥 FIX PRICE & RATING
    const parsedPrice = Number(price)
    if (isNaN(parsedPrice)) {
      return NextResponse.json(
        { error: 'Harga harus berupa angka' },
        { status: 400 }
      )
    }
    
    // Pastikan rating adalah angka (Float), jika kosong set ke 5.0
    const parsedRating = rating ? parseFloat(rating) : 5.0

    // 🔥 OPTIONAL: fallback image biar ga kosong (dan gambarnya lebih HD)
    if (!image) {
      image = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500&auto=format&fit=crop'
    }

    // 🔥 SIMPAN KE DATABASE
    const product = await prisma.product.create({
      data: {
        name,
        price: parsedPrice,
        description: description || '',
        image,
        category,
        // Masukkan data tambahan ke database
        stock: stock !== undefined ? Boolean(stock) : true,
        minOrder: minOrder || 'Bisa Satuan',
        rating: parsedRating,
        sold: sold || '0'
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('POST ERROR:', error.message)

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}