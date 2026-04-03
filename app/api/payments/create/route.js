import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { generateQRIS, generateCryptoPayment, generateBankPayment } from '../../../lib/paymentGateway'

export async function POST(request) {
  try {
    const { orderId, paymentMethod } = await request.json()
    
    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Check if already paid
    if (order.paymentStatus === 'PAID' || order.paymentStatus === 'VERIFIED') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      )
    }
    
    let paymentData = {}
    let transactionData = {}
    
    // Generate payment based on method
    switch (paymentMethod) {
      case 'QRIS':
        const qris = await generateQRIS(order.total, order.id)
        paymentData = {
          method: 'QRIS',
          qrCode: qris.qrCode,
          qrString: qris.qrString,
          merchantId: qris.merchantId,
          merchantName: qris.merchantName,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
        transactionData = {
          qrCode: qris.qrCode,
          qrString: qris.qrString
        }
        break
        
      case 'BTC':
        const btc = await generateCryptoPayment(order.total, order.id, 'BTC')
        paymentData = {
          method: 'BTC',
          walletAddress: btc.walletAddress,
          walletQR: btc.walletQR,
          cryptoAmount: btc.amount,
          cryptoCurrency: btc.currency,
          network: btc.network,
          rate: btc.rate,
          minConfirmations: btc.minConfirmations,
          expiresAt: btc.expiresAt
        }
        transactionData = {
          walletAddress: btc.walletAddress,
          walletQR: btc.walletQR,
          cryptoAmount: btc.amount,
          cryptoCurrency: btc.currency
        }
        break
        
      case 'USDT':
        const usdt = await generateCryptoPayment(order.total, order.id, 'USDT')
        paymentData = {
          method: 'USDT',
          walletAddress: usdt.walletAddress,
          walletQR: usdt.walletQR,
          cryptoAmount: usdt.amount,
          cryptoCurrency: usdt.currency,
          network: usdt.network,
          contractAddress: usdt.contractAddress,
          rate: usdt.rate,
          minConfirmations: usdt.minConfirmations,
          expiresAt: usdt.expiresAt
        }
        transactionData = {
          walletAddress: usdt.walletAddress,
          walletQR: usdt.walletQR,
          cryptoAmount: usdt.amount,
          cryptoCurrency: usdt.currency,
          contractAddress: usdt.contractAddress
        }
        break
        
      case 'BANK_TRANSFER':
        const bank = generateBankPayment(order.total, order.id)
        paymentData = {
          method: 'BANK_TRANSFER',
          banks: bank.banks,
          expiresAt: bank.expiresAt
        }
        transactionData = {
          banks: bank.banks
        }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid payment method' },
          { status: 400 }
        )
    }
    
    // Update order with payment method
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: paymentMethod,
        paymentDetails: transactionData
      }
    })
    
    // Create or update payment transaction
    const transaction = await prisma.paymentTransaction.upsert({
      where: {
        id: orderId // Use orderId as unique identifier
      },
      update: {
        ...paymentData,
        amount: order.total,
        status: 'PENDING'
      },
      create: {
        id: orderId,
        orderId: order.id,
        amount: order.total,
        ...paymentData,
        status: 'PENDING'
      }
    })
    
    return NextResponse.json({
      success: true,
      transaction,
      order: {
        id: order.id,
        invoiceNumber: order.invoiceNumber,
        total: order.total
      }
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment: ' + error.message },
      { status: 500 }
    )
  }
}