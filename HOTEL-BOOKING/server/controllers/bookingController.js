import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";


// Function to check Availability of Room

const checkAvailability = async ({checkInDate, checkOutDate, roomId}) =>{

    try {
        const bookings = await Booking.find({
            room: roomId,
            checkInDate: {$lte: checkOutDate},
            checkOutDate: {$gte: checkInDate},
        });
        const isAvailable = bookings.length === 0;
        return isAvailable;
    } catch (error) {
        console.log(error.message);
    }
    
}


// API to check availability of a room
// Post /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res)=>{
    try {
        const {room, checkInDate, checkOutDate} = req.body;
        const isAvailable = await checkAvailability({checkInDate, checkOutDate, room});
        res.json({success: true, isAvailable});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// API to create a new booking
// Post /api/bookings/book
export const createBooking = async (req, res) =>{
    try {
        const {room, checkInDate, checkOutDate, guest} = req.body;
        const user = req.user._id;

        // Before Booking Check Availability

        const isAvailable = await checkAvailability({
            checkInDate, checkOutDate, room
        });

        if(!isAvailable){ 
            return res.json({success: false, message: "Room is not available"});
        }

        // get total price for room
        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;

        // calculate total price
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        totalPrice *= nights;

        const booking =await Booking.create({
            user, room, hotel: roomData.hotel._id, guests: guest, checkInDate, checkOutDate, totalPrice
        });

        res.json({success: true, message: "Booking created successfully", booking});
        

    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Failed to create booking"});
    }
};

// API to get all bookings for a user
// Get /api/bookings/user

export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({user}).populate("room hotel").sort
        ({createdAt: -1});
        res.json({success: true, bookings});
    } catch (error) {
        res.json({success: false, message: "Failed to fetch bookings"});
    }
};

export const getHotelBookings = async (req, res) => {
        try {
            const hotel = await Hotel.findOne({owner: req.user._id});
        if(!hotel){
            return res.json({success: false, message: "Hotel not found"});
        }
        const bookings = await Booking.find({hotel: hotel._id}).populate("room hotel user").sort
        ({createdAt: -1});
        // Total bookings
        const totalBookings = bookings.length;
        // Total Revenue
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);
        res.json({success: true, dashboardData: {totalBookings, totalRevenue}, bookings});
    } catch (error) {
        res.json({success: false, dashboardData: "Failed to fetch bookings"});
    }
};