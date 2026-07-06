import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors()) 
app.use(express.json()) 

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DropNest API is running' })
})

import { productsRouter } from './routes/products.js'
import { pricesRouter } from './routes/prices.js'
import { startCronJobs } from './cron.js'

app.use('/api/products', productsRouter)
app.use('/api/prices', pricesRouter)

startCronJobs()

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})