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

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));

app.post('/create-payment-intent', async (req, res) => {
  try {
    // const { v4: uuidv4 } = require('uuid');
    // // Generate a unique idempotency key
    // const idempotencyKey = uuidv4();
    // console.log(idempotencyKey)

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: 1099,
        currency: 'usd',
        payment_method_types: ['card'],
      },
      // {
      // idempotencyKey: idempotencyKey, // Include the idempotency key in the options
      // }
    );

    res.json({ client_secret: paymentIntent.client_secret })
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});


app.post('/confirm-payment', async (req, res) => {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: req.body.token, // Use the token instead of card details
      },
    });

    const paymentMethodId = paymentMethod.id;
    const paymentIntentId = req.body.paymentIntentId;

    // Retrieve the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    // Update the PaymentIntent with the payment method
    paymentIntent.payment_method = paymentMethodId;

    // Save the updated PaymentIntent
    const updatedPaymentIntent = await stripe.paymentIntents.update(
      paymentIntentId,
      {
        payment_method: paymentMethodId,
      }
    );

    // Confirm the PaymentIntent
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
      paymentIntentId
    );

    res.json({ status: confirmedPaymentIntent.status });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});


// Parse JSON request bodies

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
                    Redirecting..
                </body>
            </html>
        `);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})



function handleWebhookEvent(event) {
  const { type, data: { object } } = event;
  switch (type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = object;
      // Perform actions for the checkout.session.completed event
      console.log('Handling checkout.session.completed event');
      const payment = new Payment({
        userName: "ali"
      })
      payment.save()
      break;
    case 'checkout.session.async_payment_failed':
      const checkoutSessionAsyncPaymentFailed = object
      // Perform actions for the checkout.session.async_payment_failed event
      console.log('Handling checkout.session.async_payment_failed event');
      break;
    case 'checkout.session.async_payment_succeeded':
      const checkoutSessionAsyncPaymentSucceeded = object;
      // Perform actions for the checkout.session.async_payment_succeeded event
      console.log('Handling checkout.session.async_payment_succeeded event');
      break;
    case 'checkout.session.expired':
      const checkoutSessionExpired = object;
      // Perform actions for the checkout.session.expired event
      console.log('Handling checkout.session.expired event');
      break;
    case 'payment_intent.created':
      const payments = new Payment({
        userName: "payment_intent.created"
      })
      payments.save()
      // const paymentIntentCreated = object;
      console.log('payment_intent.created');
      break;
    case 'payment_intent.amount_capturable_updated':
      const paymentIntentAmountCapturableUpdated = event.data.object;
      // Then define and call a function to handle the event payment_intent.amount_capturable_updated
      console.log('payment_intent.amount_capturable_updated');
      break;
    case 'payment_intent.canceled':
      const paymentIntentCanceled = event.data.object;
      console.log('payment_intent.canceled');
      // Then define and call a function to handle the event payment_intent.canceled
      break;
    case 'payment_intent.partially_funded':
      const paymentIntentPartiallyFunded = event.data.object;
      console.log('payment_intent.partially_funded');
      // Then define and call a function to handle the event payment_intent.partially_funded
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentPaymentFailed = event.data.object;
      console.log('payment_intent.payment_failed');
      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case 'payment_intent.processing':
      const paymentIntentProcessing = event.data.object;
      console.log('payment_intent.processing');
      // Then define and call a function to handle the event payment_intent.processing
      break;
    case 'payment_intent.requires_action':
      const paymentIntentRequiresAction = event.data.object;
      console.log('payment_intent.requires_action');
      // Then define and call a function to handle the event payment_intent.requires_action
      break;
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      console.log('payment_intent.succeeded');
      // Then define and call a function to handle the event payment_intent.succeeded
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