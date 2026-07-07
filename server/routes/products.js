import express from 'express'
import { prisma } from '../lib/prisma.js'
import { scrapeProduct } from '../services/scraper.js'

export const productsRouter = express.Router()

productsRouter.post('/', async (req, res) => {
  const { url, userId } = req.body

  if (!url || !userId) {
    return res.status(400).json({ error: 'URL and userId are required.' })
  }

  try {
    // 1. Check if the product already exists in our database
    let product = await prisma.product.findUnique({
      where: { url }
    })

    if (product) {
      // Product exists. Check if this specific user is already tracking it.
      const existingTrack = await prisma.trackedItem.findUnique({
        where: {
          userId_productId: {
            userId: userId,
            productId: product.id
          }
        }
      })

      if (existingTrack) {
        return res.status(400).json({ error: 'You are already tracking this product.' })
      }

      // User isn't tracking it yet, so create the connection
      await prisma.trackedItem.create({
        data: {
          userId: userId,
          productId: product.id
        }
      })

      return res.status(200).json({ message: 'Added to your tracking list!', product })
    }

    // 2. Product does NOT exist. We must scrape it!
    console.log(`Scraping new product: ${url}`)
    const scrapedData = await scrapeProduct(url)

    // 3. Save the new product, the initial price history, and the user's tracking link
    product = await prisma.$transaction(async (tx) => {
      
      const newProduct = await tx.product.create({
        data: {
          url: url,
          title: scrapedData.title,
          imageUrl: scrapedData.imageUrl,
          platform: scrapedData.platform,
          currentPrice: scrapedData.currentPrice,
          highestPrice: scrapedData.currentPrice,
          lowestPrice: scrapedData.currentPrice,
        }
      })

      await tx.priceHistory.create({
        data: {
          price: scrapedData.currentPrice,
          productId: newProduct.id
        }
      })

      await tx.trackedItem.create({
        data: {
          userId: userId,
          productId: newProduct.id
        }
      })

      return newProduct
    })

    res.status(201).json({ message: 'Product successfully tracked!', product })

  } catch (error) {
    console.error('Error adding product:', error)
    res.status(500).json({ error: 'Failed to process product URL. The scraper might have been blocked.' })
  }
})
// Fetch all products that a specific user is tracking
productsRouter.get('/user/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const trackedItems = await prisma.trackedItem.findMany({
      where: { userId, isActive: true },
      include: {
        product: true // This joins the product data so we get title, price, image, etc.
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(trackedItems)
  } catch (error) {
    console.error('Error fetching tracked products:', error)
    res.status(500).json({ error: 'Failed to fetch your tracked products.' })
  }
})

// Updates the target price for a specific user's tracked item
productsRouter.put('/target-price', async (req, res) => {
  const { userId, productId, targetPrice } = req.body

  if (!userId || !productId || targetPrice === undefined) {
    return res.status(400).json({ error: 'userId, productId, and targetPrice are required.' })
  }

  try {
    const updatedTrackedItem = await prisma.trackedItem.update({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId
        }
      },
      data: {
        targetPrice: targetPrice
      }
    })

    res.json({ message: 'Target price updated successfully', trackedItem: updatedTrackedItem })
  } catch (error) {
    console.error('Error updating target price:', error)
    res.status(500).json({ error: 'Failed to update target price.' })
  }
})

// Stops tracking a product for a specific user
productsRouter.delete('/user/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params

  try {
    await prisma.trackedItem.delete({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId
        }
      }
    })
    res.json({ message: 'Product removed from your tracking list.' })
  } catch (error) {
    console.error('Error removing tracked product:', error)
    res.status(500).json({ error: 'Failed to remove product. It may already be deleted.' })
  }
})
