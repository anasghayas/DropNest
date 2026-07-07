import { Resend } from 'resend'

export async function sendPriceAlertEmail(userEmail, product, targetPrice) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const data = await resend.emails.send({
      from: 'DropNest Alerts <onboarding@resend.dev>', // Resend provides a testing domain
      to: [userEmail],
      subject: `🚨 Price Drop Alert: ${product.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #2563eb;">Good news! Your price target was hit!</h2>
          <p>The price for <strong>${product.title}</strong> has dropped.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;">Current Price: <strong style="color: #16a34a; font-size: 24px;">₹${product.currentPrice.toLocaleString()}</strong></p>
            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Your Target: ₹${targetPrice.toLocaleString()}</p>
          </div>

          <a href="${product.url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; width: 100%; box-sizing: border-box;">
            Buy it now
          </a>
          
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
            You received this email because you set a target price alert on DropNest.
          </p>
        </div>
      `
    })

    console.log(`✅ Email successfully sent to ${userEmail} for product ${product.id}`)
    return data
  } catch (error) {
    console.error('❌ Error sending email:', error)
  }
}
