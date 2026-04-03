import QRCode from 'qrcode'
import CryptoJS from 'crypto-js'

// Konfigurasi Payment Gateway
const PAYMENT_CONFIG = {
    // QRIS Configuration
    QRIS: {
        merchantId: 'XLBK123456',
        merchantName: 'Xlbk Customwear',
        merchantCity: 'Jakarta',
        merchantCategoryCode: '5732',
        merchantType: '22',
        // QRIS Static Code
        staticQR: '00020101021126690016COM.NOBU.BANK01169300619100005030203UMI51440014ID.CO.QRIS.WWW0215ID1024XLBK1234560303UMI5204539953033605802ID5915Xlbk Customwear6008Jakarta610512345620802036304C5C'
    },

    // Crypto Wallet Configuration
    CRYPTO: {
        BTC: {
            walletAddress: 'bc1qar9fgrkghr6v58qelc3cdjkptyw8j3gh95w24s',
            network: 'Bitcoin',
            currency: 'BTC',
            rateAPI: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=idr',
            minConfirmations: 2
        },
        USDT_BEP20: {
            walletAddress: '0xb1bFa84d196aB9F32D07F770F3c5712501d5903c',
            network: 'BEP20',
            currency: 'USDT',
            contractAddress: '0x55d398326f99059fF775485246999027B3197955',
            rateAPI: 'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=idr',
            minConfirmations: 15
        }
    },

    // Bank Configuration
    BANKS: {
        BCA: {
            bankCode: '014',
            bankName: 'BCA',
            accountNumber: '5681571915',
            accountName: 'AKHMAD ANDRIANTO'
        },
        // MANDIRI: {
        //   bankCode: '008',
        //   bankName: 'Mandiri',
        //   accountNumber: '9876543210',
        //   accountName: 'PT Xlbk Customwear'
        // },
        // BNI: {
        //   bankCode: '009',
        //   bankName: 'BNI',
        //   accountNumber: '5678901234',
        //   accountName: 'PT Xlbk Customwear'
        // }
    }
}

// Generate QRIS Code
export const generateQRIS = async (amount, orderId) => {
    try {
        // QRIS Dynamic Format
        const qrisData = {
            version: '01',
            merchantId: PAYMENT_CONFIG.QRIS.merchantId,
            merchantName: PAYMENT_CONFIG.QRIS.merchantName,
            amount: amount,
            orderId: orderId,
            timestamp: new Date().toISOString()
        }

        // Generate QR Code as DataURL
        const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrisData), {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        })

        return {
            qrCode: qrCodeUrl,
            qrString: JSON.stringify(qrisData),
            merchantId: PAYMENT_CONFIG.QRIS.merchantId,
            merchantName: PAYMENT_CONFIG.QRIS.merchantName,
            amount: amount
        }
    } catch (error) {
        console.error('QRIS Generation Error:', error)
        // Fallback to static QRIS
        return {
            qrCode: await QRCode.toDataURL(PAYMENT_CONFIG.QRIS.staticQR),
            qrString: PAYMENT_CONFIG.QRIS.staticQR,
            merchantId: PAYMENT_CONFIG.QRIS.merchantId,
            merchantName: PAYMENT_CONFIG.QRIS.merchantName,
            amount: amount
        }
    }
}

// Get Crypto Exchange Rate
export const getCryptoRate = async (currency) => {
    try {
        const response = await fetch(PAYMENT_CONFIG.CRYPTO[currency].rateAPI)
        const data = await response.json()

        if (currency === 'BTC') {
            return data.bitcoin.idr
        } else if (currency === 'USDT') {
            return data.tether.idr
        }
        return 0
    } catch (error) {
        console.error('Rate fetch error:', error)
        // Fallback rates
        return currency === 'BTC' ? 1000000 : 15000
    }
}

// Calculate Crypto Amount
export const calculateCryptoAmount = async (amountIDR, currency) => {
    const rate = await getCryptoRate(currency)
    const cryptoAmount = amountIDR / rate
    return {
        amount: cryptoAmount.toFixed(8),
        rate: rate,
        currency: currency,
        idrAmount: amountIDR
    }
}

// Generate Crypto Payment Data
export const generateCryptoPayment = async (amount, orderId, currency) => {
    const cryptoConfig = PAYMENT_CONFIG.CRYPTO[currency]
    const cryptoAmount = await calculateCryptoAmount(amount, currency)

    // Generate QR Code for wallet address
    const walletQR = await QRCode.toDataURL(cryptoConfig.walletAddress, {
        width: 250,
        margin: 1
    })

    return {
        walletAddress: cryptoConfig.walletAddress,
        walletQR: walletQR,
        amount: cryptoAmount.amount,
        amountIDR: amount,
        rate: cryptoAmount.rate,
        currency: cryptoConfig.currency,
        network: cryptoConfig.network,
        orderId: orderId,
        contractAddress: cryptoConfig.contractAddress,
        minConfirmations: cryptoConfig.minConfirmations,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
}

// Generate Bank Transfer Payment
export const generateBankPayment = (amount, orderId) => {
    const banks = Object.values(PAYMENT_CONFIG.BANKS)

    return {
        banks: banks.map(bank => ({
            ...bank,
            amount: amount,
            orderId: orderId,
            virtualAccount: `${bank.bankCode}${orderId.slice(0, 12)}`
        })),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
}

// Verify Payment (Simulasi)
export const verifyPayment = async (transactionId, method) => {
    // Di production, ini akan terintegrasi dengan payment gateway API
    // Contoh: Midtrans, Xendit, atau Blockchain API

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                verified: true,
                status: 'success',
                transactionId: transactionId,
                timestamp: new Date().toISOString()
            })
        }, 2000)
    })
}

// Generate Payment Summary
export const generatePaymentSummary = async (order) => {
    const summary = {
        orderId: order.id,
        invoiceNumber: order.invoiceNumber,
        total: order.total,
        paymentMethods: []
    }

    // Generate QRIS
    const qris = await generateQRIS(order.total, order.id)
    summary.paymentMethods.push({
        method: 'QRIS',
        data: qris
    })

    // Generate BTC
    const btc = await generateCryptoPayment(order.total, order.id, 'BTC')
    summary.paymentMethods.push({
        method: 'BTC',
        data: btc
    })

    // Generate USDT
    const usdt = await generateCryptoPayment(order.total, order.id, 'USDT')
    summary.paymentMethods.push({
        method: 'USDT',
        data: usdt
    })

    // Generate Bank Transfer
    const bank = generateBankPayment(order.total, order.id)
    summary.paymentMethods.push({
        method: 'BANK_TRANSFER',
        data: bank
    })

    return summary
}
