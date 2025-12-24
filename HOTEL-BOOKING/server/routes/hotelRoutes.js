import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { registerHotel, getOwnerHotel, updateHotel, deleteHotel } from "../controllers/hotelController.js";

const hotelRouter = express.Router();

hotelRouter.post('/', protect, registerHotel);
hotelRouter.get('/owner', protect, getOwnerHotel);
hotelRouter.put('/:id', protect, updateHotel);
hotelRouter.delete('/:id', protect, deleteHotel);

export default hotelRouter;