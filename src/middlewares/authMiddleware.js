const jwt = require("jsonwebtoken");
const redis = require("../utils/redis");
require("dotenv").config(); 
const {UnAuthorizedError} = require("../core/errorCustom")
const authMiddleware = async(req,res,next) =>{
    let token = req.header("Authorization")?.replace("Bearer ","");

    if (!token) token = req.query.token || req.params.token;
    if(!token) return next(new UnAuthorizedError("Please login to access this resource."));
    const isBlackListed = await redis.get(`blacklist:${token}`);
    if(isBlackListed) return next(new UnAuthorizedError("Token is blacklisted."));
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if(error) return next(new UnAuthorizedError("Invalid token."));
        req.user = {
            id: decoded.id,
        };
        next();
    });
}
module.exports = authMiddleware;