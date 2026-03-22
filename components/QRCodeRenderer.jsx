'use client'
import { useState } from 'react'
import Image from 'next/image'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'

export default function QRCodeRenderer({ value, size = 250, onError }) {
  const [error, setError] = useState(false)

  const handleError = () => {
    setError(true)
    if (onError) onError()
  }

  if (error || !value) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center">
        <div className="text-4xl mb-2">📱</div>
        <p className="text-gray-500 text-sm">QR Code tidak tersedia</p>
        <p className="text-xs text-gray-400 mt-2">Silakan refresh halaman</p>
      </div>
    )
  }

  // Check if value is a data URL (from QRCode.toDataURL)
  if (value.startsWith('data:image')) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-lg">
        <img
          src={value}
          alt="QR Code"
          width={size}
          height={size}
          className="mx-auto"
        />
      </div>
    )
  }

  // If it's a string (wallet address or text)
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg">
      <QRCodeCanvas
        value={value}
        size={size}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
        includeMargin={true}
        onError={handleError}
      />
    </div>
  )
}