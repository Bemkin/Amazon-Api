const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/create-payment-intent', async (req, res) => {
  const { items } = req.body;

  const calculateOrderAmount = (items) => {
    // Ensure each item has a price and quantity, and calculate the total price in cents
    return Math.round(items.reduce((total, item) => total + item.price * item.quantity, 0) * 100);
  };

  try {
    // Verify items and calculate order amount
    const amount = calculateOrderAmount(items);
    if (amount < 50) throw new Error("Order amount must be at least 50 cents");

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error); 
    res.status(500).send({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
