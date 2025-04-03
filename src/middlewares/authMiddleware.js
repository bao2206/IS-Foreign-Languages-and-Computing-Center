const jwt = require("jsonwebtoken");
const redis = require("../utils/redis");
require("dotenv").config(); 

const authMiddleWare = (req,res,next) =>{
    const token = req.header("Authorization")?.replace("Bearer ","");

    if(!token) throw new Error("Token is required.");
    const isBlackListed = redis.get(`blacklist:${token}`);
    if(isBlackListed) throw new Error("Token is blacklisted.");
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if(error) throw new Error("Invalid token.");
        req.user = decoded;
        next();
    });
}
module.exports = authMiddleWare;