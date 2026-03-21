import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Email configuration (gunakan SMTP email Anda)
    // Untuk development, kita akan simpan dulu
    console.log('Contact form submission:', { name, email, phone, subject, message })

    // Di production, kirim email menggunakan nodemailer
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"Xlbk Contact Form" <${process.env.SMTP_USER}>`,
      to: 'info@xlbk.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <h3>Pesan Baru dari Website</h3>
        <p><strong>Nama:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telepon:</strong> ${phone || '-'}</p>
        <p><strong>Subjek:</strong> ${subject}</p>
        <p><strong>Pesan:</strong></p>
        <p>${message}</p>
      `,
    })
    */

    // Simpan ke database (opsional)
    // await prisma.contactMessage.create({ data: { name, email, phone, subject, message } })

    return NextResponse.json(
      { message: 'Pesan berhasil dikirim' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}