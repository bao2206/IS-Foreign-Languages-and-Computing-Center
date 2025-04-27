const jwt = require("jsonwebtoken");
const redis = require("../utils/redis");
const AuthModel = require("../models/AuthModel");
// const { BadRequestError } = require("../core/errorCustom");
require("dotenv").config();
const { UnAuthorizedError } = require("../core/errorCustom");
const authMiddleware = async (req, res, next) => {
  let token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) token = req.query.token || req.params.token;
  if (!token)
    return next(new UnAuthorizedError("Please login to access this resource."));
  const isBlackListed = await redis.get(`blacklist:${token}`);
  if (isBlackListed)
    return next(new UnAuthorizedError("Token is blacklisted."));
  jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
    if (error) return next(new UnAuthorizedError("Invalid token."));

    try {
      const user = await AuthModel.findById(decoded.id).populate("role");
      if (!user) return next(new UnAuthorizedError("User not found."));

      req.user = {
        _id: user._id,
        role: user.role?.name || null,
      };

      next();
    } catch (err) {
      return next(new UnAuthorizedError("Error fetching user info."));
    }
  });
};
module.exports = authMiddleware;
