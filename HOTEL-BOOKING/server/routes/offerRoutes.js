import express from "express";
import Offer from "../models/offer.js";

const router = express.Router();

// GET all offers
router.get("/", async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
