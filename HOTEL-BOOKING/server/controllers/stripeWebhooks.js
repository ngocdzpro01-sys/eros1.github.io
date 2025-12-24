import Stripe from "stripe";
import Booking from "../models/Booking.js";

// API to handle Stripe webhooks
const stripeWebhooks = async (req, res) => {
  try {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // handle the event
    console.log('Stripe webhook event type:', event.type);

    // If checkout session completed, metadata is available directly on the session
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session?.metadata?.bookingId;
      console.log('checkout.session.completed bookingId:', bookingId);
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, { isPaid: true, paymentMethod: 'Stripe' });
        console.log('Booking marked as paid (checkout.session.completed):', bookingId);
      }
    } else if (event.type === 'payment_intent.succeeded') {
      // fallback: find checkout session(s) associated with payment intent
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      console.log('payment_intent.succeeded paymentIntentId:', paymentIntentId);
      try {
        const sessions = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntentId });
        const bookingId = sessions?.data?.[0]?.metadata?.bookingId;
        console.log('Found bookingId from payment_intent:', bookingId);
        if (bookingId) {
          await Booking.findByIdAndUpdate(bookingId, { isPaid: true, paymentMethod: 'Stripe' });
          console.log('Booking marked as paid (payment_intent.succeeded):', bookingId);
        }
      } catch (err) {
        console.error('Error fetching sessions for payment_intent:', err.message || err);
      }
    } else {
      console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default stripeWebhooks;