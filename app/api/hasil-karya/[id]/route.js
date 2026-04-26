import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    await prisma.hasilKarya.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true, message: 'Karya berhasil dihapus' })
  } catch (error) {
    console.error('Gagal menghapus data hasil karya:', error)
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 })
  }
}