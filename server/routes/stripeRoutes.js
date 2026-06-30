const express = require('express')
const router = express.Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { protect } = require('../middleware/authMiddleware')
const User = require('../models/User')

// Create checkout session
router.post('/create-checkout', protect, async (req, res) => {
  try {
    const { plan } = req.body
    const priceId = plan === 'plus' ? process.env.STRIPE_PLUS_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/pricing?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=true`,
      customer_email: req.user.email,
      metadata: { userId: req.user._id.toString(), plan }
    })

    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create checkout session', error: err.message })
  }
})

// Stripe webhook — raw body handled in server.js
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ message: `Webhook error: ${err.message}` })
  }

  console.log('Webhook event:', event.type)

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { userId, plan } = session.metadata
      console.log('Upgrading user:', userId, 'to plan:', plan)

      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: plan,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      console.log('User upgraded successfully')
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const customer = await stripe.customers.retrieve(subscription.customer)
      const user = await User.findOne({ email: customer.email })
      if (user) {
        await User.findByIdAndUpdate(user._id, { subscriptionStatus: 'free' })
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ message: 'Webhook handler failed' })
  }

  res.json({ received: true })
})

// Get subscription status
router.get('/status', protect, async (req, res) => {
  res.json({
    plan: req.user.subscriptionStatus,
    expiry: req.user.subscriptionExpiry
  })
})

module.exports = router