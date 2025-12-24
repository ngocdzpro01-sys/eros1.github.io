import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

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

        await Hotel.create({name, address, contact, owner, city});

        await User.findByIdAndUpdate(owner, {role: "hotelOwner"});
        res.json({success: true, message: "Hotel registered"});
        
    } catch (error) {
        console.error('registerHotel error:', error);
        res.status(500).json({success: false, message: error.message});
    }
}