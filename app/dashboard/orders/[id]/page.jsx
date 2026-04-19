const [shippingInput, setShippingInput] = useState('')
const [isVerifying, setIsVerifying] = useState(false)

const handleVerifyShipping = async () => {
  if (!shippingInput || isNaN(shippingInput)) {
    return toast.error('Masukkan nominal ongkos kirim yang valid (angka saja)')
  }

  setIsVerifying(true)
  try {
    // 🟢 REVISI: Kita hitung total baru (Subtotal + Ongkir)
    const newShippingFee = parseFloat(shippingInput);
    const newTotal = parseFloat(order.subtotal) + newShippingFee;

    // 🟢 REVISI: Ubah URL ke endpoint utama dan gunakan method PATCH
    const res = await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        shippingFee: newShippingFee,
        total: newTotal,
        status: 'PENDING' // Status diubah agar memicu notifikasi WA otomatis!
      })
    })

    if (res.ok) {
      toast.success('Ongkos kirim berhasil diupdate! Pelanggan akan menerima WA.')
      
      // (Opsional) Jika Fonnte error, Anda bisa buka WA manual sebagai cadangan:
      /*
      const adminWaNumber = order.customerPhone;
      let formattedPhone = adminWaNumber.startsWith('0') ? '62' + adminWaNumber.substring(1) : adminWaNumber;
      const message = `Halo Kak *${order.customerName}*, ongkos kirim untuk pesanan *${order.invoiceNumber}* sudah kami hitung. Silakan cek dan lanjutkan pembayaran ya!`;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
      */

      fetchOrder() // Panggil ulang fungsi fetch data pesanan agar UI terupdate
    } else {
      toast.error('Gagal memverifikasi pesanan')
    }
  } catch (error) {
    toast.error('Terjadi kesalahan sistem')
  } finally {
    setIsVerifying(false)
    setShippingInput('') // Kosongkan input setelah sukses
  }
}