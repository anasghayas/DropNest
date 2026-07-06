import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { productsRouter } from './routes/products.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors()) 
app.use(express.json()) 

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DropNest API is running' })
})

app.use('/api/products', productsRouter)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})