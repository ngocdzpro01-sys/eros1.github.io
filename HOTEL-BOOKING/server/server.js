import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";


connectDB();

const app = express();
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Middleware
app.use(express.json());
app.use(clerkMiddleware());

// API to listen to Clerk Webhooks
app.use("/api/clerk", (req, res, next) => {
    console.log("Webhook endpoint hit:", req.method, req.url);
    console.log("Headers:", req.headers);
    next();
}, clerkWebhooks);

// Test endpoint to verify webhook is working
app.post("/api/test-webhook", (req, res) => {
    console.log("Test webhook received:", req.body);
    res.json({success: true, message: "Test webhook received"});
});

app.use('/', (req, res) => res.send("API is working"));

app.get("/", (req, res)=> res.send("API is working"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

