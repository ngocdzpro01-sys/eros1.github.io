import Stripe from "stripe";
import Booking from "../models/Booking.js";

// API to handle Stripe webhooks
const stripeWebhooks = async (req, res) => {
  try {
    if(!process.env.STRIPE_SECRET_KEY){
  console.error('Missing STRIPE_SECRET_KEY env var for webhooks');
  return response.status(500).send('Stripe secret key not configured on server');
}

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // handle the event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting session metadata (if you used checkout sessions)
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const bookingId = session?.data?.[0]?.metadata?.bookingId;
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentMethod: "Stripe",
        });
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