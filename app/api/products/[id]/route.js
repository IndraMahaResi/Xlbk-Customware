import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// ================= GET BY ID =================
export async function GET(request, { params }) {
  try {
    // 🔥 PERBAIKAN: Tambahkan await pada params
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('GET ERROR:', error)

    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// ================= UPDATE =================
export async function PUT(request, { params }) {
  try {
    // 🔥 PERBAIKAN: Tambahkan await pada params
    const { id } = await params
    const body = await request.json()

    // 🔥 PERBAIKAN: Tambahkan field pendukung sesuai form frontend
    const { name, price, description, image, category, stock, minOrder, rating, sold } = body

    // Validasi dikit biar ga masuk data sampah
    if (!name || price === undefined || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: Number(price),
        description,
        image,
        category,
        stock,
        minOrder,
        rating: rating ? Number(rating) : 5.0,
        sold
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('PUT ERROR:', error)

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// ================= DELETE =================
export async function DELETE(request, { params }) {
  try {
    // 🔥 PERBAIKAN: Tambahkan await pada params
    const { id } = await params

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('DELETE ERROR:', error)

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}