const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()

const authRoutes = require('./routes/authRoutes')
const chatRoutes = require('./routes/chatRoutes')
const stripeRoutes = require('./routes/stripeRoutes')

const app = express()

// Stripe webhook needs raw body — must be before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/stripe', stripeRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Vela API is running' })
})

const PORT = process.env.PORT || 8080
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
