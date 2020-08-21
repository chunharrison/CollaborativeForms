const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var cors = require('cors');
const bodyParser = require('body-parser');

//stripe api
const stripe = require('stripe')(`${process.env.STRIPE_API_KEY}`);

// Load User model
const User = require("../../models/User");
const { ReplSet } = require("mongodb");

router.use(cors({
  credentials: true,
  origin: 'http://localhost:3000',
  "Access-Control-Allow-Origin": "http://localhost:3000",
}))

//Check to make sure header is not undefined, if so, return Forbidden (403)
const checkToken = (req, res, next) => {
  const header = req.headers['authorization'];
  if(typeof header !== 'undefined') {
      const bearer = header.split(' ');
      const token = bearer[1];

      req.token = token;
      next();
  } else {
      //If header is undefined return Forbidden (403)
      res.sendStatus(403)
  }
}

router.post('/stripe-webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          req.headers['stripe-signature'],
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.log(err);
        console.log(`⚠️  Webhook signature verification failed.`);
        console.log(
          `⚠️  Check the env file and enter the correct webhook secret.`
        );
        return res.sendStatus(400);
      }

      // Extract the object from the event.
      const dataObject = event.data.object;
  
      // Handle the event
      // Review important events for Billing webhooks
      // https://stripe.com/docs/billing/webhooks
      // Remove comment to see the various objects sent for this sample
      console.log(event.type);
      switch (event.type) {
        case 'invoice.paid':
          // Used to provision services after the trial has ended.
          // The status of the invoice will show up as paid. Store the status in your
          // database to reference when a user accesses your service to avoid hitting rate limits.
          let paidInvoice = await stripe.invoices.retrieve(
            dataObject.id,
            {expand: ['payment_intent']},
          );
          User.findOneAndUpdate({ customerId: dataObject.customer }, { expire: dataObject.lines.data[0].period.end, latestInvoice: paidInvoice })
              .catch(err => console.log(err))
            
          break;
        case 'customer.subscription.created':
          const newProduct = await stripe.products.retrieve(
            dataObject.plan.product
          );
          
          User.findOneAndUpdate({ customerId: dataObject.customer }, { product: newProduct, subscription: dataObject })
                .catch(err => console.log(err))
          break

        case 'customer.subscription.updated':
          const updatedProduct = await stripe.products.retrieve(
            dataObject.plan.product
          );
          User.findOneAndUpdate({ customerId: dataObject.customer }, { product: updatedProduct, subscription: dataObject })
                .catch(err => console.log(err))
        break
        case 'invoice.payment_failed':
          // If the payment fails or the customer does not have a valid payment method,
          //  an invoice.payment_failed event is sent, the subscription becomes past_due.
          // Use this webhook to notify your user that their payment has
          // failed and to retrieve new card details.
          let failedInvoice = await stripe.invoices.retrieve(
            dataObject.id,
            {expand: ['payment_intent']},
          );
          User.findOneAndUpdate({ customerId: dataObject.customer }, { latestInvoice: failedInvoice })
          .catch(err => console.log(err))
          
          break;
        case 'customer.subscription.deleted':
          if (event.request != null) {
            // handle a subscription cancelled by your request
            // from above.
            User.findOneAndUpdate({ customerId: dataObject.customer }, { product: 'free', subscription: dataObject })
                .catch(err => console.log(err))
          } else {
            // handle subscription cancelled automatically based
            // upon your subscription settings.
            User.findOneAndUpdate({ customerId: dataObject.customer }, { product: 'free', subscription: dataObject })
                .catch(err => console.log(err))
          }
          break;
        case 'customer.subscription.trial_will_end':
          if (event.request != null) {
            // handle a subscription cancelled by your request
            // from above.
          } else {
            // handle subscription cancelled automatically based
            // upon your subscription settings.
          }
          break;
        default:
        // Unexpected event type
      }
      res.sendStatus(200);
    }
);

router.post('/create-subscription', checkToken, async (req, res) => {
    // Attach the payment method to the customer
    try {
        await stripe.paymentMethods.attach(req.body.paymentMethodId, {
            customer: req.body.customerId,
        });
    } catch (error) {
      console.log(error.message);
        return res.status('402').send({ message: error.message });
    }
    // Change the default invoice settings on the customer to the new payment method
    await stripe.customers.update(
        req.body.customerId,
        {
        invoice_settings: {
            default_payment_method: req.body.paymentMethodId,
        },
        }
    );
    
    const user = await User.findOne({ customerId: req.body.customerId });

    if (user.subscription && user.subscription.status === 'active') {
      res.status('400').send({message: 'There is already an active subscription on this account. If you wish to change or cancel your subscription, try attempting it from your personal page.'})
    }  else {
      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: req.body.customerId,
        items: [{ price: req.body.priceId }],
        expand: ['latest_invoice.payment_intent'],
      });

      const product = await stripe.products.retrieve(
        subscription.plan.product
      );

      User.findOneAndUpdate({ customerId: subscription.customer }, { product: product, subscription: subscription })
      .then(user => {
        res.send(subscription);

      })
      .catch(err => console.log(err))

    }
});

router.post('/retry-invoice', checkToken, async (req, res) => {
    // Set the default payment method on the customer
    try {
        await stripe.paymentMethods.attach(req.body.paymentMethodId, {
        customer: req.body.customerId,
        });
        await stripe.customers.update(req.body.customerId, {
        invoice_settings: {
            default_payment_method: req.body.paymentMethodId,
        },
        });
    } catch (error) {
        // in case card_decline error
        console.log(error.message)
        return res.status('402').send({message: error.message });
    }

    const invoice = await stripe.invoices.retrieve(req.body.invoiceId, {
        expand: ['payment_intent'],
    });

    res.send(invoice);
});

router.post('/cancel-subscription', checkToken, async (req, res) => {
    // Delete the subscription
    const user = await User.findOne({ customerId: req.body.customerId });
    const deletedSubscription = await stripe.subscriptions.del(
      user.latestInvoice.subscription
    );

    const product = await stripe.products.retrieve(
      deletedSubscription.plan.product
    );

    User.findOneAndUpdate({ customerId: deletedSubscription.customer }, { product: product, subscription: deletedSubscription })
    .then(user => {
      res.send(deletedSubscription);

    })
    .catch(err => console.log(err))
    
});

router.post('/update-subscription', checkToken, async (req, res) => {
  const user = await User.findOne({ customerId: req.body.customerId });
  const subscription = await stripe.subscriptions.retrieve(
        user.latestInvoice.subscription
  );

  stripe.subscriptions.update(
    subscription.id,
    {
    cancel_at_period_end: false,
    items: [
        {
        id: subscription.items.data[0].id,
        price: req.body.priceId,
        },
    ],
    }
  )
  .then(updatedSubscription => {




    stripe.products.retrieve(
      updatedSubscription.plan.product
    ).then(product => {
      User.findOneAndUpdate({ customerId: updatedSubscription.customer }, { product: product, subscription: updatedSubscription })
      .then(user => {
        res.send(updatedSubscription);

      })
      .catch(err => console.log(err))
    })
  })
  .catch(error => {
    console.log(error.raw.code);
    // Create the subscription
    stripe.subscriptions.create({
      customer: req.body.customerId,
      items: [{ price: req.body.priceId }],
      expand: ['latest_invoice.payment_intent'],
    })
    .then(subscription => {
      res.send(subscription)
    })
    .catch(error => {
      res.set(402).send(error);
    })
  })

});

router.get('/retrieve-latest-invoice', checkToken, async (req,res) => {
  const customerId = req.query.customerId;
  User.findOne({ customerId: customerId }).then(user => {
    res.send(user.latestInvoice);
  })
  .catch(error =>
    res.send(error)
  )
})

router.get('/retrieve-subscription', checkToken, async (req,res) => {
  const customerId = req.query.customerId;
  User.findOne({ customerId: customerId }).then(user => {
    res.send(user.subscription);
  })
  .catch(error =>
    res.send(error)
  )
})

router.get('/retrieve-expiry', checkToken, async (req,res) => {
  const customerId = req.query.customerId;
  User.findOne({ customerId: customerId }).then(user => {
    res.send(user.expire);
  })
  .catch(error =>
    res.send(error))
})


router.post('/retrieve-upcoming-invoice', checkToken, async (req, res) => {
    const subscription = await stripe.subscriptions.retrieve(
        req.body.subscriptionId
    );

    const invoice = await stripe.invoices.retrieveUpcoming({
        subscription_prorate: true,
        customer: req.body.customerId,
        subscription: req.body.subscriptionId,
        subscription_items: [
        {
            id: subscription.items.data[0].id,
            deleted: true,
        },
        {
          //TODO price id is static
            // This price ID is the price you want to change the subscription to.
            price: 'price_H1NlVtpo6ubk0m',
            deleted: false,
        },
        ],
    });
    res.send(invoice);
});

router.post('/retrieve-customer-payment-method', checkToken, async (req, res) => {
  const user = await User.findOne({ customerId: req.body.customerId });

  const customer = await stripe.customers.retrieve(
    user.customerId
  );

  if (customer.invoice_settings.default_payment_method) {
    const paymentMethod = await stripe.paymentMethods.retrieve(
      customer.invoice_settings.default_payment_method
    );

    res.send(paymentMethod)
  } else {
    res.send(null);
  }

});

router.post('/update-customer-payment-method', checkToken, async (req, res) => {
  // Attach the payment method to the customer
  try {
    await stripe.paymentMethods.attach(req.body.paymentMethodId, {
        customer: req.body.customerId,
    });
  } catch (error) {
      return res.status('402').send({message: error.message });
  }
  // Change the default invoice settings on the customer to the new payment method
  const paymentMethod = await stripe.customers.update(
      req.body.customerId,
      {
      invoice_settings: {
          default_payment_method: req.body.paymentMethodId,
      },
      }
  );

  res.send(paymentMethod);
});

module.exports = router;
