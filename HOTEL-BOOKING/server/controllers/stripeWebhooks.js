import stripe from "stripe";

// api to handle stripe webhooks

export const stripeWebhooks = async (requestAnimationFrame, response) => {
    // stripe gateway initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = requestAnimationFrame.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(requestAnimationFrame.body, sig, process.env.STRIPE_SIGNING_SECRET);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // handle the event 
    if(event.type === "payment_intent.succeeded"){
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        // Getting session metadata
        const session = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId,
        }); 
        const { bookingId } = session.data[0].metadata;

        // Mark payment is paid
        await Booking.findByIdAndUpdate(bookingId, {isPaid: true, 
            paymentMethod: "Stripe"
        });
    }else{
        console.log(`Unhandled event type ${event.type}`);
    }
    response.json({received: true});

}