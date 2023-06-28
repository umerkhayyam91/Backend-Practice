const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Payment = require("./routes/Payment")
const bodyParser = require('body-parser');
const formData = require('form-data');
const Mailgun = require('mailgun-js');
const apiKey = 'key-de8b1afd256f9e8923165b1d6406942a';
const DOMAIN = 'sandboxa62be9b929c541d4b76dc747dbe77602.mailgun.org';
const mg = new Mailgun({ apiKey, domain: DOMAIN });
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


mongoose.connect(
  "mongodb+srv://umer91:emmawatson123@backendcluster.hehctlm.mongodb.net/?retryWrites=true&w=majority",
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

app.post('/create-customer', async (req, res) => {
  stripe.customers.create(
    {
      email: 'customer@example.com',
      name: 'John Doe',
      description: 'New customer',
      // Additional customer information can be provided here
    },
    function (err, customer) {
      if (err) {
        console.error(err);
        res.json(err.message)
        // Handle error
      } else {
        console.log(customer.id);
        res.json("customer created")
        // Use customer.id to reference the created customer
      }
    }
  );
})

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
        customer: "cus_O9Ol37MYoGSfhz",
        payment_method_types: ['card'],
        receipt_email: 'umer.khayyam900@gmail.com',
        description: '3% of your purchase goes toward our ocean cleanup effort!'
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
    const { items, success_url, cancel_url, receipt_email } = req.body;

    // Create a new Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: "payment",
      success_url,
      cancel_url,
      customer_email: receipt_email
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
    res.status(500).json({ error: error.message })
  }
})

app.post('/transaction-history', async (req, res) => {
  stripe.charges.list(
    {
      customer: req.body.customerID,
    },
    (err, charges) => {
      if (err) {
        console.error(err);
        // Handle error
      } else {
        charges.data.forEach((charge) => {
          console.log(charge.id);
          console.log(charge.amount);
          console.log(charge.created);
        });
      }
    }
  );
})


function handleWebhookEvent(event) {
  const { type, data: { object } } = event;
  switch (type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = object;
      console.log('Handling checkout.session.completed event');
      break;
    case 'checkout.session.async_payment_failed':
      const checkoutSessionAsyncPaymentFailed = object
      console.log('Handling checkout.session.async_payment_failed event');
      break;
    case 'checkout.session.async_payment_succeeded':
      const checkoutSessionAsyncPaymentSucceeded = object;
      console.log('Handling checkout.session.async_payment_succeeded event');
      break;
    case 'checkout.session.expired':
      const checkoutSessionExpired = object;
      console.log('Handling checkout.session.expired event');
      break;
    case 'payment_intent.created':
      console.log('payment_intent.created');
      break;
    case 'payment_intent.amount_capturable_updated':
      const paymentIntentAmountCapturableUpdated = event.data.object;
      console.log('payment_intent.amount_capturable_updated');
      break;
    case 'payment_intent.canceled':
      const paymentIntentCanceled = event.data.object;
      console.log('payment_intent.canceled');
      break;
    case 'payment_intent.partially_funded':
      const paymentIntentPartiallyFunded = event.data.object;
      console.log('payment_intent.partially_funded');
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentPaymentFailed = event.data.object;
      console.log('payment_intent.payment_failed');
      break;
    case 'payment_intent.processing':
      const paymentIntentProcessing = event.data.object;
      console.log('payment_intent.processing');
      break;
    case 'payment_intent.requires_action':
      const paymentIntentRequiresAction = event.data.object;
      console.log('payment_intent.requires_action');
      break;
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      const paymentIntentId = paymentIntentSucceeded.id;
      console.log(paymentIntentSucceeded);

      stripe.charges
        .retrieve(paymentIntentSucceeded.latest_charge)
        .then((charge) => {
          const receiptUrl = charge.receipt_url;
          const receiptEmail = paymentIntentSucceeded.receipt_email;
          const data = {
            from: 'Excited User <mailgun@sandboxa62be9b929c541d4b76dc747dbe77602.mailgun.org>',
            to: receiptEmail,
            subject: 'Payment',
            text: 'Payment received!',
            html: `<h1>Payment receipt</h1><p>Receipt URL: ${receiptUrl}</p>`
          };

          mg.messages().send(data, (error, body) => {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });

      console.log('payment_intent.succeeded');
      break;
    default:
      console.log(`Unhandled event type ${type}`);
  }
}

app.post('/webhook', (request, response) => {
  const sig = request.headers['stripe-signature'];
  console.log("webhook");
  try {
    const event = stripe.webhooks.constructEvent(request.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    handleWebhookEvent(event);
    console.log("webhook1")
    response.send();
  } catch (error) {
    console.log(error.message);
    response.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.listen(4242, () => {
  console.log('Server is running on port 4242');
});