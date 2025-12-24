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

// Allowed front-end origins (add more as needed or set FRONTEND_URL in .env)
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://btlweb-pi.vercel.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser clients (Postman, curl) with undefined origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: Origin not allowed"));
    }
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Ensure CORS headers for all responses (covers error responses)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "https://btlweb-pi.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// API to listen to Stripe Webhooks
app.post('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// Middleware
app.use(express.json());

app.use(clerkMiddleware());

// API to listen to Clerk Webhooks 
app.use("/api/clerk", clerkWebhooks);

app.get("/", (req, res) => res.send("API is working"));

// Lightweight health check to verify deployment
app.get('/api/health', (req, res) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "https://btlweb-pi.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.json({success: true, status: 'ok'});
});

// Debug endpoint: report whether Stripe secret key is present (does NOT return secret value)
app.get('/api/debug/stripe', (req, res) => {
  try {
    const present = Boolean(process.env.STRIPE_SECRET_KEY);
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "https://btlweb-pi.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    res.json({ success: true, stripeConfigured: present });
  } catch (err) {
    console.error('debug stripe endpoint error', err);
    res.status(500).json({ success: false, message: 'Debug endpoint error' });
  }
});

app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);

// Catch-all error handler — ensures responses include CORS headers
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "https://btlweb-pi.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(500).json({ success: false, message: err?.message || 'Internal Server Error' });
});

// Process-level logging to aid debugging on serverless platforms
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

