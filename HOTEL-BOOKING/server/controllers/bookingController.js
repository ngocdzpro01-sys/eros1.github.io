import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";


// Function to check Availability of Room

const checkAvailability = async ({checkInDate, checkOutDate, room}) =>{

    try {
        const bookings = await Booking.find({
            room: room,
            checkInDate: {$lte: checkOutDate},
            checkOutDate: {$gte: checkInDate},
        });
        const isAvailable = bookings.length === 0;
        return isAvailable;
    } catch (error) {
        throw error; // rethrow so caller can handle/log properly
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
        // Accept both `guest` and `guests` keys and both PaymentMethod / paymentMethod
        const {room, checkInDate, checkOutDate, guest, guests, PaymentMethod, paymentMethod} = req.body;
        const user = req.user._id;

        // Validate required fields
        if(!room || !checkInDate || !checkOutDate){
            return res.status(400).json({success: false, message: "Missing required booking fields"});
        }

        const finalGuests = Number(guests ?? guest ?? 1);
        const finalPaymentMethod = paymentMethod ?? PaymentMethod ?? "Pay At Hotel";

        // Before Booking Check Availability
        const isAvailable = await checkAvailability({
            checkInDate, checkOutDate, room
        });

        if(!isAvailable){ 
            return res.json({success: false, message: "Room is not available"});
        }

        // get total price for room
        const roomData = await Room.findById(room).populate("hotel");
        if(!roomData){
            return res.status(404).json({success: false, message: "Room not found"});
        }

        let totalPrice = roomData.pricePerNight;

        // calculate total price
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        totalPrice *= nights;

        const booking =await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: finalGuests,
            checkInDate,
            checkOutDate,
            totalPrice,
            paymentMethod: finalPaymentMethod
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL || process.env.SMTP_EMAIL || `no-reply@${process.env.DOMAIN || 'example.com'}`,
            to: req.user.email,
            subject: 'Thông tin booking khách sạn',
            html: `
                <h2>Thông tin booking của bạn</h2>
                <p>Thân gửi ${req.user.username},</p>
                <p>Cảm ơn bạn đã đặt phòng! Đây là thông tin của bạn:</p>
                <ul>
                    <li><strong>Booking ID:</strong> ${booking._id}</li>
                    <li><strong>Tên khách sạn:</strong> ${roomData.hotel.name}</li>
                    <li><strong>Địa chỉ:</strong> ${roomData.hotel.address}</li>
                    <li><strong>Lịch đặt: </strong> ${booking.checkInDate.toDateString()}</li>
                    <li><strong>Tổng:</strong> ${process.env.CURRENCY || '$'} ${booking.totalPrice}</li>
                </ul>
                <p>Chúng tôi rất mong được chào đón bạn!</p>
                <p>Nếu bạn cần bất cứ thay đổi gì, hãy thoải mái liên lạc với chúng tôi.</p>
            `
        }

        // Send confirmation email, but do not fail booking if email sending fails
        await transporter.sendMail(mailOptions).catch(() => {});

        res.json({success: true, message: "Booking created successfully", booking});

    } catch (error) {
        res.status(500).json({success: false, message: "Failed to create booking", error: error.message});
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



