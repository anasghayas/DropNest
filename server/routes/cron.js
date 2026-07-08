import express from 'express'
import { runPriceCheck } from '../cron.js'

export const cronRouter = express.Router()
// every 6 hours to trigger the scraping logic without relying on an in-memory cron scheduler.
cronRouter.get('/trigger', async (req, res) => {
  const secret = req.query.secret
  
  const CRON_SECRET = process.env.CRON_SECRET || 'dropnest_default_secret_123'
  
  if (secret !== CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Invalid cron secret.' })
  }

  // We intentionally don't await runPriceCheck here so we can return a 200 OK immediately
  // to the cron service, preventing timeouts while Puppeteer scrapes everything.
  runPriceCheck().catch(err => console.error('Error during triggered price check:', err))

  return res.json({ message: 'Price check job triggered successfully in the background.' })
})
