import { sendPriceAlertEmail } from './services/email.js'
import dotenv from 'dotenv'

// Load environment variables for this script
dotenv.config()

async function testEmail() {
  console.log('🧪 Testing Email Service...')
  
  // NOTE TO USER: Replace this email with the EXACT email address you used to sign up for Resend!
  const myEmail = 'stoneheadgaming2004@gmail.com' 

  const fakeProduct = {
    id: 'test-123',
    title: 'Sony WH-1000XM5 Noise Canceling Headphones',
    currentPrice: 24999,
    url: 'https://amazon.in/test-product'
  }

  const targetPrice = 25000

  try {
    const result = await sendPriceAlertEmail(myEmail, fakeProduct, targetPrice)
    console.log('📨 Resend API Response:', result)
  } catch (error) {
    console.error('❌ Failed to send:', error)
  }
}

testEmail()
