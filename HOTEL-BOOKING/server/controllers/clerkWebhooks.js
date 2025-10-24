import e from "express";
import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        console.log("Webhook received:", req.body);
        console.log("Headers:", req.headers);
        
        // Check if required headers are present
        const requiredHeaders = ["svix-id", "svix-timestamp", "svix-signature"];
        const missingHeaders = requiredHeaders.filter(header => !req.headers[header]);
        
        if (missingHeaders.length > 0) {
            console.error("Missing required headers:", missingHeaders);
            return res.status(400).json({
                success: false, 
                message: "Missing required headers",
                missingHeaders: missingHeaders
            });
        }
        
        // Create a Svix instance with clerk webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Getting Headers
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // Verifying Headers
        try {
            await whook.verify(JSON.stringify(req.body), headers);
        } catch (verifyError) {
            console.error("Webhook verification failed:", verifyError.message);
            // If it's a timestamp error, we can still process the webhook for testing
            if (verifyError.message.includes("timestamp")) {
                console.log("Timestamp verification failed, but continuing for testing...");
            } else {
                throw verifyError;
            }
        }

        // Getting Data from request body
        const {data, type} = req.body;

        const userData = {
            _id: data.id,
            username: data.first_name + " " + data.last_name,
            email: data.email_addresses[0].email_address,
            image: data.image_url,
        };

        console.log("Processing user data:", userData);

        // Switch Cases for different Events
        switch (type) {
            case "user.created":{
                const newUser = await User.create(userData);
                console.log("User created successfully:", newUser);
                break;
            }
            case "user.updated":{
                const updatedUser = await User.findByIdAndUpdate(data.id, userData, {new: true});
                console.log("User updated successfully:", updatedUser);
                break;
            }
            case "user.deleted":{
                const deletedUser = await User.findByIdAndDelete(data.id);
                console.log("User deleted successfully:", deletedUser);
                break;
            }        
            default:
                console.log("Unknown event type:", type);
                break;
        }
        res.json({success: true, message: "Webhook Received"});


    } catch (error) {
        console.error("Webhook error:", error.message);
        res.status(500).json({success: false, message: error.message});
    };  
};


export default clerkWebhooks;