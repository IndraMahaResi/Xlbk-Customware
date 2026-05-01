import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findFirst()

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          whatsapp: '6281283433771',
          email: 'xlbk.customwear@gmail.com',
          address: 'Jl. Albasia 3 Perum Papan Indah No 29 Rt 09/RW 09,\nMangunjaya, Tambun Selatan,\nKab. Bekasi, Jawa Barat',
          gmapsEmbed: 'http://googleusercontent.com/maps.google.com/9',
          cryptoBtc: 'bc1qar9fgrkghr6v58qelc3cdjkptyw8j3gh95w24s',
          cryptoUsdt: '0xb1bFa84d196aB9F32D07F770F3c5712501d5903c',
          socials: [{ name: 'Instagram', url: 'https://instagram.com/xlbk.customwear' }],
          marketplaces: [{ name: 'Shopee', url: 'https://shopee.co.id/xlbkcustomwear' }],
          banks: [{ bank: 'BCA', number: '1234567890', owner: 'PT Xlbk Customwear' }],
          promoActive: false, promoMessage: '', promoLink: '', promoButtonText: ''
        }
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil pengaturan' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const data = await request.json()
    const existingSettings = await prisma.storeSettings.findFirst()

    if (existingSettings) {
      const updatedSettings = await prisma.storeSettings.update({
        where: { id: existingSettings.id },
        data: {
          whatsapp: data.whatsapp,
          email: data.email,
          address: data.address, // 🟢 INI YANG MENYIMPAN ALAMAT KE DATABASE
          gmapsEmbed: data.gmapsEmbed, 
          qrisImage: data.qrisImage,
          cryptoBtc: data.cryptoBtc,
          cryptoUsdt: data.cryptoUsdt,
          socials: data.socials,             
          marketplaces: data.marketplaces,   
          banks: data.banks,                 
          promoActive: data.promoActive,
          promoMessage: data.promoMessage,
          promoLink: data.promoLink,
          promoButtonText: data.promoButtonText
        }
      })
      return NextResponse.json(updatedSettings)
    } else {
      const newSettings = await prisma.storeSettings.create({ data })
      return NextResponse.json(newSettings)
    }
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 })
  }
}