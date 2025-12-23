import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import stripeWebhooks from "./controllers/stripeWebhooks.js";

connectDB();
connectCloudinary();


const app = express();

// Enable Cross-Origin Resource Sharing with a whitelist for the frontend
const allowedOrigins = [process.env.CLIENT_URL || 'https://btlweb-pi.vercel.app', 'https://btlweb-pi.vercel.app'];
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'));
  },
  credentials: true,
}));

// Respond to preflight requests
app.options('*', cors());

// API to listen to Stripe Webhooks
app.post('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// Middleware
app.use(express.json());

app.use(clerkMiddleware());

// API to listen to Clerk Webhooks 
app.use("/api/clerk", clerkWebhooks);

app.get("/", (req, res) => res.send("API is working"));
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {});

