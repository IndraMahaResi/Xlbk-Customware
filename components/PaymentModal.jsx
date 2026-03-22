'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import QRCodeRenderer from './QRCodeRenderer'
import { 
  XMarkIcon, 
  ClipboardDocumentIcon, 
  CheckIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

export default function PaymentModal({ isOpen, onClose, order, payment, onPaymentComplete }) {
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [paymentProof, setPaymentProof] = useState(null)
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [refreshing, setRefreshing] = useState(false)
  const [cancelling, setCancelling] = useState(false) // State untuk loading pembatalan

  useEffect(() => {
    if (payment?.expiresAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime()
        const expireTime = new Date(payment.expiresAt).getTime()
        const distance = expireTime - now
        
        if (distance < 0) {
          clearInterval(timer)
          setCountdown({ hours: 0, minutes: 0, seconds: 0 })
          toast.error('Waktu pembayaran telah habis')
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)
          setCountdown({ hours, minutes, seconds })
        }
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [payment])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Berhasil disalin')
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePaymentProof = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const uploadData = await uploadRes.json()
      setPaymentProof(uploadData.url)
      
      const proofRes = await fetch(`/api/payments/${order.id}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofUrl: uploadData.url })
      })
      
      if (proofRes.ok) {
        toast.success('Bukti pembayaran berhasil diupload')
        setTimeout(() => {
          onPaymentComplete()
        }, 2000)
      }
    } catch (error) {
      toast.error('Gagal upload bukti pembayaran')
    } finally {
      setUploading(false)
    }
  }

  const refreshPayment = async () => {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/payment/check/${order.id}`)
      const data = await res.json()
      if (data.paid) {
        toast.success('Pembayaran terdeteksi!')
        onPaymentComplete()
      } else {
        toast.info('Belum ada pembayaran terdeteksi')
      }
    } catch (error) {
      toast.error('Gagal mengecek pembayaran')
    } finally {
      setRefreshing(false)
    }
  }

  // 🔥 FUNGSI BARU: Batalkan Pembayaran
  const handleCancelPayment = async () => {
    const isConfirmed = window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat dikembalikan.');
    if (!isConfirmed) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', paymentStatus: 'FAILED' })
      });

      if (res.ok) {
        toast.success('Pesanan berhasil dibatalkan');
        onClose(); // Tutup modal
        if (typeof onPaymentComplete === 'function') {
          onPaymentComplete(); // Memanggil fungsi parent untuk me-refresh data UI di belakang modal
        }
      } else {
        toast.error('Gagal membatalkan pesanan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setCancelling(false);
    }
  }

  // 🔥 FUNGSI BARU: Konfirmasi "Saya Sudah Membayar"
  const handleAlreadyPaid = () => {
    // Jika metode Bank Transfer dan belum upload bukti, ingatkan pelanggan
    if (payment?.method === 'BANK_TRANSFER' && !paymentProof) {
      toast.error('Mohon upload bukti transfer terlebih dahulu agar kami dapat memverifikasinya.');
      return;
    }

    // Jika sudah upload bukti, atau menggunakan Crypto/QRIS (yang bisa di-cek otomatis)
    toast.success('Sedang mengecek status pembayaran...');
    refreshPayment();
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold">Detail Pembayaran</h2>
            <p className="text-sm text-gray-500">Order #{order?.invoiceNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Amount */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-6 text-white text-center shadow-lg">
            <p className="text-sm opacity-90 mb-1 font-medium">Total Pembayaran</p>
            <p className="text-3xl font-bold tracking-tight">Rp {order?.total?.toLocaleString()}</p>
          </div>
          
          {/* Countdown Timer */}
          {(countdown.hours > 0 || countdown.minutes > 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-yellow-800 font-semibold mb-2">Selesaikan pembayaran sebelum:</p>
              <div className="flex justify-center gap-4 text-2xl font-bold text-yellow-800">
                <div className="text-center">
                  <span className="bg-yellow-100 px-3 py-2 rounded-lg shadow-inner">{String(countdown.hours).padStart(2, '0')}</span>
                  <p className="text-xs mt-1">Jam</p>
                </div>
                <span className="text-2xl pt-1">:</span>
                <div className="text-center">
                  <span className="bg-yellow-100 px-3 py-2 rounded-lg shadow-inner">{String(countdown.minutes).padStart(2, '0')}</span>
                  <p className="text-xs mt-1">Menit</p>
                </div>
                <span className="text-2xl pt-1">:</span>
                <div className="text-center">
                  <span className="bg-yellow-100 px-3 py-2 rounded-lg shadow-inner">{String(countdown.seconds).padStart(2, '0')}</span>
                  <p className="text-xs mt-1">Detik</p>
                </div>
              </div>
            </div>
          )}
          
          {/* QRIS Payment */}
          {payment?.method === 'QRIS' && (
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-center">Scan QRIS untuk Membayar</h3>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                  <QRCodeRenderer value={payment.qrCode || payment.qrString} size={250} />
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Cara Pembayaran:</p>
                <ol className="text-sm text-gray-600 space-y-1 ml-4 list-decimal">
                  <li>Buka aplikasi m-Banking atau e-Wallet Anda.</li>
                  <li>Pilih menu scan QRIS.</li>
                  <li>Scan QR code di atas.</li>
                  <li>Konfirmasi pembayaran sebesar <strong>Rp {order?.total?.toLocaleString()}</strong>.</li>
                </ol>
              </div>
            </div>
          )}
          
          {/* Crypto Payment */}
          {(payment?.method === 'BTC' || payment?.method === 'USDT') && (
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Transfer {payment.method}</h3>
              
              {/* QR Code Wallet */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Scan QR Code Wallet Address</p>
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                  <QRCodeRenderer value={payment.walletAddress} size={200} />
                </div>
              </div>
              
              {/* Wallet Address */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white p-3 rounded-lg text-sm break-all font-mono border border-gray-200 shadow-inner">
                    {payment.walletAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(payment.walletAddress)}
                    className="p-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors shadow-sm"
                    title="Salin Alamat Wallet"
                  >
                    {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Jumlah</p>
                  <p className="font-bold text-gray-800">{payment.cryptoAmount} {payment.cryptoCurrency}</p>
                  <p className="text-xs text-gray-400">≈ Rp {order?.total?.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Network</p>
                  <p className="font-bold text-gray-800">{payment.network}</p>
                  {payment.contractAddress && (
                    <p className="text-xs text-gray-400 truncate">Contract: {payment.contractAddress.slice(0, 10)}...</p>
                  )}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Rate</p>
                  <p className="font-bold text-gray-800">1 {payment.cryptoCurrency} = Rp {payment.rate?.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Min Confirmations</p>
                  <p className="font-bold text-gray-800">{payment.minConfirmations} confirms</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 flex gap-2">
                  <span>⚠️</span>
                  <span><strong>Penting:</strong> Kirim tepat <strong>{payment.cryptoAmount} {payment.cryptoCurrency}</strong> ke wallet address di atas. Transfer dengan jumlah berbeda tidak akan terdeteksi.</span>
                </p>
              </div>
            </div>
          )}
          
          {/* Bank Transfer */}
          {payment?.method === 'BANK_TRANSFER' && (
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Transfer Bank</h3>
              <div className="space-y-3">
                {payment.banks?.map((bank, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-300 transition-all bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg text-gray-800">{bank.bankName}</p>
                        <p className="text-gray-600 mt-1">No. Rekening: <span className="font-mono font-semibold">{bank.accountNumber}</span></p>
                        <p className="text-gray-600">a.n. {bank.accountName}</p>
                        {bank.virtualAccount && (
                          <p className="text-sm font-semibold text-indigo-600 mt-2 bg-indigo-50 inline-block px-2 py-1 rounded">
                            VA: {bank.virtualAccount}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(bank.accountNumber)}
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="Salin No. Rekening"
                      >
                        {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-600 bg-gray-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                      Transfer tepat sebesar <strong className="text-indigo-600 text-base">Rp {order?.total?.toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload Payment Proof */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="font-semibold mb-3">Upload Bukti Pembayaran</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handlePaymentProof}
                disabled={uploading}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:transition-colors file:cursor-pointer border border-gray-200 rounded-lg p-1"
              />
              <button
                onClick={refreshPayment}
                disabled={refreshing}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
                Cek Mutasi
              </button>
            </div>
            
            {uploading && (
              <p className="text-center text-indigo-600 font-medium text-sm mt-4 animate-pulse">Mengunggah bukti pembayaran...</p>
            )}
            
            {paymentProof && !uploading && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <p className="text-green-700 text-sm font-medium">
                  Bukti pembayaran berhasil diunggah!
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
            <p className="text-sm text-blue-800 leading-relaxed">
              💡 <strong>Informasi:</strong> Setelah melakukan transfer, silakan upload bukti pembayaran Anda. Pesanan akan segera diproses setelah pembayaran dikonfirmasi oleh tim kami.
            </p>
          </div>

          {/* 🔥 TOMBOL AKSI: BATALKAN & SAYA SUDAH MEMBAYAR 🔥 */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={handleCancelPayment}
              disabled={cancelling}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
            >
              <ExclamationTriangleIcon className="w-5 h-5" />
              {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
            </button>
            
            <button
              onClick={handleAlreadyPaid}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircleIcon className="w-5 h-5" />
              )}
              Saya Sudah Membayar
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}