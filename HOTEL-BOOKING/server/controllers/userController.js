// GET /api/user/

export const getUserData = async (req, res)=>{
    try {
        if(!req.user){
            return res.status(401).json({success: false, message: "Not authenticated"});
        }
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities || [];
        return res.json({success: true, role, recentSearchedCities});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
}

// Store User Recent Searched Cities
export const storeRecentSearchedCities = async (req, res)=>{
    try {
        if(!req.user){
            return res.status(401).json({success: false, message: "Not authenticated"});
        }
        const {recentSearchedCity} = req.body;
        const user = req.user;

        if(!Array.isArray(user.recentSearchedCities)){
            user.recentSearchedCities = [];
        }

        if(user.recentSearchedCities.length < 3){
            user.recentSearchedCities.push(recentSearchedCity);
        }else{
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity);
        }
        await user.save();
        return res.json({success: true, message: "City added"});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
}