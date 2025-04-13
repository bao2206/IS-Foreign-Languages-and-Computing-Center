const jwt = require("jsonwebtoken");
const redis = require("../utils/redis");
require("dotenv").config(); 
const {UnAuthorizedError} = require("../core/errorCustom")
const authMiddleWare = async(req,res,next) =>{
    let token = req.header("Authorization")?.replace("Bearer ","");

    if (!token) token = req.query.token || req.params.token;
    if(!token) throw new Error("Token is required.");
    const isBlackListed = await redis.get(`blacklist:${token}`);
    if(isBlackListed) throw new Error("Token is blacklisted.");
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if(error) return next(new UnAuthorizedError("Invalid token."));
        req.user = decoded;
        next();
    });
}
module.exports = authMiddleWare;