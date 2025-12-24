import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";

export const registerHotel = async (req, res) =>{
    console.log('registerHotel invoked', {headers: req.headers, body: req.body});
    try {
        const {name, address, contact, city} = req.body;
        const owner = req.user?._id; 

        if(!owner) return res.status(401).json({success:false, message: 'Not authenticated'});

        // Check if User already registered
        const hotel = await Hotel.findOne({owner});
        if(hotel){
            return res.json({success: false, message: "Hotel already registered"});
        }

        const created = await Hotel.create({name, address, contact, owner, city});

        await User.findByIdAndUpdate(owner, {role: "hotelOwner"});
        res.json({success: true, message: "Hotel registered", hotel: created});
        
    } catch (error) {
        console.error('registerHotel error:', error);
        res.status(500).json({success: false, message: error.message});
    }
}

// Get the hotel for the current owner
export const getOwnerHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        res.json({ success: true, hotel });
    } catch (error) {
        console.error('getOwnerHotel error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update hotel info (only owner)
export const updateHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await Hotel.findById(id);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        if (String(hotel.owner) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized' });

        const { name, address, contact, city } = req.body;
        hotel.name = name ?? hotel.name;
        hotel.address = address ?? hotel.address;
        hotel.contact = contact ?? hotel.contact;
        hotel.city = city ?? hotel.city;

        await hotel.save();
        res.json({ success: true, message: 'Hotel updated', hotel });
    } catch (error) {
        console.error('updateHotel error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Delete hotel and related resources (only owner)
export const deleteHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await Hotel.findById(id);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        if (String(hotel.owner) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized' });

        await Room.deleteMany({ hotel: hotel._id });
        await Booking.deleteMany({ hotel: hotel._id });
        await Hotel.findByIdAndDelete(hotel._id);

        // Optionally downgrade user role if they have no other hotels
        const otherHotel = await Hotel.findOne({ owner: req.user._id });
        if(!otherHotel){
            await User.findByIdAndUpdate(req.user._id, { role: 'user' });
        }

        res.json({ success: true, message: 'Hotel and related data deleted' });
    } catch (error) {
        console.error('deleteHotel error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}