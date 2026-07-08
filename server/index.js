import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const frontendUrl = process.env.FRONTEND_URL || '*'
app.use(cors({ origin: frontendUrl })) 
app.use(express.json()) 

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DropNest API is running' })
})

import { productsRouter } from './routes/products.js'
import { pricesRouter } from './routes/prices.js'
import { cronRouter } from './routes/cron.js'
// import { startCronJobs } from './cron.js'

app.use('/api/products', productsRouter)
app.use('/api/prices', pricesRouter)
app.use('/api/cron', cronRouter)

// startCronJobs() 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})