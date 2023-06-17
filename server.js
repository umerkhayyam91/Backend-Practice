const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Payment = require("./routes/Payment")
const bodyParser = require('body-parser');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

mongoose.connect(
  process.env.CONNECTION_STRING,
  { useNewUrlParser: true },
).then((result) => {
  console.log("DB Connected!!");
}).catch((err) => {
  console.log(err);
});

// Parse JSON request bodies
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));

// Define a route for creating a checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, success_url, cancel_url } = req.body;

    // Create a new Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: "payment",
      success_url,
      cancel_url,
    });

    // Return the session ID to the client
    res.send(`
            <html>
                <head>
                    <meta http-equiv="refresh" content="0; url=${session.url}">
                </head>
                <body>
                    Redirecting...
                </body>
            </html>
        `);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function handleWebhookEvent(event) {
  const { type, data: { object } } = event;
  switch (type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = object;
      // Perform actions for the checkout.session.completed event
      console.log('Handling checkout.session.completed event');
      console.log(checkoutSessionCompleted);
      break;
    case 'checkout.session.async_payment_failed':
      const checkoutSessionAsyncPaymentFailed = object;
      // Perform actions for the checkout.session.async_payment_failed event
      console.log('Handling checkout.session.async_payment_failed event');
      console.log(checkoutSessionAsyncPaymentFailed);
      break;
    case 'checkout.session.async_payment_succeeded':
      const checkoutSessionAsyncPaymentSucceeded = object;
      // Perform actions for the checkout.session.async_payment_succeeded event
      console.log('Handling checkout.session.async_payment_succeeded event');
      console.log(checkoutSessionAsyncPaymentSucceeded);
      break;
    case 'checkout.session.expired':
      const checkoutSessionExpired = object;
      // Perform actions for the checkout.session.expired event
      console.log('Handling checkout.session.expired event');
      const payment = new Payment({
        userName: "ali"
      })
       payment.save()
      break;
    case 'payment_intent.amount_capturable_updated':
      const paymentIntentAmountCapturableUpdated = object;
      // Perform actions for the payment_intent.amount_capturable_updated event
      console.log('Handling payment_intent.amount_capturable_updated event');
      console.log(paymentIntentAmountCapturableUpdated);
      break;
    default:
      console.log(`Unhandled event type ${type}`);
  }
}

// Define the /webhook route for receiving webhook events
app.post('/webhook', (request, response) => {
  const sig = request.headers['stripe-signature'];
  console.log("webhook");
  try {
    const event = stripe.webhooks.constructEvent(request.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    handleWebhookEvent(event); // Call the function to handle the webhook event
    console.log("webhook1")
    response.send(); // Return a 200 response to acknowledge receipt of the event
  } catch (error) {
    console.log(error.message);
    response.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Start the server
app.listen(4242, () => {
  console.log('Server is running on port 4242');
});