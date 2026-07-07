import cron from 'node-cron'
import { prisma } from './lib/prisma.js'
import { scrapeProduct } from './services/scraper.js'
import { sendPriceAlertEmail } from './services/email.js'

// This cron job will run every 6 hours
export const startCronJobs = () => {
  console.log('⏳ Scraper Cron Jobs initialized...')

  cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 Running scheduled price checks...')

    try {
      // 1. Fetch all products currently being tracked by at least one user
      const productsToUpdate = await prisma.product.findMany({
        where: {
          trackedBy: {
            some: {
              isActive: true
            }
          }
        }
      })

      console.log(`Found ${productsToUpdate.length} active products to check.`)

      // 2. Loop through each product and scrape the latest price
      for (const product of productsToUpdate) {
        try {
          console.log(`Scraping latest price for: ${product.title}`)
          const scrapedData = await scrapeProduct(product.url)
          
          if (!scrapedData || !scrapedData.currentPrice) {
            console.error(`Failed to scrape a valid price for ${product.title}`)
            continue
          }

          const newPrice = scrapedData.currentPrice

          // 3. Compare with highest/lowest prices
          const highestPrice = Math.max(product.highestPrice, newPrice)
          const lowestPrice = Math.min(product.lowestPrice, newPrice)

          // 4. Run a transaction to update the Product and insert a new PriceHistory point
          const updatedProduct = await prisma.$transaction(async (tx) => {
            const p = await tx.product.update({
              where: { id: product.id },
              data: {
                currentPrice: newPrice,
                highestPrice,
                lowestPrice,
                lastScrapedAt: new Date()
              }
            })

            await tx.priceHistory.create({
              data: {
                price: newPrice,
                productId: product.id
              }
            })
            return p
          })

          console.log(`✅ Updated ${product.title} to ₹${newPrice}`)

          // 4. Check for Target Price matches and send emails!
          const usersToAlert = await prisma.trackedItem.findMany({
            where: {
              productId: product.id,
              isActive: true,
              userEmail: { not: null },
              targetPrice: { gte: newPrice }
            }
          })

          for (const tracking of usersToAlert) {
            await sendPriceAlertEmail(tracking.userEmail, updatedProduct, tracking.targetPrice)
            
            await prisma.trackedItem.update({
              where: { id: tracking.id },
              data: { targetPrice: null }
            })
          }

          // 5. Be nice to the servers: Wait 3 seconds before scraping the next product
          await new Promise(resolve => setTimeout(resolve, 3000))

        } catch (err) {
          console.error(`Error scraping ${product.url} during cron:`, err)
        }
      }

      console.log('✅ Scheduled price checks completed successfully.')
    } catch (error) {
      console.error('❌ CRON JOB ERROR:', error)
    }
  })
}
