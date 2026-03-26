import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET single testimonial
export async function GET(request, { params }) {
  try {
    // 🔥 Buka promise params dengan await
    const { id } = await params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: id }
    })
    
    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(testimonial)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch testimonial' },
      { status: 500 }
    )
  }
}

// UPDATE testimonial
export async function PUT(request, { params }) {
  try {
    // 🔥 Buka promise params dengan await
    const { id } = await params;
    
    const data = await request.json()
    
    const testimonial = await prisma.testimonial.update({
      where: { id: id },
      data
    })
    
    return NextResponse.json(testimonial)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    )
  }
}

// DELETE testimonial
export async function DELETE(request, { params }) {
  try {
    // 🔥 Buka promise params dengan await
    const { id } = await params;

    await prisma.testimonial.delete({
      where: { id: id }
    })
    
    return NextResponse.json({ message: 'Testimonial deleted' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    )
  }
}