import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// MENGAMBIL DATA TESTIMONI (GET)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')
    const featured = searchParams.get('featured')

    let where = {}
    
    // Jika request dari Beranda untuk Testimoni Unggulan
    if (featured === 'true') {
      where.isFeatured = true // <-- Diperbaiki sesuai nama kolom database Anda
      where.isApproved = true
    } 
    // Jika bukan dari Dashboard (Admin), hanya tampilkan yang sudah di-Approve
    else if (all !== 'true') {
      where.isApproved = true 
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' } // Urutkan dari yang terbaru
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Fetch testimonials error:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

// MENYIMPAN DATA TESTIMONI BARU (POST) - Memperbaiki Error 405
export async function POST(request) {
  try {
    const data = await request.json()
    
    // Simpan ke database menyesuaikan skema Anda
    const testimonial = await prisma.testimonial.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        message: data.message, // <-- Sesuai dengan kolom database Anda
        rating: parseInt(data.rating) || 5, // <-- Sesuai dengan tipe Int di database
        productName: data.productName,
        isApproved: false,
        isFeatured: false,
      }
    })

    return NextResponse.json({ success: true, testimonial }, { status: 201 })
  } catch (error) {
    console.error('Create testimonial error:', error)
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}