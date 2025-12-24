// GET /api/user/

export const getUserData = async (req, res)=>{
    console.log('getUserData invoked - headers:', req.headers);
    try {
        if(!req.user) return res.status(401).json({success:false, message: 'Not authenticated'});
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities || [];
        res.json({success: true, role, recentSearchedCities});
    } catch (error) {
        console.error('getUserData error:', error);
        res.status(500).json({success: false, message: error.message});
    }
}

// Store User Recent Searched Cities
export const storeRecentSearchedCities = async (req, res)=>{
    try {
        const {recentSearchedCity} = req.body;
        const user = await req.user;

        if(user.recentSearchedCities.length < 3){
            user.recentSearchedCities.push(recentSearchedCity);
        }else{
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity);
        }
        await user.save();
        res.json({success: true, message: "City added"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}