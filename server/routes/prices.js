import express from 'express'
import { prisma } from '../lib/prisma.js'

export const pricesRouter = express.Router()

// GET /api/prices/:productId
//Price History
pricesRouter.get('/:productId', async (req, res) => {
  const { productId } = req.params

  try {
    const history = await prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { recordedAt: 'asc' }
    })

    res.json(history)
  } catch (error) {
    console.error('Error fetching price history:', error)
    res.status(500).json({ error: 'Failed to fetch price history.' })
  }
})
