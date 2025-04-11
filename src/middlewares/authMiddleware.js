const jwt = require("jsonwebtoken");
const redis = require("../utils/redis");
require("dotenv").config(); 

const authMiddleWare = async(req,res,next) =>{
    let token = req.header("Authorization")?.replace("Bearer ","");

    if (!token) token = req.query.token || req.params.token;
    console.log("token:", req.params.token);
    console.log("token:", token);
    if(!token) throw new Error("Token is required.");
    const isBlackListed = await redis.get(`blacklist:${token}`);
    if(isBlackListed) throw new Error("Token is blacklisted.");
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if(error) throw new Error("Invalid token.");
        req.user = decoded;
        next();
    });
}
module.exports = authMiddleWare;