import User from "../models/User.js";
import { getAuth } from "@clerk/express";


// Middle to check if user is authenticated
export const protect = async (req, res, next) => {
    try {
        // Log auth info for debugging (safe to remove later)
        const gaForLog = getAuth(req);
        console.log('auth getAuth raw:', gaForLog);

        // Try Clerk getAuth helper first
        let { userId } = getAuth(req) || {};
        console.log('auth userId from getAuth:', userId);

        // Fallback to middleware-provided req.auth or function API
        if (!userId) {
            const auth = typeof req.auth === "function" ? await req.auth() : req.auth;
            userId = auth?.userId;
            console.log('auth userId from req.auth fallback:', userId);
        }
        if (!userId) {
            console.warn('Not authenticated - no userId found');
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.warn('Authenticated userId not found in DB:', userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        // Log full error to help identify cause of 500s coming from auth
        console.error('Authentication middleware error:', error);
        return res.status(401).json({ success: false, message: "Authentication error", error: error.message });
    }
}